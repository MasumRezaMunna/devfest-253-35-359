# Tender Document Package Builder

> AI DevFest Hackathon — Team 253-35-359

## Overview

A fully **browser-side** React application that helps office staff turn a set of PDF documents into one complete, checked, and correctly ordered tender document package.

**No backend. No uploads. All documents stay on your device.**

---

## Live App

```
npm install
npm run dev
```
Open **http://localhost:5173**

---

## Features

| Feature | Status |
|---------|--------|
| Load `requirements.json` (drag-drop or click) | ✅ |
| Display tender info and requirements | ✅ |
| Upload PDFs with page counting | ✅ |
| Validation: PDF-only, max 30 files, 50 MB | ✅ |
| Duplicate file detection (SHA-256 hash) | ✅ |
| Match PDFs to requirements | ✅ |
| Expiry date entry with deadline comparison | ✅ |
| Live status engine (Missing / Expiry Needed / Expired / OK / Not Provided) | ✅ |
| PDF package generation with cover page | ✅ |
| Footer on every page: `<tender_id> \| Page X of Y` | ✅ |
| English / বাংলা language switch | ✅ |

---

## How It Works

```
1. Load Requirements  →  Upload requirements.json
        ↓
2. Add Documents      →  Drag-drop PDF files (up to 30 / 50 MB)
        ↓
3. Match & Verify     →  Assign PDFs to requirements, enter expiry dates
        ↓
4. Generate Package   →  Download <tender_id>_Package.pdf
```

---

## Technology Stack

- **React 19** + **Vite 8**
- **pdf-lib** — PDF generation and merging (browser-side)
- **Web Crypto API** — SHA-256 file hashing for duplicate detection
- **Google Fonts** — Inter + Noto Sans Bengali

---

## Privacy

All tender documents are processed entirely in the browser.  
Nothing is uploaded to any server, API, or cloud service.

---

## Sample Package

The `sample-pack/` folder contains a test `requirements.json` and sample PDFs.

**Tender:** `T-2026-0417` · Supply of IT Equipment  
**Deadline:** 2026-10-20  
**Requirements:** 10 documents (8 mandatory, 2 optional)

The sample pack includes intentional test cases:
- Duplicate files (`experience_cert.pdf` × 2)
- Multiple versions of the same document (`trade_license_2025.pdf` vs `2026.pdf`)
- A large scan (`scan_0042.pdf`) for size/performance testing

---

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          — Sticky header + language switcher
│   ├── Footer.jsx          — Footer with privacy notice
│   ├── TenderInfoCard.jsx  — Displays tender metadata
│   ├── RequirementsList.jsx— Sorted requirements with status badges
│   ├── StatusBadge.jsx     — Status badge + computeStatus()
│   ├── PdfUploadZone.jsx   — Multi-file PDF upload with validation
│   ├── MatchingPanel.jsx   — Assign PDFs to requirements + expiry dates
│   └── GeneratePanel.jsx   — Package summary + PDF generation
├── pages/
│   ├── LandingPage.jsx     — Marketing / entry point
│   └── BuilderPage.jsx     — 4-phase builder flow
├── contexts/
│   └── LanguageContext.jsx — EN/BN language provider
├── i18n/
│   └── translations.js     — All UI strings in English and Bangla
├── utils/
│   ├── parseRequirements.js— JSON validation and parsing
│   ├── formatDate.js       — Locale-aware date formatting
│   ├── pdfUtils.js         — Page counting, hashing, validation
│   └── generatePackage.js  — pdf-lib package generation
├── App.jsx                 — Root with state-based routing
└── index.css               — Global design system (CSS custom properties)
```

---

*Built during AI DevFest Hackathon · All AI prompts documented in commit messages.*
