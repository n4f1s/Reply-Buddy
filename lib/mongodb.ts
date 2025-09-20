import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) throw new Error('Please define MONGODB_URI in .env.local')

// Extend NodeJS global type to store cached connection
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

// Initialize global._mongoose if not present
global._mongoose = global._mongoose || { conn: null, promise: null }

export async function connectDB () {
  try {
    if (global._mongoose.conn) return global._mongoose.conn

    if (!global._mongoose.promise) {
      global._mongoose.promise = mongoose.connect(MONGODB_URI, {
        dbName: 'reply_buddy'
      })
    }

    global._mongoose.conn = await global._mongoose.promise

    console.log('✅ MongoDB connected successfully!')
    return global._mongoose.conn
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error 
  }
}
