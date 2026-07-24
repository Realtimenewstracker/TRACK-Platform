import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { fetchAndStoreNews } from '../services/rssService.js';
import { aiQueue } from './aiQueue.js';
import { getIo } from '../server.js';

// Create the News Ingestion Queue using shared connection
export const newsQueue = new Queue('news-ingestion', { connection: redisConnection });

// Worker: processes one ingestion cycle at a time to prevent duplicate articles
const newsWorker = new Worker('news-ingestion', async (job) => {
  console.log(`[News Queue] Starting job ${job.id} — Fetching Latest News...`);

  try {
    const newArticles = await fetchAndStoreNews();

    if (newArticles && newArticles.length > 0) {
      console.log(`[News Queue] Ingested ${newArticles.length} new article(s).`);

      const io = getIo();
      if (io) {
        io.emit('live_news_update', newArticles);
      }

      // Push each article into the AI queue for Gemini analysis
      for (const article of newArticles) {
        await aiQueue.add(
          'analyze-article',
          { articleId: article._id },
          {
            attempts: 5,
            // Exponential backoff starting at 65 s so Gemini's "retry in ~33s"
            // window is always covered before the next attempt.
            // Delays: 65s → 130s → 260s → 520s → 1040s
            backoff: { type: 'exponential', delay: 65000 },
            // Prevent Redis from accumulating thousands of stale jobs across
            // restarts — all those jobs would re-flood the API on every deploy.
            removeOnComplete: { count: 200 },
            removeOnFail:     { count: 500 }
          }
        );
        console.log(`[News Queue] Pushed article ${article._id} to AI Queue.`);
      }
    } else {
      console.log('[News Queue] No new articles found this cycle.');
    }
  } catch (error) {
    console.error(`[News Queue] Job ${job.id} failed:`, error.message);
    throw error;
  }
}, {
  connection: redisConnection,
  concurrency: 1
});

newsWorker.on('failed', (job, err) => {
  console.error(`[News Queue — FATAL] Job ${job?.id ?? 'unknown'} failed:`, err.message);
});
