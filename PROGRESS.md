# MAI — Build Progress

## 7-Day Roadmap
- [x] Day 1 — Vite setup + Firebase init + Gemini hello world + Design system
- [x] Day 2 — RAG pipeline (ECI docs → Firestore → grounded Gemini)
- [x] Day 3 — FSM Journey engine (DO mode — all 6 journeys, all 11 phases)
- [x] Day 4 — LEARN mode (6 chapters + interactive quiz + EVM/VVPAT simulator)
- [ ] Day 5 — Voice layer (TTS + STT + Translate) OR Deploy + polish
- [ ] Day 6 — Maps + Calendar + Auth + Polish
- [ ] Day 7 — Testing + Firebase deploy + Demo video

## What's Done

### Foundation & ASK Mode
- [x] CLAUDE.md created
- [x] PROGRESS.md created
- [x] .gitignore configured
- [x] Phase 1 — Firebase & Project Foundation
- [x] Phase 2 — The Ingestion Pipeline
- [x] Phase 3 — The Retrieval + Generation Cloud Function
- [x] Phase 4 — The Design System (Editorial Civic Journal) + responsive polish
- [x] Phase 5-9 — ASK Mode (Chat UI, Streaming Integration, Hardening, Deployment)

### DO Mode — ALL 11 PHASES COMPLETE ✅
- [x] DO Phase 1 — Journey Data Model (`_types.js`, 5 step types: info, choice, checklist, action, completion)
- [x] DO Phase 2 — All 6 Journey Definitions (first-time-voter, missing-name, moved-cities, migrant-worker, election-day, pwd-senior)
- [x] DO Phase 3 — FSM Engine (`useJourney.js` hook + `useJourneyProgress.js` persistence hook)
- [x] DO Phase 4 — Component Library (`StepRenderer`, `InfoStep`, `ChoiceStep`, `ChecklistStep`, `ActionStep`, `CompletionStep`)
- [x] DO Phase 5 — Full-Screen Journey Player (`JourneyPlayer.jsx` with resume prompt, exit confirmation)
- [x] DO Phase 6 — Journey Selector (`JourneySelector.jsx` — DO home with icons, accent colors, "In progress" badges)
- [x] DO Phase 7 — Checklist & Interactive Elements (required gating, live counters, toggle states)
- [x] DO Phase 8 — Gemini Fallback Helper (`StepHelper.jsx` — drawer that reuses ASK endpoint with step context)
- [x] DO Phase 9 — Lightweight Persistence (localStorage, 7-day expiry, auto-clear on completion)
- [x] DO Phase 10 — Polish & Animations (`do.css` — per-journey accent theming, `ProgressDots.jsx`, mobile responsive)
- [x] DO Phase 11 — Routing updated (`/do` → JourneySelector, `/do/:journeyId` → JourneyPlayer)

### DO Mode — Enhancement Pass ✅
- [x] Bug Fix — Calendar regex (ActionStep date formatting was double-escaped)
- [x] Bug Fix — Checklist state persistence (`saveStepData` + proactive saves on toggle)
- [x] Bug Fix — Dead code cleanup (removed orphan DoPage.jsx, JourneyRunner.jsx)
- [x] Bug Fix — Home navigation (added back-to-home link in JourneySelector header)
- [x] Enhancement — Step counter in topbar ("3 / 8" below progress dots)
- [x] Enhancement — Auto-submit helper suggestions (click = instant Gemini query)
- [x] Enhancement — Completion confetti celebration (canvas particle animation, no library)
- [x] Enhancement — Journey completion badges (green ✓ icon + "Completed" on selector cards)
- [x] Enhancement — Inline exit modal (replaced window.confirm with animated design-system modal)
- [x] Enhancement — WhatsApp/native share on completion
- [x] Enhancement — Keyboard shortcuts (Escape to close helper or go back)

