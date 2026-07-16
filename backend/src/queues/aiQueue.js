import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import News from '../models/News.js';
import { analyzeNewsArticle } from '../services/aiService.js';
import { evaluateNewsAlerts } from '../services/alertService.js';
import { getIo } from '../server.js'; // To emit real-time updates

// 1. Establish Redis Connection (Required for BullMQ)
const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null // Required by BullMQ
});

// 2. Create the AI Processing Queue
export const aiQueue = new Queue('ai-analysis', { connection });

// 3. Define the Worker logic
const aiWorker = new Worker('ai-analysis', async job => {
  const { articleId } = job.data;
  
  console.log("[AI Queue] Starting analysis for article ID: " + articleId);
  
  try {
    // A. Fetch the raw article from DB
    const article = await News.findById(articleId);
    if (!article) {
      throw new Error("Article " + articleId + " not found in database.");
    }
    
    // Prevent double-processing
    if (article.isAnalyzed) {
      console.log("[AI Queue] Article " + articleId + " already analyzed. Skipping.");
      return;
    }

    // B. Pass text to Gemini AI (fallback to title if content is missing)
    const textToAnalyze = article.rawContent || article.title;
    const aiResult = await analyzeNewsArticle(article.title, textToAnalyze);

    // C. Update the MongoDB document with AI insights
    article.isAnalyzed = true;
    article.aiSummary = aiResult.summary;
    article.importance = aiResult.importance;
    article.confidenceScore = aiResult.confidenceScore;
    article.positiveStocks = aiResult.positiveStocks || [];
    article.negativeStocks = aiResult.negativeStocks || [];
    article.affectedSectors = aiResult.affectedSectors || [];
    article.countries = aiResult.countries || [];
    article.themes = aiResult.themes || [];
    article.reason = aiResult.reason;

    // Save the enriched article to MongoDB
    await article.save();
    console.log("[AI Queue] Successfully analyzed & saved article: " + articleId);

    // D. Trigger Smart Alerts Engine (Feature 8)
    // Checks if this newly analyzed article violates any user's active portfolio/theme rules
    await evaluateNewsAlerts(article);

    // E. Broadcast the enriched article to all connected React clients via Socket.IO
    const io = getIo();
    if (io) {
      io.emit('news_analyzed', article);
    }

  } catch (error) {
    console.error("[AI Queue] Job " + job.id + " failed for article " + articleId + ":", error.message);
    throw error; // Throwing the error tells BullMQ to retry the job based on backoff settings
  }
}, { 
  connection,
  concurrency: 2, // Only process 2 articles at the exact same time to avoid overwhelming Gemini
  limiter: {
    max: 14, // Max 14 jobs...
    duration: 1000 * 60 // ...per 1 minute (Ensures we stay within free tier Gemini API rate limits)
  }
});

// Global error listener for the worker
aiWorker.on('failed', (job, err) => {
  const jobId = job ? job.id : 'unknown';
  console.error("[AI Queue - FATAL] Job " + jobId + " completely failed after retries:", err);
});
