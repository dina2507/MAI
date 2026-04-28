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

## Today's Session
**Date:** 2026-04-28
**Goal:** Complete Phase 3 Cloud Function
**Files touched:** functions/index.js

## Key Decisions
- Custom design system only — no component libraries
- RAG data source: ECI public PDFs only
- Voice: Google STT/TTS (not Bhashini — too unstable)
- FSM journeys stored as JSON in /src/journeys/
- Dark-first UI with saffron + India blue palette

## Current Blocker
None yet.

## Next Session Pick Up From
Phase 4 — The Design System (Editorial Civic Journal)
Reference: ASK_BUILD.md Section 8