import { useLanguage } from '../contexts/LanguageContext'
import StatusBadge, { computeStatus } from './StatusBadge'
import './RequirementsList.css'

/**
 * RequirementsList
 * Renders all requirements sorted by `order`.
 * Each row shows: order, title (EN or BN), mandatory tag, has_expiry tag, status badge.
 *
 * @param {{
 *   requirements: import('../utils/parseRequirements').Requirement[],
 *   tender: import('../utils/parseRequirements').Tender,
 *   matches: Record<string, File>,       — reqId → File
 *   expiryDates: Record<string, string>, — reqId → "YYYY-MM-DD"
 * }} props
 */
export default function RequirementsList({ requirements, tender, matches = {}, expiryDates = {} }) {
  const { lang, t } = useLanguage()

  const totalCount    = requirements.length
  const mandatoryCount = requirements.filter(r => r.mandatory).length
  const blockingCount = requirements.filter(r => {
    const status = computeStatus(r, matches[r.id] ?? null, expiryDates[r.id] ?? null, tender.submission_deadline)
    return ['missing', 'expiry_needed', 'expired'].includes(status)
  }).length

  return (
    <section className="req-list" aria-label="Document requirements">
      {/* Summary bar */}
      <div className="req-list__summary">
        <div className="req-list__summary-stat">
          <span className="req-list__summary-num">{totalCount}</span>
          <span className="req-list__summary-label">Total</span>
        </div>
        <div className="req-list__summary-stat">
          <span className="req-list__summary-num">{mandatoryCount}</span>
          <span className="req-list__summary-label">{t.mandatory}</span>
        </div>
        <div className="req-list__summary-stat">
          <span className="req-list__summary-num">{totalCount - mandatoryCount}</span>
          <span className="req-list__summary-label">{t.optional}</span>
        </div>
        {blockingCount > 0 && (
          <div className="req-list__summary-stat req-list__summary-stat--alert">
            <span className="req-list__summary-num">{blockingCount}</span>
            <span className="req-list__summary-label">Blocking</span>
          </div>
        )}
      </div>

      {/* Header row */}
      <div className="req-list__header" role="row">
        <span>#</span>
        <span>Document</span>
        <span>Type</span>
        <span>Status</span>
      </div>

      {/* Requirement rows */}
      <ul className="req-list__rows">
        {requirements.map((req) => {
          const file   = matches[req.id]    ?? null
          const expiry = expiryDates[req.id] ?? null
          const status = computeStatus(req, file, expiry, tender.submission_deadline)
          const title  = lang === 'bn' ? req.title_bn : req.title_en

          return (
            <RequirementRow
              key={req.id}
              req={req}
              title={title}
              status={status}
              file={file}
              t={t}
            />
          )
        })}
      </ul>
    </section>
  )
}

function RequirementRow({ req, title, status, file, t }) {
  return (
    <li className={`req-row req-row--${status}`} role="row">
      {/* Order number */}
      <span className="req-row__order" aria-label={`Item ${req.order}`}>
        {String(req.order).padStart(2, '0')}
      </span>

      {/* Title + file name */}
      <div className="req-row__title-col">
        <span className="req-row__title">{title}</span>
        {file ? (
          <span className="req-row__filename" title={file.name}>
            📎 {file.name}
          </span>
        ) : (
          <span className="req-row__no-file">No file matched</span>
        )}
      </div>

      {/* Tags */}
      <div className="req-row__tags">
        <span className={`req-tag ${req.mandatory ? 'req-tag--mandatory' : 'req-tag--optional'}`}>
          {req.mandatory ? t.mandatory : t.optional}
        </span>
        {req.has_expiry && (
          <span className="req-tag req-tag--expiry" title="This document has an expiry date">
            ⏱ {t.hasExpiry}
          </span>
        )}
      </div>

      {/* Status */}
      <div className="req-row__status">
        <StatusBadge status={status} t={t} />
      </div>
    </li>
  )
}
