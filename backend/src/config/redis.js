import Redis from 'ioredis';

export const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
});

redisConnection.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redisConnection.on('connect', () => {
  console.log('[Redis] Successfully connected.');
});
