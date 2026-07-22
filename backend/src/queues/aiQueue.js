import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import News from '../models/News.js';
import { analyzeNewsArticle } from '../services/aiService.js';
import { evaluateNewsAlerts } from '../services/alertService.js';
import { getIo } from '../server.js';

// Create the AI Analysis Queue using shared connection
export const aiQueue = new Queue('ai-analysis', { connection: redisConnection });

// Worker: analyzes articles with Gemini, respects free-tier rate limit (14 RPM)
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
    console.error(`[AI Queue] Job ${job.id} failed for article ${articleId}:`, error.message);
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 2,
  limiter: {
    max: parseInt(process.env.GEMINI_RPM) || 14,
    duration: 60 * 1000
  }
});

aiWorker.on('failed', (job, err) => {
  console.error(`[AI Queue — FATAL] Job ${job?.id ?? 'unknown'} failed after retries:`, err.message);
});
