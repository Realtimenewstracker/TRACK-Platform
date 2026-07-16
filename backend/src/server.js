```javascript
import 'dotenv/config'; // Loads variables from your .env file
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import custom routes and queues (ensure these files exist in their respective folders)
import chatRoutes from './routes/chatRoutes.js';
// Note: We import the queues so they instantiate and start listening to Redis when the server starts
import { newsQueue } from './queues/newsQueue.js';
import { aiQueue } from './queues/aiQueue.js';

const app = express();
const server = http.createServer(app);

// --- 1. Middleware ---
// Security headers
app.use(helmet()); 
// Allow requests from your frontend
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}));
// Parse JSON bodies
app.use(express.json());
// HTTP request logger (helpful for debugging)
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
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    
    // Example: User authenticates and joins their private notification room
    socket.on('join_user_room', (userId) => {
      socket.join(userId);
      console.log(`[Socket.IO] User ${userId} joined their private room.`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
  return io;
};

// Expose io for our services (like alertService) to broadcast messages
export const getIo = () => io;

// --- 3. API Routes ---
// Health Check for Render deployment/monitoring
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'TRACK API Engine is running.',
    timestamp: new Date()
  });
});

// Mount the AI Chat API (Feature 7 & 9)
app.use('/api/chat', chatRoutes);

// --- 4. Database Connection & Server Initialization ---
const PORT = process.env.PORT || 5000;

console.log('[System] Initializing TRACK Backend...');

// Use the MONGODB_URI from your .env file
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Successfully connected to Atlas Cluster.');
    
    // Initialize WebSockets
    initIo(server);
    
    // Start listening for HTTP traffic
    server.listen(PORT, () => {
      console.log(`[Server] Core engine running on port ${PORT}`);
      
      // Optional: Trigger an initial news fetch when the server starts
      // newsQueue.add('fetch-news-startup', {}, { removeOnComplete: true });
    });
  })
  .catch(err => {
    console.error('[MongoDB] Connection FATAL ERROR:');
    console.error(err.message);
    console.error('Please check your MONGODB_URI in the .env file and ensure your IP is whitelisted in Atlas.');
    process.exit(1); // Exit if we can't connect to the DB
  });


```
