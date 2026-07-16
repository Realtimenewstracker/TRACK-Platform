import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { fetchAndStoreNews } from '../services/rssService.js';
import { aiQueue } from './aiQueue.js';
import { getIo } from '../server.js'; // To emit real-time updates

// 1. Establish Redis Connection (Required for BullMQ)
const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
});

// 2. Create the News Ingestion Queue
export const newsQueue = new Queue('news-ingestion', { connection });

// 3. Define the Worker logic
const newsWorker = new Worker('news-ingestion', async job => {
  console.log("[News Queue] Starting job " + job.id + " - Fetching Latest News...");
  
  try {
    // A. Trigger the scraping service
    const newArticles = await fetchAndStoreNews();
    
    if (newArticles && newArticles.length > 0) {
      console.log("[News Queue] Successfully ingested " + newArticles.length + " new articles.");
      
      const io = getIo();
      if (io) {
        // Broadcast raw unanalyzed news to the frontend immediately (optional)
        io.emit('live_news_update', newArticles);
      }

      // B. Push every new article into the AI Queue for Gemini to analyze
      for (const article of newArticles) {
        await aiQueue.add('analyze-article', { 
          articleId: article._id 
        }, {
          attempts: 3, // Retry up to 3 times if Gemini API fails
          backoff: {
            type: 'exponential',
            delay: 5000 // Wait 5s, then 10s, then 20s if it keeps failing
          }
        });
        console.log("[News Queue] Pushed article " + article._id + " to AI Queue.");
      }
    } else {
      console.log("[News Queue] No new articles found during this cycle.");
    }

  } catch (error) {
    console.error("[News Queue] Job " + job.id + " failed: ", error.message);
    throw error;
  }
}, { 
  connection,
  concurrency: 1 // Only run one ingestion cycle at a time to prevent duplicates
});

// Global error listener for the worker
newsWorker.on('failed', (job, err) => {
  const jobId = job ? job.id : 'unknown';
  console.error("[News Queue - FATAL] Job " + jobId + " failed: ", err);
});
