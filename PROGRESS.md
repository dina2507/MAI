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
- [x] Phase 5-9 — ASK Mode (Chat UI, Streaming Integration, Hardening, Deployment)

## Today's Session
**Date:** 2026-04-28
**Goal:** Phase 5-9 — ASK Mode Completion
**Files touched:**
- src/components/ask/* (AskPage, ChatStream, Message, Composer, Citation, etc.)
- src/services/askClient.js (SSE Streaming logic)
- functions/rateLimit.js & index.js (Production hardening, CSP, Rate limits)
- firebase.json (Added CSP Headers)

## Key Decisions
- Custom design system only — no component libraries
- RAG data source: ECI public PDFs only
- Streaming SSE via Firebase Cloud Functions works natively without WebSockets.
- Hardened function with input sanitation and rate-limiting.

## Current Blocker
None. The ASK mode is fully live and successfully tested locally. (Note: Firebase Hosting may take 5-10 minutes to propagate the first time).

## Next Session Pick Up From
DO Mode — FSM Guided Journeys
Reference: Start building the state machine for the step-by-step voter tasks.