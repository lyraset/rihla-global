/**
 * Display formatting for admin screens.
 *
 * Timestamps are pinned to the office timezone rather than the server's. These
 * screens render on Vercel, whose servers run UTC, so an unpinned formatter
 * showed a lead that arrived at 3:43 PM in Islamabad as "10:43" — five hours
 * adrift, with nothing on screen to reveal it. A lead's time should read as the
 * moment it landed in the office, wherever the code happens to be running.
 */
export const BUSINESS_TZ = 'Asia/Karachi'

const DATE_TIME = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: BUSINESS_TZ,
})

/** e.g. "6 Aug 2026, 3:43 PM" — 12-hour with an explicit AM/PM. */
export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  // en-GB gives the day-first order we want but lowercases the period; rebuild
  // from parts so "pm" reads as "PM" without string-replacing the whole output.
  return DATE_TIME.formatToParts(date)
    .map((p) => (p.type === 'dayPeriod' ? p.value.toUpperCase() : p.value))
    .join('')
}
