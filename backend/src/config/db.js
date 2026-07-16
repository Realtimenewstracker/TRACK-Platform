```javascript
import mongoose from 'mongoose';

/**
 * Establishes a connection to the MongoDB Atlas cluster.
 * It uses the MONGODB_URI provided in the .env file.
 */
const connectDB = async () => {
  try {
    // Ensure the connection string exists
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is missing from .env file.");
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`[MongoDB] Successfully connected to Atlas Cluster: ${conn.connection.host}`);
  } catch (error) {
    console.error('[MongoDB] Connection FATAL ERROR:');
    console.error(error.message);
    console.error('Please check your MONGODB_URI in the .env file and ensure your IP is whitelisted in Atlas.');
    
    // Exit process with failure code if connection fails
    process.exit(1);
  }
};

export default connectDB;

```
