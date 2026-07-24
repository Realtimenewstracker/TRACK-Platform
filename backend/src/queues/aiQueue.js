import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import News from '../models/News.js';
import { analyzeNewsArticle } from '../services/aiService.js';
import { evaluateNewsAlerts } from '../services/alertService.js';
import { getIo } from '../server.js';

// Create the AI Analysis Queue using shared connection
export const aiQueue = new Queue('ai-analysis', { connection: redisConnection });

// Worker: analyzes articles with Gemini.
// Free-tier limit for gemini-2.0-flash-lite: 30 RPM / 1500 RPD.
// We cap at 10 RPM (GEMINI_RPM env var) with concurrency=1 to stay well inside quota.
const aiWorker = new Worker('ai-analysis', async (job) => {
  const { articleId } = job.data;
  console.log(`[AI Queue] Analyzing article: ${articleId}`);

  try {
    const article = await News.findById(articleId);
    if (!article) throw new Error(`Article ${articleId} not found in database.`);

    // Skip if already processed (safe guard against duplicate jobs)
    if (article.isAnalyzed) {
      console.log(`[AI Queue] Article ${articleId} already analyzed. Skipping.`);
      return;
    }

    const textToAnalyze = article.rawContent || article.title;
    const aiResult = await analyzeNewsArticle(article.title, textToAnalyze);

    // Write AI insights back to the article document
    article.isAnalyzed        = true;
    article.aiSummary         = aiResult.summary;
    article.importance        = aiResult.importance;
    article.confidenceScore   = aiResult.confidenceScore;
    article.positiveStocks    = aiResult.positiveStocks    || [];
    article.negativeStocks    = aiResult.negativeStocks    || [];
    article.affectedSectors   = aiResult.affectedSectors   || [];
    article.countries         = aiResult.countries         || [];
    article.themes            = aiResult.themes            || [];
    article.reason            = aiResult.reason;

    await article.save();
    console.log(`[AI Queue] Saved analysis for article: ${articleId}`);

    // Fire smart alert evaluation (checks portfolio rules)
    await evaluateNewsAlerts(article);

    // Broadcast the enriched article to all connected frontend clients
    const io = getIo();
    if (io) {
      io.emit('news_analyzed', article);
    }
  } catch (error) {
    const is429 = error.message?.includes('429') || error.message?.includes('Too Many Requests');
    if (is429) {
      // Extract the suggested retry delay from the Gemini error body when available
      const match = error.message.match(/retry in (\d+(?:\.\d+)?)s/i);
      const suggestedDelay = match ? Math.ceil(parseFloat(match[1])) : 60;
      console.warn(`[AI Queue] Rate-limited on article ${articleId}. Gemini says retry in ${suggestedDelay}s. BullMQ will handle backoff.`);
    } else {
      console.error(`[AI Queue] Job ${job.id} failed for article ${articleId}:`, error.message);
    }
    throw error; // always re-throw so BullMQ applies the backoff/retry policy
  }
}, {
  connection: redisConnection,
  concurrency: 1, // one at a time — prevents burst spikes against the RPM cap
  limiter: {
    max: parseInt(process.env.GEMINI_RPM) || 10, // 10 RPM; well below free-tier 30 RPM ceiling
    duration: 60 * 1000
  }
});

aiWorker.on('failed', (job, err) => {
  console.error(`[AI Queue — FATAL] Job ${job?.id ?? 'unknown'} failed after retries:`, err.message);
});
        