## DO Mode Architecture
```
src/journeys/
  ├── _types.js                  JSDoc types & helpers
  ├── first-time-voter.json      8 steps
  ├── missing-name.json          9 steps with branches
  ├── moved-cities.json          7 steps
  ├── migrant-worker.json        6 steps with compare loop
  ├── election-day.json          10 steps
  ├── pwd-senior.json            7 steps
  └── index.js                   ALL_JOURNEYS, JOURNEY_MAP, getJourney()

src/hooks/
  ├── useJourney.js              FSM engine (state, history, goTo, back, reset, saveStepData)
  └── useJourneyProgress.js      localStorage persistence (save, load, clear, markComplete, isJourneyComplete)

src/components/do/
  ├── JourneySelector.jsx        DO home page (6 cards)
  ├── JourneyPlayer.jsx          Full-screen player (topbar, stage, footer, helper)
  ├── StepRenderer.jsx           Step type dispatcher
  ├── ProgressDots.jsx           Dynamic dot progress indicator
  ├── StepHelper.jsx             Gemini fallback drawer
  ├── do.css                     Complete DO mode stylesheet
  └── steps/
      ├── InfoStep.jsx           Pure info + continue
      ├── ChoiceStep.jsx         Branching decisions
      ├── ChecklistStep.jsx      Toggle items + required gating
      ├── ActionStep.jsx         External actions (link, calendar, phone, copy)
      └── CompletionStep.jsx     Journey end + next actions
```

## Key Decisions
- Custom design system only — no component libraries
- RAG data source: ECI public PDFs only
- Streaming SSE via Firebase Cloud Functions works natively without WebSockets
- Hardened function with input sanitation and rate-limiting
- FSM engine is data-driven — journeys are pure JSON, engine renders any of them
- Per-journey accent theming via CSS custom properties (`--journey-accent`)
- localStorage persistence with 7-day expiry, auto-clear on completion
- Gemini helper reuses 100% of ASK's Cloud Function — no new backend

### LEARN Mode ✅
- [x] 6 chapter data files (`src/learn/chapters.js`) — real ECI facts, no hallucination
- [x] 5 section types: `prose`, `callout`, `timeline`, `quiz`, `evm`
- [x] Interactive quiz per chapter — A/B/C/D, reveal animation, explanation on reveal
- [x] Interactive EVM/VVPAT Simulator — 3-panel (Control Unit, Ballot Unit, VVPAT), state machine, 7s countdown
- [x] Chapter reader with sticky topbar, hero, scroll-animated sections, prev/next nav
- [x] LEARN home with 3-column chapter grid, accent-per-chapter theming, Interactive/Quiz badges
- [x] Routing: `/learn` → LearnHome, `/learn/:chapterId` → ChapterReader
- [x] Upgraded HomePage — mode cards with icons and accent hover effects

## LEARN Mode Architecture
```
src/learn/
  ├── _types.js            JSDoc types for Chapter, Section, QuizQuestion
  └── chapters.js          6 chapter definitions (all real ECI data)

src/components/learn/
  ├── LearnHome.jsx        Chapter grid + EVM callout
  ├── ChapterReader.jsx    Full article reader with nav
  ├── SectionRenderer.jsx  Section type dispatcher
  ├── learn.css            Complete LEARN stylesheet + EVM simulator CSS
  └── sections/
      ├── ContentSections.jsx  ProseSection, CalloutSection, TimelineSection
      ├── QuizSection.jsx      Interactive quiz with reveal
      └── EVMSimulator.jsx     3-panel EVM/VVPAT state machine
```

## Routes
| Path | Component | Status |
|---|---|---|
| `/` | HomePage | ✅ |
| `/ask` | AskPage | ✅ |
| `/do` | JourneySelector | ✅ |
| `/do/:journeyId` | JourneyPlayer | ✅ |
| `/learn` | LearnHome | ✅ |
| `/learn/:chapterId` | ChapterReader | ✅ |

## Current Blocker
None. ASK, DO, and LEARN modes are all fully built and tested locally.

## Next Session Pick Up From
- **Firebase deploy** — push all three modes live
- **Voice layer** — TTS on chapter sections (Web Speech API, free)
- **Home page polish** — make the landing page more impressive for judges
- **Analytics** — fire events for chapter_started, quiz_answered, journey_completed