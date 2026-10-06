import { useLanguage } from '../contexts/LanguageContext'
import StatusBadge, { computeStatus } from './StatusBadge'
import { formatBytes } from '../utils/pdfUtils'
import { formatDate } from '../utils/formatDate'
import './MatchingPanel.css'

/**
 * autoMatch — suggests matches based on filename similarity.
 * Returns a new matches object (reqId → entryId).
 */
function autoMatch(requirements, pdfEntries, existingMatches) {
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const usedEntryIds = new Set(Object.values(existingMatches).filter(Boolean))
  const newMatches = { ...existingMatches }

  for (const req of requirements) {
    if (newMatches[req.id]) continue  // already matched
    const keywords = [
      ...normalize(req.title_en).split('').reduce((acc, _, i, arr) => {
        // extract significant words (3+ chars)
        return acc
      }, []),
      normalize(req.title_en),
      normalize(req.id),
    ]
    // Use a simple approach: check if filename contains any keyword from title
    const titleWords = req.title_en
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length >= 3)

    let bestEntry = null
    let bestScore = 0

    for (const entry of pdfEntries) {
      if (usedEntryIds.has(entry.id)) continue
      if (entry.isDuplicate) continue

      const fname = normalize(entry.file.name)
      let score = 0
      for (const word of titleWords) {
        if (fname.includes(normalize(word))) score++
      }
      if (score > bestScore) {
        bestScore = score
        bestEntry = entry
      }
    }

    if (bestEntry && bestScore > 0) {
      newMatches[req.id] = bestEntry.id
      usedEntryIds.add(bestEntry.id)
    }
  }
  return newMatches
}

/**
 * MatchingPanel
 *
 * The core matching interface:
 * - For each requirement, shows a dropdown to pick an uploaded PDF
 * - If has_expiry, shows a date input
 * - Status badge updates live
 * - Duplicate files cannot be assigned to different requirements
 *
 * @param {{
 *   requirements: Requirement[],
 *   tender: Tender,
 *   pdfEntries: PdfEntry[],
 *   matches: Record<string, string>,      reqId → pdfEntry.id
 *   expiryDates: Record<string, string>,  reqId → "YYYY-MM-DD"
 *   onMatchChange:   (reqId, entryId|null) => void
 *   onExpiryChange:  (reqId, date) => void
 * }} props
 */
