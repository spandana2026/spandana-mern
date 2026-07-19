import mongoose from 'mongoose';
import { env } from './env.js';

let _connected = false;

export async function connectDB() {
  if (!env.MONGO_URI) {
    console.info('[db] MONGO_URI not set — using JSON file storage (zero-config mode)');
    return;
  }
  try {
    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    _connected = true;
    console.info('[db] MongoDB connected');
    mongoose.connection.on('disconnected', () => { _connected = false; console.warn('[db] MongoDB disconnected — falling back to JSON storage'); });
    mongoose.connection.on('reconnected',  () => { _connected = true;  console.info('[db] MongoDB reconnected'); });
  } catch (err) {
    console.warn('[db] MongoDB connection failed — using JSON file storage:', err.message);
  }
}

export const isDbConnected = () => _connected && mongoose.connection.readyState === 1;
