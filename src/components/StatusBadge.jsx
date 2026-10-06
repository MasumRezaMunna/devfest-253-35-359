import './StatusBadge.css'

/**
 * Status values and their display config.
 * 'blocking' drives UI warnings — non-blocking statuses don't prevent package generation.
 */
export const STATUS = {
  MISSING:        'missing',
  EXPIRY_NEEDED:  'expiry_needed',
  EXPIRED:        'expired',
  NOT_PROVIDED:   'not_provided',
  OK:             'ok',
}

const STATUS_CONFIG = {
  [STATUS.MISSING]:       { labelKey: 'statusMissing',      variant: 'error',   blocking: true  },
  [STATUS.EXPIRY_NEEDED]: { labelKey: 'statusExpiryNeeded', variant: 'warn',    blocking: true  },
  [STATUS.EXPIRED]:       { labelKey: 'statusExpired',      variant: 'error',   blocking: true  },
  [STATUS.NOT_PROVIDED]:  { labelKey: 'statusNotProvided',  variant: 'neutral', blocking: false },
  [STATUS.OK]:            { labelKey: 'statusOk',           variant: 'ok',      blocking: false },
}

/**
 * Compute the status of a requirement given its current state.
 *
 * @param {object} req          — requirement from requirements.json
 * @param {File|null} file      — matched PDF file (or null)
 * @param {string|null} expiry  — expiry date string "YYYY-MM-DD" (or null)
 * @param {string} deadline     — tender submission_deadline "YYYY-MM-DD"
 * @returns {string}            — one of the STATUS constants
 */
export function computeStatus(req, file, expiry, deadline) {
  const hasFile = !!file

  if (!hasFile) {
    return req.mandatory ? STATUS.MISSING : STATUS.NOT_PROVIDED
  }

  if (req.has_expiry) {
    if (!expiry) return STATUS.EXPIRY_NEEDED

    // Expired means expiry is strictly BEFORE deadline
    // If expiry === deadline → OK (per spec)
    const expiryDate   = new Date(expiry   + 'T00:00:00')
    const deadlineDate = new Date(deadline + 'T00:00:00')

    if (expiryDate < deadlineDate) return STATUS.EXPIRED
  }

  return STATUS.OK
}

/**
 * StatusBadge — pill component showing requirement status.
 * @param {{ status: string, t: object }} props
 */
export default function StatusBadge({ status, t }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[STATUS.MISSING]
  const label  = t[config.labelKey] ?? status

  return (
    <span
      className={`status-badge status-badge--${config.variant}`}
      role="status"
      aria-label={label}
    >
      <span className="status-badge__dot" aria-hidden="true" />
      {label}
    </span>
  )
}
