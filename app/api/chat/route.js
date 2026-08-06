import { streamChat, HANDOFF } from '../../../lib/chat.js'
import { rateLimit } from '../../../lib/ratelimit.js'
import { fail, getClientIp } from '../../../lib/api.js'
import { flags } from '../../../lib/env.js'
import { logger } from '../../../lib/logger.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_TURNS = 20 // conversation length a visitor can accumulate
const MAX_CHARS = 2000 // per message

/** Keep only well-formed alternating text turns — never trust the client. */
function sanitize(raw) {
  if (!Array.isArray(raw)) return null
  const turns = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({ role: m.role, content: String(m.content ?? '').slice(0, MAX_CHARS).trim() }))
    .filter((m) => m.content)
    .slice(-MAX_TURNS)

  // The API requires the first turn to be a user turn.
  while (turns.length && turns[0].role !== 'user') turns.shift()
  if (!turns.length || turns[turns.length - 1].role !== 'user') return null
  return turns
}

export async function POST(req) {
  if (!flags.hasChat) {
    return fail('chat_disabled', 'The chat assistant is not configured.', { status: 503 })
  }

  const ip = getClientIp(req)
  const { success } = await rateLimit(`chat:${ip}`, { limit: 20, window: '10 m' })
  if (!success) {
    return fail('rate_limited', 'Too many messages — please try again in a few minutes.', {
      status: 429,
    })
  }

  let messages
  try {
    const body = await req.json()
    messages = sanitize(body?.messages)
  } catch {
    return fail('bad_request', 'Malformed request body.')
  }
  if (!messages) return fail('bad_request', 'No question to answer.')

  let stream
  try {
    stream = await streamChat(messages)
  } catch (err) {
    logger.error?.('[chat] could not start stream', err?.message)
    return fail('chat_unavailable', 'The assistant is unavailable right now.', { status: 502 })
  }

  const encoder = new TextEncoder()
  const body = new ReadableStream({
    async start(controller) {
      // Tracked as text, not a byte count: a turn that emits only whitespace
      // has said nothing, and must still fall through to the handoff rather
      // than leaving the visitor staring at an empty bubble.
      let sent = ''
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
            sent += event.delta.text
          }
        }
        // A safety classifier can decline the turn; that arrives as a normal
        // response, not an error. Say something useful rather than nothing.
        const final = await stream.finalMessage()
        if (!sent.trim() && final?.stop_reason === 'refusal') {
          controller.enqueue(encoder.encode(HANDOFF))
        }
      } catch (err) {
        logger.error?.('[chat] stream failed', err?.message)
        // Mid-stream failure: close out the bubble with something readable
        // instead of leaving a half-finished sentence on screen.
        if (!sent.trim()) controller.enqueue(encoder.encode(HANDOFF))
      } finally {
        controller.close()
      }
    },
    cancel() {
      stream.abort?.() // visitor closed the widget — stop paying for tokens
    },
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  })
}
