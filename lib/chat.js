import Anthropic from '@anthropic-ai/sdk'
import { env } from './env.js'
import { buildChatSystemPrompt } from './chat-context.js'

/** Reused across warm serverless invocations, like the mongoose connection. */
let cached = global._anthropic
if (!cached) cached = global._anthropic = { client: null, prompt: null, promptAt: 0 }

export function getAnthropic() {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set — the chat assistant is disabled.')
  }
  if (!cached.client) cached.client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  return cached.client
}

/**
 * The grounding prompt, rebuilt at most once a minute.
 *
 * Without this every message would re-read the whole CMS. A minute of staleness
 * is invisible to a visitor mid-conversation and keeps the prompt bytes stable,
 * which is also what lets the prompt cache hit (see below).
 */
const PROMPT_TTL_MS = 60_000

export async function getSystemPrompt() {
  const now = Date.now()
  if (cached.prompt && now - cached.promptAt < PROMPT_TTL_MS) return cached.prompt
  cached.prompt = await buildChatSystemPrompt()
  cached.promptAt = now
  return cached.prompt
}

/** Visitor-facing text for anything we can't or shouldn't answer. */
export const HANDOFF =
  "I'm not able to answer that one. Our team can help directly — you can reach them on WhatsApp or book a free consultation on the Contact page."

/**
 * Streams an assistant reply.
 *
 * Notes on the request shape:
 * - `system` is one cached block. It is large (every service, country and FAQ)
 *   and byte-stable between requests, so the cache breakpoint turns it into a
 *   ~0.1x read instead of full-price input on every message.
 * - Adaptive thinking at `low` effort rather than thinking disabled: on this
 *   model disabling thinking can leak internal tags into the visible reply, and
 *   low effort already keeps latency and cost down for short chat answers.
 * - `max_tokens` is deliberately small. The prompt asks for two or three
 *   sentences, and this endpoint is public — an unbounded reply is a cost hole.
 * - `fallbacks` re-runs the turn on another model server-side if a safety
 *   classifier declines, so an ordinary visa question never dead-ends.
 */
export async function streamChat(messages) {
  const client = getAnthropic()
  const system = await getSystemPrompt()

  return client.beta.messages.stream({
    model: env.CHAT_MODEL,
    max_tokens: 1024,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    thinking: { type: 'adaptive' },
    output_config: { effort: 'low' },
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages,
  })
}
