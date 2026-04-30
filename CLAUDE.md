# Civic — Indian Election Assistant
> Civic (formerly MAI) is a specialized intelligence platform for Indian voters.
> Lead Developer: Dinagar

## Problem Statement
Create an assistant that helps users understand the Indian election 
process, timelines, and steps in an interactive and easy-to-follow way.

## What Civic Does
Three modes, one mission — make every Indian voter informed and ready:

1. **LEARN** — Interactive chapter-by-chapter election explainer + EVM Simulator
2. **GUIDE** — FSM-driven guided journeys for 6 real voter situations ✅ COMPLETE
3. **CHAT** — Gemini RAG chatbot grounded ONLY on public ECI documents ✅ COMPLETE

## Tech Stack
- **Frontend:** React + Vite (NO component libraries — custom design system)
- **Styling:** Tailwind CSS utilities only + custom CSS — NO shadcn, NO MUI
- **Animations:** Framer Motion
- **Backend:** Firebase Cloud Functions (Node.js)
- **AI:** Gemini 1.5 Pro via Cloud Functions proxy
- **RAG Store:** Firebase Firestore (chunked ECI documents)
- **Auth:** Firebase Auth — Google Sign-in only
- **Database:** Firebase Firestore
- **Hosting:** Firebase Hosting

## Google Services (all must have real roles)
| Service | Role |
|---|---|
| Gemini 1.5 Pro | RAG-grounded Q&A on ECI documents |
| Firebase Firestore | ECI doc chunks, journey state, user progress |
| Firebase Cloud Functions | Secure Gemini API proxy |
| Firebase Auth | Google Sign-in, save progress |
| Firebase Hosting | Production deploy |
| Google Maps JS API | Polling booth + ERO office locator |
| Google Translate API | 10 Indian languages |
| Google Text-to-Speech API | Audio on every step |
| Google Calendar API | Election date reminders (integrated in DO mode ActionStep) |

## The 6 GUIDE-Mode Journeys (FSM) — ALL BUILT ✅
1. First-time voter → Form 6 walkthrough (8 steps)
2. Name missing from list → Diagnostic + 3 branching paths (9 steps)
3. Moved cities / student away → Form 8 / transfer guide (7 steps)
4. Migrant worker → Rights + compare loop + calendar (6 steps)
5. Election day companion → Booth → EVM → VVPAT (10 steps)
6. PwD / Senior citizen → Home voting + Saksham guide (7 steps)

## Data Sources (ALL free and public — no paid APIs)
- ECI FAQ: https://www.eci.gov.in/faq
- ECI Handbooks: downloadable PDFs from eci.gov.in
- Form instructions: NVSP portal (public)
- Election timelines: hardcoded from public ECI data
- Valid ID list: ECI public circular
- EVM/VVPAT process: ECI manual PDF
- NO live voter roll API (Eko India API is paid — never use it)
- NO real-time application tracking (requires ECI access)

## Design System
- See /src/design-system/tokens.css for all design tokens
- Font: Plus Jakarta Sans (headings) + Inter (body)
- Primary color: Deep Saffron #F97316
- Accent: India Blue #1D4ED8
- Background: Near-black #0A0A0A (dark mode first)
- NO AI-looking dashboards. Human, editorial, cultural aesthetic.
- Motion: subtle, purposeful — Framer Motion only

## File Structure
```
src/
├── components/
│   ├── ui/           ← Custom base components (Button, Card, etc.)
│   ├── learn/        ← LEARN mode components (TODO)
│   ├── do/           ← GUIDE mode FSM components ✅
│   │   ├── JourneySelector.jsx    GUIDE home (6 cards)
│   │   ├── JourneyPlayer.jsx      Full-screen player
│   │   ├── StepRenderer.jsx       Step type dispatcher
│   │   ├── ProgressDots.jsx       Dynamic progress dots
│   │   ├── StepHelper.jsx         Gemini fallback drawer
│   │   ├── do.css                 Complete GUIDE stylesheet
│   │   └── steps/
│   │       ├── InfoStep.jsx
│   │       ├── ChoiceStep.jsx
│   │       ├── ChecklistStep.jsx
│   │       ├── ActionStep.jsx
│   │       └── CompletionStep.jsx
│   └── ask/          ← CHAT mode chatbot ✅
├── journeys/         ← FSM journey definitions (JSON data) ✅
│   ├── _types.js
│   ├── first-time-voter.json
│   ├── missing-name.json
│   ├── moved-cities.json
│   ├── migrant-worker.json
│   ├── election-day.json
│   ├── pwd-senior.json
│   └── index.js
├── hooks/            ← Custom React hooks ✅
│   ├── useJourney.js              FSM engine
│   └── useJourneyProgress.js      localStorage persistence
├── rag/              ← RAG pipeline utilities
├── services/         ← Firebase + Google API wrappers
├── design-system/    ← tokens.css, typography, animations
└── pages/            ← Route-level components
```

## Routes
| Path | Component | Status |
|---|---|---|
| `/` | HomePage | ✅ |
| `/chat` | AskPage | ✅ |
| `/guide` | JourneySelector | ✅ |
| `/guide/:journeyId` | JourneyPlayer | ✅ |
| `/learn` | Placeholder | TODO |

## Agent Rules (READ BEFORE EVERY ACTION)
1. NEVER install shadcn/ui, MUI, Ant Design, Chakra, or any component library
2. NEVER expose API keys in frontend code — always use Cloud Functions
3. NEVER suggest paid APIs — all data must be free and publicly available
4. NEVER rewrite a file completely when fixing a bug — diagnose first
5. ALWAYS explain what a new concept does before implementing it
6. ALWAYS check PROGRESS.md before starting work to know current state
7. ALWAYS update PROGRESS.md at end of session
8. When building UI — think editorial magazine, not SaaS dashboard
9. Mobile-first. Test at 375px width first.
10. RAG answers must cite which ECI document they came from

## Current Phase
- [x] CHAT Mode — Complete ✅
- [x] GUIDE Mode — All 11 phases + Enhancement Pass complete ✅
  - Bug fixes: calendar regex, checklist persistence, dead code, home nav
  - UX: Step counter ("Step X of Y"), auto-submit helpers, confetti, completion badges, inline exit modal, share, keyboard shortcuts (Enter/Numbers/Escape), and TTS Read-aloud.
- [x] LEARN Mode — Complete ✅
  - 6 chapters with real ECI content (5 section types each)
  - Interactive quiz per chapter with reveal animation
  - EVM/VVPAT Simulator (3-panel state machine, 7s countdown)
  - TTS Listen button in chapter reader topbar
- [x] Day 5 — Deploy + Polish ✅
  - Production live at https://maiapp-494222.web.app
  - Premium home page with hero, stats, mode cards
  - Error boundary, SEO meta tags, CSP hardened
- [ ] Day 6 — Testing, video, final polish
→ Check PROGRESS.md for detailed status