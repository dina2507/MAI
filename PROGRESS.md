# MAI — Build Progress

## 7-Day Roadmap
- [ ] Day 1 — Vite setup + Firebase init + Gemini hello world + Design system
- [x] Day 2 — RAG pipeline (ECI docs → Firestore → grounded Gemini)
- [x] Day 3 — FSM Journey engine (DO mode — 2 journeys)
- [ ] Day 4 — LEARN mode (6 chapters + EVM simulator)
- [ ] Day 5 — Voice layer (TTS + STT + Translate)
- [ ] Day 6 — Maps + Calendar + Auth + Polish
- [ ] Day 7 — Testing + Firebase deploy + Demo video

## What's Done
- [x] CLAUDE.md created
- [x] PROGRESS.md created
- [x] .gitignore configured
- [x] Phase 1 — Firebase & Project Foundation
- [x] Phase 2 — The Ingestion Pipeline
- [x] Phase 3 — The Retrieval + Generation Cloud Function
- [x] Phase 4 — The Design System (Editorial Civic Journal) + responsive polish

## Today's Session
**Date:** 2026-04-28
**Goal:** Phase 4 — Design System
**Files touched:**
- src/design-system/tokens.css — added --page-padding-x/top/bottom responsive vars (desktop/tablet/mobile breakpoints), hover-only scrollbar, safe-area utilities, touch-action
- src/design-system/typography.css — fixed clamp() minimums for 375px screens (was 3.5rem→2.25rem for display-2xl etc.)
- src/App.css (new) — responsive layout classes replacing inline styles; nav stacks on <420px
- src/App.jsx — moved inline styles to CSS classes
- index.html — title, theme-color, viewport-fit=cover, apple-mobile-web-app metas

## Key Decisions
- Custom design system only — no component libraries
- RAG data source: ECI public PDFs only
- Voice: Google STT/TTS (not Bhashini — too unstable)
- FSM journeys stored as JSON in /src/journeys/
- Dark-first UI with saffron (#F97316) + India blue (#1D4ED8) palette
- Fonts: Fraunces (display/editorial serif) + Plus Jakarta Sans (body) + JetBrains Mono (code)

## Current Blocker
None.

## Next Session Pick Up From
Phase 5 — Chat UI Components (ASK mode)
Reference: ASK_BUILD.md Section 9
Start with: src/components/ask/AskPage.jsx