export default function MatchingPanel({
  requirements,
  tender,
  pdfEntries,
  matches,
  expiryDates,
  onMatchChange,
  onExpiryChange,
  onAutoMatch,
}) {
  const { lang, t } = useLanguage()

  // Count blocking issues for the summary bar
  const blockingCount = requirements.filter(req => {
    const entryId = matches[req.id] ?? null
    const file    = entryId ? (pdfEntries.find(e => e.id === entryId)?.file ?? null) : null
    const expiry  = expiryDates[req.id] ?? null
    const status  = computeStatus(req, file, expiry, tender.submission_deadline)
    return ['missing', 'expiry_needed', 'expired'].includes(status)
  }).length

  const matchedCount = Object.keys(matches).length
  const okCount = requirements.filter(req => {
    const entryId = matches[req.id] ?? null
    const file    = entryId ? (pdfEntries.find(e => e.id === entryId)?.file ?? null) : null
    const expiry  = expiryDates[req.id] ?? null
    return computeStatus(req, file, expiry, tender.submission_deadline) === 'ok'
  }).length

  // How many non-duplicate entries are available for auto-match
  const availableForAutoMatch = pdfEntries.filter(e => !e.isDuplicate && !Object.values(matches).includes(e.id)).length

  function handleAutoMatch() {
    const newMatches = autoMatch(requirements, pdfEntries, matches)
    // Apply all new matches by calling onMatchChange for each new one
    for (const [reqId, entryId] of Object.entries(newMatches)) {
      if (!matches[reqId] && entryId) {
        onMatchChange(reqId, entryId)
      }
    }
  }

  return (
    <div className="matching-panel">

      {/* Summary bar */}
      <div className="matching-panel__summary">
        <div className="mp-stat">
          <span className="mp-stat__num">{requirements.length}</span>
          <span className="mp-stat__label">Total</span>
        </div>
        <div className="mp-stat">
          <span className="mp-stat__num">{matchedCount}</span>
          <span className="mp-stat__label">Matched</span>
        </div>
        <div className={`mp-stat ${okCount > 0 ? 'mp-stat--ok' : ''}`}>
          <span className="mp-stat__num">{okCount}</span>
          <span className="mp-stat__label">OK</span>
        </div>
        {blockingCount > 0 && (
          <div className="mp-stat mp-stat--alert">
            <span className="mp-stat__num">{blockingCount}</span>
            <span className="mp-stat__label">Blocking</span>
          </div>
        )}
        {blockingCount === 0 && matchedCount > 0 && (
          <div className="mp-stat mp-stat--ready">
            <span className="mp-stat__num">✓</span>
            <span className="mp-stat__label">Ready</span>
          </div>
        )}

        {/* Auto-match button */}
        {availableForAutoMatch > 0 && (
          <button
            id="btn-auto-match"
            className="mp-auto-match-btn"
            onClick={handleAutoMatch}
            title="Suggest matches based on file names"
          >
            ✨ Auto-Match
          </button>
        )}
      </div>

      {/* Requirement rows */}
      <div className="matching-panel__rows">
        {requirements.map(req => (
          <MatchRow
            key={req.id}
            req={req}
            lang={lang}
            t={t}
            tender={tender}
            pdfEntries={pdfEntries}
            matches={matches}
            expiryDates={expiryDates}
            onMatchChange={onMatchChange}
            onExpiryChange={onExpiryChange}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   MatchRow — one requirement row with dropdown + optional expiry
───────────────────────────────────────────────────────────────── */
function MatchRow({ req, lang, t, tender, pdfEntries, matches, expiryDates, onMatchChange, onExpiryChange }) {
  const selectedEntryId = matches[req.id] ?? ''
  const selectedEntry   = pdfEntries.find(e => e.id === selectedEntryId) ?? null
  const expiry          = expiryDates[req.id] ?? ''

  const status = computeStatus(
    req,
    selectedEntry?.file ?? null,
    expiry || null,
    tender.submission_deadline
  )

  const title = lang === 'bn' ? req.title_bn : req.title_en

  // Which entries are already used by OTHER requirements?
  const usedByOther = new Set(
    Object.entries(matches)
      .filter(([rid, eid]) => rid !== req.id && eid)
      .map(([, eid]) => eid)
  )

  // Available entries for this row: not used elsewhere AND not a duplicate
  // Duplicates are NEVER selectable — spec §4.6
  const availableEntries = pdfEntries.filter(
    e => !usedByOther.has(e.id) && !e.isDuplicate
  )
  // If currently selected entry is a duplicate (shouldn't happen, but guard)
  // do NOT add it back — force user to clear and pick a valid one

  const isExpired     = status === 'expired'
  const expiryNeeded  = status === 'expiry_needed'

  return (
    <div className={`match-row match-row--${status}`}>
      {/* Order + Title */}
      <div className="match-row__header">
        <span className="match-row__order">
          {String(req.order).padStart(2, '0')}
        </span>
        <div className="match-row__title-group">
          <span className="match-row__title">{title}</span>
          <div className="match-row__tags">
            <span className={`req-tag ${req.mandatory ? 'req-tag--mandatory' : 'req-tag--optional'}`}>
              {req.mandatory ? t.mandatory : t.optional}
            </span>
            {req.has_expiry && (
              <span className="req-tag req-tag--expiry">⏱ {t.hasExpiry}</span>
            )}
          </div>
        </div>
        <div className="match-row__status-col">
          <StatusBadge status={status} t={t} />
        </div>
      </div>

      {/* Controls */}
      <div className="match-row__controls">
        {/* File selector */}
        <div className="match-row__field">
          <label
            htmlFor={`match-select-${req.id}`}
            className="match-row__field-label"
          >
            📄 Matched File
          </label>
          <div className="match-row__select-wrap">
            <select
              id={`match-select-${req.id}`}
              className={`match-row__select ${selectedEntryId ? 'match-row__select--has-value' : ''}`}
              value={selectedEntryId}
              onChange={e => onMatchChange(req.id, e.target.value || null)}
              aria-label={`Select file for ${title}`}
            >
              <option value="">— No file selected —</option>
              {availableEntries.map(entry => (
                <option key={entry.id} value={entry.id}>
                  {entry.file.name}
                  {entry.pages > 0 ? ` (${entry.pages}p)` : ''}
                  {' · '}
                  {formatBytes(entry.file.size)}
                </option>
              ))}
            </select>
            {selectedEntryId && (
              <button
                className="match-row__clear"
                onClick={() => onMatchChange(req.id, null)}
                aria-label={`Remove match for ${title}`}
                title="Remove match"
              >✕</button>
            )}
          </div>

          {/* Show selected file info */}
          {selectedEntry && (
            <div className="match-row__file-info">
              <span className="match-row__file-pages">
                {selectedEntry.pages > 0 ? `${selectedEntry.pages} page${selectedEntry.pages > 1 ? 's' : ''}` : 'Unreadable'}
              </span>
              <span className="match-row__file-size">
                {formatBytes(selectedEntry.file.size)}
              </span>
              {selectedEntry.isDuplicate && (
                <span className="match-row__dup-warn">⚠️ Duplicate content</span>
              )}
            </div>
          )}
        </div>

        {/* Expiry date — only shown if has_expiry and file is matched */}
        {req.has_expiry && selectedEntry && (
          <div className="match-row__field">
            <label
              htmlFor={`expiry-${req.id}`}
              className={`match-row__field-label ${expiryNeeded || isExpired ? 'match-row__field-label--alert' : ''}`}
            >
              📅 Expiry Date
              {expiryNeeded && <span className="match-row__required-flag"> (required)</span>}
              {isExpired && <span className="match-row__expired-flag"> — EXPIRED</span>}
            </label>
            <input
              id={`expiry-${req.id}`}
              type="date"
              className={`match-row__date-input ${isExpired ? 'match-row__date-input--expired' : ''} ${expiryNeeded ? 'match-row__date-input--needed' : ''}`}
              value={expiry}
              onChange={e => onExpiryChange(req.id, e.target.value)}
              aria-label={`Expiry date for ${title}`}
              aria-describedby={`expiry-hint-${req.id}`}
            />
            <p id={`expiry-hint-${req.id}`} className="match-row__expiry-hint">
              Submission deadline: <strong>{formatDate(tender.submission_deadline, lang)}</strong>
              {' — '}document must expire on or after this date.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
