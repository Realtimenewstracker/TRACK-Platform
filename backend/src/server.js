import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Routes
import authRoutes from './routes/authRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Queues
import { newsQueue } from './queues/newsQueue.js';

const app = express();
const server = http.createServer(app);

// --- 1. Middleware ---
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// --- 2. WebSocket Setup ---
let io;
export const initIo = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('[Socket.IO] Client connected: ' + socket.id);

    // Each user joins a private room so alerts are only sent to them
    socket.on('join_user_room', (userId) => {
      socket.join(userId);
      console.log('[Socket.IO] User ' + userId + ' joined their private room.');
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO] Client disconnected: ' + socket.id);
    });
  });

  return io;
};

export const getIo = () => io;

// --- 3. API Routes ---
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'TRACK API Engine is running.',
    timestamp: new Date()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// --- 4. Database + Queue Initialization ---
const PORT = process.env.PORT || 5000;
const FETCH_INTERVAL_MS = parseInt(process.env.FETCH_INTERVAL_MS) || 5 * 60 * 1000;

console.log('[System] Initializing TRACK Backend...');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('[MongoDB] Successfully connected to Atlas Cluster.');

    initIo(server);

    // Clear any stale repeat jobs from previous deployments, then re-schedule
    const existingJobs = await newsQueue.getRepeatableJobs();
    for (const job of existingJobs) {
      await newsQueue.removeRepeatableByKey(job.key);
    }

    await newsQueue.add(
      'scheduled-fetch',
      {},
      {
        repeat: { every: FETCH_INTERVAL_MS },
        removeOnComplete: true,
        removeOnFail: false
      }
    );
    console.log(`[News Queue] Scheduled news fetch every ${FETCH_INTERVAL_MS / 60000} minute(s).`);

    server.listen(PORT, () => {
      console.log(`[Server] Core engine running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[MongoDB] Connection FATAL ERROR:', err.message);
    process.exit(1);
  });
