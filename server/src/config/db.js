import mongoose from 'mongoose';
import { env } from './env.js';

// Reuse the connection across serverless invocations (Vercel) and hot reloads.
let connectionPromise = null;

export function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}/${m.connection.name}`);
        return m.connection;
      })
      .catch((err) => {
        connectionPromise = null;
        throw err;
      });
  }
  return connectionPromise;
}
