/**
 * formatDate.js
 * Utility to format ISO date strings for display.
 */

/**
 * Format an ISO date string "YYYY-MM-DD" to a human-readable date.
 * @param {string} isoDate
 * @param {'en'|'bn'} lang
 * @returns {string}
 */
export function formatDate(isoDate, lang = 'en') {
  if (!isoDate) return '—'

  try {
    // Add time component to avoid timezone off-by-one
    const date = new Date(isoDate + 'T00:00:00')

    const locale = lang === 'bn' ? 'bn-BD' : 'en-GB'

    return date.toLocaleDateString(locale, {
      day:   'numeric',
      month: 'long',
      year:  'numeric',
    })
  } catch {
    return isoDate
  }
}
