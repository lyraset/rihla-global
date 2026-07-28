import mongoose from 'mongoose'
import { env } from './env.js'

/**
 * A single mongoose connection cached across serverless invocations. Without
 * this, every Vercel function cold-start opens a new pool and exhausts Atlas.
 */
let cached = global._mongoose
if (!cached) cached = global._mongoose = { conn: null, promise: null }

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Add it to .env.local (see .env.example) to enable the database.',
    )
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', true)
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB,
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }
  return cached.conn
}
