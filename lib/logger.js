/* Minimal structured logger. Swap for pino/axiom later without touching callers. */
const fmt = (level, msg, meta) =>
  JSON.stringify({ level, msg, ...(meta ? { meta } : {}), t: new Date().toISOString() })

export const logger = {
  info: (msg, meta) => console.log(fmt('info', msg, meta)),
  warn: (msg, meta) => console.warn(fmt('warn', msg, meta)),
  error: (msg, meta) => console.error(fmt('error', msg, meta)),
}
