import { env, flags } from './env.js'
import { logger } from './logger.js'

const WINDOWS = { '1 m': 60, '10 m': 600, '15 m': 900 }

async function upstashLimit(key, limit, window) {
  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  })
  const rl = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, window), prefix: 'rihla' })
  const { success, remaining } = await rl.limit(key)
  return { success, remaining }
}

/** Serverless-safe fallback when Upstash isn't configured: a Mongo TTL counter. */
async function mongoLimit(key, limit, windowSec) {
  const mongoose = (await import('mongoose')).default
  const { connectDB } = await import('./db.js')
  await connectDB()
  const RateHit =
    mongoose.models._RateHit ||
    mongoose.model(
      '_RateHit',
      new mongoose.Schema({
        key: { type: String, index: true },
        createdAt: { type: Date, default: Date.now, expires: 3600 },
      }),
    )
  await RateHit.create({ key })
  const since = new Date(Date.now() - windowSec * 1000)
  const count = await RateHit.countDocuments({ key, createdAt: { $gte: since } })
  return { success: count <= limit, remaining: Math.max(0, limit - count) }
}

/**
 * Sliding-window rate limit. Uses Upstash when configured, else a Mongo TTL
 * fallback. Fails open (allows the request) if the backend errors — never block
 * a legitimate visitor because the limiter is down.
 */
export async function rateLimit(key, { limit = 5, window = '10 m' } = {}) {
  try {
    if (flags.hasUpstash) return await upstashLimit(key, limit, window)
    return await mongoLimit(key, limit, WINDOWS[window] ?? 600)
  } catch (err) {
    logger.warn('rate limit backend error', { error: String(err) })
    return { success: true, remaining: limit }
  }
}
