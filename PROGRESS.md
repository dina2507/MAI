# MAI — Build Progress

## 7-Day Roadmap
- [ ] Day 1 — Vite setup + Firebase init + Gemini hello world + Design system
- [x] Day 2 — RAG pipeline (ECI docs → Firestore → grounded Gemini)
- [x] Day 3 — FSM Journey engine (DO mode — 6 journeys)
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
- [x] DO Mode Phase 1 — Journey Data Model (_types.js, 5 step types)
- [x] DO Mode Phase 2 — All 6 Journey Definitions (new FSM schema)
- [x] DO Mode Phase 3 — FSM Engine (useJourney hook, useJourneyProgress hook)
- [x] DO Mode Phase 4 — Component Library (StepRenderer, InfoStep, ChoiceStep, ChecklistStep, ActionStep, CompletionStep)
- [x] DO Mode Phase 5 — Full-Screen Journey Player (JourneyPlayer.jsx with resume prompt)
- [x] DO Mode Phase 6 — Journey Selector (JourneySelector.jsx with icons + progress badges)
- [x] DO Mode Phase 7 — Checklist & Interactive Elements (required gating, live counters)
- [x] DO Mode Phase 8 — Gemini Fallback Helper (StepHelper.jsx, reuses ASK endpoint)
- [x] DO Mode Phase 9 — Lightweight Persistence (localStorage, 7-day expiry)
- [x] DO Mode Phase 10 — Polish & Animations (complete do.css, progress dots, per-journey theming)
- [x] DO Mode Phase 11 — App.jsx routing updated (/do, /do/:journeyId)

## Today's Session
**Date:** 2026-04-28
**Goal:** Phase 1 (DO Mode) — Complete Build Done

### What was built:
#### Data Layer
- `_types.js` — JSDoc type definitions for Journey, Step, Choice, Action, etc.
- 6 journey JSON files — All rewritten with the new FSM schema (steps, choices, checklists, actions, completions)
- `index.js` — Updated exports with ALL_JOURNEYS, JOURNEY_MAP, getJourney()

#### FSM Engine (Hooks)
- `useJourney.js` — Core FSM hook (state pointer, history stack, transitions, back/reset)
- `useJourneyProgress.js` — LocalStorage persistence with 7-day expiry & auto-clear on completion

#### Component Library
- `StepRenderer.jsx` — Dispatcher that maps step type → component
- 5 step components: `InfoStep`, `ChoiceStep`, `ChecklistStep`, `ActionStep`, `CompletionStep`
- `ProgressDots.jsx` — Dynamic progress indicator
- `StepHelper.jsx` — Gemini fallback drawer (reuses ASK endpoint)

#### Full-Screen Player & Selector
- `JourneyPlayer.jsx` — Immersive full-screen player with resume prompt, back/restart, helper drawer
- `JourneySelector.jsx` — DO home page with 6 journey cards, icons, accent colors, "In progress" badges

#### Styling & Routing
- `do.css` — Complete stylesheet (journey shell, steps, checklist, actions, completion, helper drawer, mobile responsive)
- `App.jsx` — Updated with `/do` → JourneySelector, `/do/:journeyId` → JourneyPlayer

### Verified ✅
- Build succeeds cleanly
- All 6 journey cards render on the selector
- Step transitions work (info → choice → checklist → action → completion)
- Persistence works — "In progress" badge shows after exiting mid-journey
- No console errors

## Key Decisions
- Custom design system only — no component libraries
- RAG data source: ECI public PDFs only
- Streaming SSE via Firebase Cloud Functions works natively without WebSockets.
- Hardened function with input sanitation and rate-limiting.
- FSM engine is data-driven (JSON journeys, 5 step types)
- Per-journey accent theming via CSS custom properties
- localStorage persistence with 7-day expiry

## Current Blocker
None. DO mode is fully built and tested locally. All 6 journeys render correctly with full FSM transitions, persistence, and resume.

## Next Session Pick Up From
- LEARN Mode — Interactive chapters + EVM simulator
- OR: Firebase deploy of DO mode + testing all journeys end-to-end