import 'dotenv/config'; 
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import chatRoutes from './routes/chatRoutes.js';
import { newsQueue } from './queues/newsQueue.js';
import { aiQueue } from './queues/aiQueue.js';

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
      methods: ["GET", "POST"] 
    }
  });
  
  io.on('connection', (socket) => {
    console.log("[Socket.IO] Client connected: " + socket.id);
    
    socket.on('join_user_room', (userId) => {
      socket.join(userId);
      console.log("[Socket.IO] User " + userId + " joined their private room.");
    });

    socket.on('disconnect', () => {
      console.log("[Socket.IO] Client disconnected: " + socket.id);
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

app.use('/api/chat', chatRoutes);

// --- 4. Database Connection & Server Initialization ---
const PORT = process.env.PORT || 5000;

console.log('[System] Initializing TRACK Backend...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Successfully connected to Atlas Cluster.');
    
    initIo(server);
    
    server.listen(PORT, () => {
      console.log("[Server] Core engine running on port " + PORT);
    });
  })
  .catch(err => {
    console.error('[MongoDB] Connection FATAL ERROR:');
    console.error(err.message);
    process.exit(1);
  });
