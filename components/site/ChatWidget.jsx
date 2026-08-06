'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, RotateCcw } from 'lucide-react'

const GREETING =
  'Hi! I can answer questions about visas, our services and the countries we cover. What would you like to know?'

const SUGGESTIONS = [
  'What visa services do you offer?',
  'Which countries do you cover?',
  'How do I book a consultation?',
]

/**
 * Streaming chat bubble backed by /api/chat.
 *
 * Answers stream in token by token, so the visitor sees text moving rather than
 * a spinner. An in-flight request is aborted when the widget closes or the
 * visitor resets the thread — no point paying for tokens nobody will read.
 */
export default function ChatWidget({ waNumber }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)
  const abortRef = useRef(null)

  // Keep the newest message in view as tokens arrive.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, busy])

  useEffect(() => () => abortRef.current?.abort(), [])

  const reset = () => {
    abortRef.current?.abort()
    setMessages([{ role: 'assistant', content: GREETING }])
    setError('')
    setBusy(false)
  }

  async function send(text) {
    const question = (text ?? input).trim()
    if (!question || busy) return

    setInput('')
    setError('')
    setBusy(true)

    // The assistant turn starts empty and fills in as the stream arrives.
    const history = [...messages, { role: 'user', content: question }]
    setMessages([...history, { role: 'assistant', content: '' }])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Drop the local greeting — it isn't part of the model's conversation.
        body: JSON.stringify({ messages: history.slice(1) }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        const detail = await res.json().catch(() => null)
        throw new Error(detail?.error?.message || 'The assistant is unavailable right now.')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: acc }
          return next
        })
      }
      if (!acc.trim()) throw new Error('No response received. Please try again.')
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError(err?.message || 'Something went wrong.')
      // Remove the empty assistant bubble so the thread doesn't show a blank.
      setMessages((prev) => (prev[prev.length - 1]?.content ? prev : prev.slice(0, -1)))
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  const close = () => {
    abortRef.current?.abort()
    setOpen(false)
  }

  return (
    <>
      {open && (
        <div className="flex h-[30rem] w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-navy-800/10 bg-white shadow-2xl dark:border-white/10 dark:bg-navy-800">
          <div className="flex items-center justify-between border-b border-navy-800/10 bg-navy-900 px-4 py-3 text-white dark:border-white/10">
            <div>
              <div className="font-heading text-sm font-bold">Rihla Assistant</div>
              <div className="text-[11px] text-white/60">Ask about visas & services</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reset}
                aria-label="Start over"
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-navy-900 dark:bg-navy-900 dark:text-gray-100'
                  }`}
                >
                  {m.content || (
                    <span className="inline-flex gap-1 py-1" aria-label="Assistant is typing">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-800/40 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-800/40 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-800/40" />
                    </span>
                  )}
                </div>
              </div>
            ))}

            {messages.length === 1 && !busy && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-full border border-navy-800/15 px-3 py-1.5 text-[11px] font-medium text-navy-800 transition hover:border-green-600/40 hover:text-green-700 dark:border-white/15 dark:text-gray-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {error}{' '}
                {waNumber && (
                  <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="underline">
                    Message us on WhatsApp
                  </a>
                )}
              </p>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-center gap-2 border-t border-navy-800/10 p-3 dark:border-white/10"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Your message"
              maxLength={2000}
              className="w-full rounded-full border border-navy-800/15 px-3.5 py-2 text-sm text-navy-900 outline-none transition focus:border-green-500 dark:border-white/15 dark:bg-navy-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-600 text-white transition hover:bg-green-700 disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </form>

          <p className="px-3 pb-2 text-center text-[10px] text-navy-800/40 dark:text-gray-400">
            AI assistant — please confirm details with our team.
          </p>
        </div>
      )}

      <button
        onClick={() => (open ? close() : setOpen(true))}
        className="grid h-12 w-12 place-items-center self-end rounded-full bg-navy-800 text-white shadow-lg transition hover:bg-navy-900"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </>
  )
}
