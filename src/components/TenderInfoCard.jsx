import { useLanguage } from '../contexts/LanguageContext'
import { formatDate } from '../utils/formatDate'
import './TenderInfoCard.css'

/**
 * TenderInfoCard
 * Displays the tender metadata loaded from requirements.json.
 *
 * @param {{ tender: import('../utils/parseRequirements').Tender }} props
 */
export default function TenderInfoCard({ tender }) {
  const { lang, t } = useLanguage()

  const fields = [
    { label: t.tenderId,           value: tender.tender_id,           mono: true  },
    { label: t.tenderTitle,        value: tender.title,               mono: false },
    { label: t.procuringEntity,    value: tender.procuring_entity,    mono: false },
    { label: t.bidder,             value: tender.bidder,              mono: false },
    { label: t.submissionDeadline, value: formatDate(tender.submission_deadline, lang), mono: false },
  ]

  return (
    <div className="tender-card" role="region" aria-label="Tender information">
      <div className="tender-card__header">
        <span className="tender-card__icon" aria-hidden="true">📋</span>
        <div>
          <h2 className="tender-card__title">{tender.title}</h2>
          <span className="tender-card__id">{tender.tender_id}</span>
        </div>
      </div>

      <dl className="tender-card__fields">
        {fields.map(({ label, value, mono }) => (
          <div key={label} className="tender-card__field">
            <dt className="tender-card__field-label">{label}</dt>
            <dd className={`tender-card__field-value${mono ? ' tender-card__field-value--mono' : ''}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
