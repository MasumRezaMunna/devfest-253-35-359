/**
 * parseRequirements.js
 *
 * Parses and validates a requirements.json object.
 * Returns { tender, requirements } on success.
 * Throws a descriptive Error on invalid input.
 *
 * The application is GENERIC — it works with any valid
 * requirements.json that follows the hackathon schema.
 */

/**
 * @typedef {Object} Tender
 * @property {string} tender_id
 * @property {string} title
 * @property {string} procuring_entity
 * @property {string} bidder
 * @property {string} submission_deadline  — ISO date string "YYYY-MM-DD"
 */

/**
 * @typedef {Object} Requirement
 * @property {string}  id
 * @property {number}  order
 * @property {string}  title_en
 * @property {string}  title_bn
 * @property {boolean} mandatory
 * @property {boolean} has_expiry
 */

/**
 * Parse a raw JSON object from requirements.json.
 * @param {unknown} raw  — already JSON.parsed object
 * @returns {{ tender: Tender, requirements: Requirement[] }}
 */
export function parseRequirements(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid file: expected a JSON object.')
  }

  // ── Validate tender block ──────────────────────────────────────────
  const { tender, requirements } = raw

  if (!tender || typeof tender !== 'object') {
    throw new Error('Missing "tender" field in requirements.json.')
  }

  const requiredTenderFields = [
    'tender_id', 'title', 'procuring_entity', 'bidder', 'submission_deadline',
  ]
  for (const field of requiredTenderFields) {
    if (!tender[field] || typeof tender[field] !== 'string') {
      throw new Error(`Missing or invalid tender field: "${field}".`)
    }
  }

  // Validate ISO date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tender.submission_deadline)) {
    throw new Error(
      `Invalid submission_deadline format: "${tender.submission_deadline}". Expected YYYY-MM-DD.`
    )
  }

  // ── Validate requirements array ────────────────────────────────────
  if (!Array.isArray(requirements) || requirements.length === 0) {
    throw new Error('Missing or empty "requirements" array in requirements.json.')
  }

  const parsedRequirements = requirements.map((req, idx) => {
    const label = `requirements[${idx}]`

    if (!req || typeof req !== 'object') {
      throw new Error(`${label}: expected an object.`)
    }

    if (!req.id || typeof req.id !== 'string') {
      throw new Error(`${label}: missing or invalid "id".`)
    }

    if (typeof req.order !== 'number' || !Number.isInteger(req.order)) {
      throw new Error(`${label} (id="${req.id}"): "order" must be an integer.`)
    }

    if (!req.title_en || typeof req.title_en !== 'string') {
      throw new Error(`${label} (id="${req.id}"): missing "title_en".`)
    }

    if (!req.title_bn || typeof req.title_bn !== 'string') {
      throw new Error(`${label} (id="${req.id}"): missing "title_bn".`)
    }

    if (typeof req.mandatory !== 'boolean') {
      throw new Error(`${label} (id="${req.id}"): "mandatory" must be boolean.`)
    }

    if (typeof req.has_expiry !== 'boolean') {
      throw new Error(`${label} (id="${req.id}"): "has_expiry" must be boolean.`)
    }

    return {
      id: req.id,
      order: req.order,
      title_en: req.title_en,
      title_bn: req.title_bn,
      mandatory: req.mandatory,
      has_expiry: req.has_expiry,
    }
  })

  // Sort by order ascending
  parsedRequirements.sort((a, b) => a.order - b.order)

  return {
    tender: {
      tender_id:           tender.tender_id,
      title:               tender.title,
      procuring_entity:    tender.procuring_entity,
      bidder:              tender.bidder,
      submission_deadline: tender.submission_deadline,
    },
    requirements: parsedRequirements,
  }
}

/**
 * Read a File object as text and parse its JSON.
 * Returns a Promise that resolves to { tender, requirements }.
 * @param {File} file
 * @returns {Promise<{ tender: Tender, requirements: Requirement[] }>}
 */
export function readAndParseRequirementsFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided.'))
      return
    }

    if (file.size > 1_000_000) {
      reject(new Error('File is too large. Maximum size is 1 MB.'))
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target.result
        const raw = JSON.parse(text)
        const result = parseRequirements(raw)
        resolve(result)
      } catch (err) {
        if (err instanceof SyntaxError) {
          reject(new Error('File is not valid JSON. Please check the file.'))
        } else {
          reject(err)
        }
      }
    }

    reader.onerror = () => {
      reject(new Error('Could not read the file.'))
    }

    reader.readAsText(file)
  })
}
