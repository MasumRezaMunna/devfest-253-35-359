# Tender Document Package Builder

> **AI DevFest Hackathon 2026** — Team #253-35-359

A **frontend-only React application** that helps office staff turn a set of PDF documents into one complete, validated, correctly ordered tender package — entirely in the browser, with zero server uploads.

🌐 **Live Demo**: [Deployed on Netlify] *(add URL after deployment)*

---

## Features

| Feature | Details |
|---|---|
| **Load Requirements** | Drag-and-drop `requirements.json` from any tender package |
| **PDF Upload** | Multi-file drag-and-drop upload with page counting and size display |
| **Duplicate Detection** | SHA-256 hashing; duplicate files are flagged and blocked from matching |
| **Live Validation** | 5 statuses: ✅ OK, ⚠️ Expiry Needed, ❌ Missing, ❌ Expired, — Not Provided |
| **Expiry Date Check** | `expiryDate < deadline` → Expired; `expiryDate ≥ deadline` → OK |
| **Match & Verify** | Assign each PDF to its requirement via dropdown (1-to-1, duplicates blocked) |
| **Auto-Match** ⭐ | One-click filename-similarity matching to suggest assignments automatically |
| **Blocked Generate** | Generate button is **disabled** until all blocking issues are resolved (spec §4.7) |
| **PDF Package Generation** | Produces a single PDF with cover page + document index + all documents in order |
| **Cover Page** | Shows: Tender ID, Title, Procuring Entity, Bidder, Deadline, Package Date |
| **Document Index** ⭐ | Page 2 lists every included document with its starting page number |
| **Footer** | Every page: `<tender_id> \| Page X of Y` (spec §6.3 exact format) |
| **Bilingual** | Full English and বাংলা interface toggle |
| **100% Private** | All processing in-browser — no data sent to any server |

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## How to Use

### Step 1 — Load Requirements
Drag and drop (or click to browse) the `requirements.json` file for your tender.

### Step 2 — Upload PDF Documents  
Upload all PDF files you have for the tender. The app will:
- Count pages in each file
- Detect duplicate content (SHA-256 hash comparison)
- Show file size and page count

### Step 3 — Match & Verify
For each requirement:
- Use the dropdown to assign an uploaded PDF
- Enter expiry dates for documents with `has_expiry: true`
- The status badge updates live: **OK**, **Missing**, **Expired**, **Expiry Needed**, **Not Provided**
- Click **✨ Auto-Match** to automatically suggest assignments based on filenames

The **Continue** button changes to **Generate Package** only when all mandatory documents are OK.

### Step 4 — Generate Package
Review the package summary. The **Generate button is disabled** if any blocking issues remain.

When all issues are resolved, click to generate and download `<tender_id>_Package.pdf`.

The package contains:
1. **Cover Page** — All required tender metadata
2. **Document Index** — Lists every included document with its starting page number
3. **Documents** — All matched PDFs in requirement order, with original pages
4. **Footer** — `<tender_id> | Page X of Y` on every page

---

## Document Status Reference

| Status | Meaning | Blocks Generate? |
|---|---|---|
| ✅ **OK** | File matched; expiry valid (or no expiry required) | No |
| ⚠️ **Expiry Date Needed** | File matched but expiry date not entered | **Yes** |
| ❌ **Expired** | Expiry date is before submission deadline | **Yes** |
| ❌ **Missing** | Mandatory document has no file assigned | **Yes** |
| — **Not Provided** | Optional document with no file (allowed) | No |

---

## Sample Pack

The `sample-pack/` folder in this repository contains a complete example:

- `requirements.json` — Tender `T-2026-0417`, "Supply of IT Equipment"
- `documents/` — 10 sample PDFs matching the 10 requirements

**Known issues in sample pack** (intentional, to test the validator):
- `experience_cert.pdf` and `experience_cert (1).pdf` → byte-identical duplicates; only one should be used
- `trade_license_2025.pdf` → expired before 2026-10-20 deadline; use `trade_license_2026.pdf` instead
- No PDF provided for R10 (Signed Declaration) → mandatory, will show Missing

---

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          Header with language toggle
│   ├── Footer.jsx          App footer
│   ├── TenderInfoCard.jsx  Renders tender metadata
│   ├── StatusBadge.jsx     5-status badge + computeStatus() logic
│   ├── RequirementsList.jsx  Sorted requirements table
│   ├── PdfUploadZone.jsx   Multi-file drag-drop + SHA-256 dup detection
│   ├── MatchingPanel.jsx   PDF→requirement assignment + auto-match
│   └── GeneratePanel.jsx   Package summary + disabled generate button
├── pages/
│   ├── LandingPage.jsx     Hero, workflow steps, features
│   └── BuilderPage.jsx     4-phase flow: load→upload→match→generate
├── utils/
│   ├── parseRequirements.js  Validates + parses requirements.json
│   ├── pdfUtils.js           Page counting (pdfjs-dist), SHA-256, validation
│   ├── generatePackage.js    Full PDF generation with cover + index + footer
│   └── formatDate.js         EN/BN locale date formatting
├── contexts/
│   └── LanguageContext.jsx   Language provider + useLanguage hook
└── i18n/
    └── translations.js       EN + বাংলা string tables
```

---

## Deployment on Netlify

This project includes a `netlify.toml` configuration file.

### Deploy via Netlify Dashboard:
1. Push code to GitHub
2. Log in to [netlify.com](https://netlify.com)
3. Click **Add new site → Import an existing project**
4. Select your GitHub repository
5. Build settings are auto-detected from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **Deploy**

### Deploy via Netlify CLI:
```bash
npx netlify-cli deploy --prod --dir=dist
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Language | JavaScript (ES2022) |
| PDF Reading | pdfjs-dist |
| PDF Writing | pdf-lib |
| Hashing | Web Crypto API (SHA-256) |
| Styling | Vanilla CSS with CSS custom properties |
| State | React hooks (useState, useCallback, useContext) |
| Routing | State-based (no React Router) |
| Deployment | Netlify (static) |

---

## Requirements Compliance

Checklist against the AI DevFest Problem Statement:

- [x] §4.1 Load and display `requirements.json`
- [x] §4.2 Upload PDFs, show name + pages, remove individual files
- [x] §4.3 Match files to requirements (1-to-1)
- [x] §4.4 Enter expiry dates for `has_expiry` documents
- [x] §4.5 Status updates live on every change
- [x] §4.6 Duplicate content detection — blocked from matching to different requirements
- [x] §4.7 Generate button **disabled** when any blocking issue exists
- [x] §4.8 Download as `<tender_id>_Package.pdf`
- [x] §4.9 Language toggle: English ↔ বাংলা
- [x] §5 All 5 statuses implemented correctly
- [x] §5 `expiryDate < deadline` = Expired; `expiryDate >= deadline` = OK
- [x] §6.1 Cover page with all required fields
- [x] §6.2 Documents in order, skip unmatched optional
- [x] §6.3 Footer: `<tender_id> | Page X of Y` on every page
- [x] §6.4 Footer does not cover document content
- [x] **BONUS** Auto-match by filename similarity
- [x] **BONUS** Document index page (page 2) with starting page numbers

---

## AI DevFest Hackathon

- **Team ID**: 253-35-359
- **Event**: AI DevFest 2026
- **Build time**: 90 minutes
- **Category**: Frontend Application
