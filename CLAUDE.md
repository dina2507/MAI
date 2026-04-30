# Civic — Indian Election Assistant
> Civic (formerly MAI) is a specialized intelligence platform for Indian voters.
> Lead Developer: Dinagar

## Problem Statement
Create an assistant that helps users understand the Indian election 
process, timelines, and steps in an interactive and easy-to-follow way.

## What Civic Does
Four modes, one mission — make every Indian voter informed and ready:

1. **CHAT** — Gemini RAG chatbot grounded ONLY on public ECI documents ✅ COMPLETE
2. **GUIDE** — FSM-driven guided journeys for 6 real voter situations ✅ COMPLETE
3. **LEARN** — Interactive chapter-by-chapter election explainer + EVM Simulator ✅ COMPLETE
4. **FIND BOOTH** — Google Maps polling station locator ✅ COMPLETE

## Tech Stack
- **Frontend:** React 19 + Vite (NO component libraries — custom design system)
- **Styling:** Tailwind CSS utilities + custom CSS — NO shadcn, NO MUI
- **Animations:** Framer Motion
- **Backend:** Firebase Cloud Functions (Node.js, region: asia-south1)
- **AI:** Gemini Flash (streaming, temp 0.3) + Gemini Embedding 2 (768-dim, top-8) via Cloud Functions proxy
- **RAG Store:** Firebase Firestore (chunked ECI documents)
- **Auth:** Firebase Auth — Google Sign-in only
- **Database:** Firebase Firestore
- **Hosting:** Firebase Hosting

## Google Services (all must have real roles)
| Service | Role |
|---|---|
| Gemini Flash | Streaming RAG Q&A + GUIDE mode fallback helper |
| Gemini Embedding 2 | 768-dim cosine similarity retrieval, top-8 chunks |
| Firebase Firestore | ECI doc chunks, journey state, rate limits |
| Firebase Cloud Functions | Secure Gemini API proxy (rate limited) |
| Firebase Auth | Google Sign-in, user identity |
| Firebase Hosting | Production deploy |
| Google Maps JS API | Polling booth + ERO office locator (/map route) |
| Google Translate API | 10 Indian languages (LanguageSwitcher in sidebar) |
| Google Text-to-Speech API | Audio on every LEARN/GUIDE step |
| Google Calendar API | Election date reminders (ActionStep in GUIDE mode) |

## The 6 GUIDE-Mode Journeys (FSM) — ALL BUILT ✅
1. First-time voter → Form 6 walkthrough (8 steps)
2. Name missing from list → Diagnostic + 3 branching paths (9 steps)
3. Moved cities / student away → Form 8A / transfer guide (7 steps)
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
- Background: Near-black #0A0A0F (dark mode first)
- NO AI-looking dashboards. Human, editorial, cultural aesthetic.
- Motion: subtle, purposeful — Framer Motion only

## File Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── Sidebar.jsx            Collapsible navigation (260px/64px)
│   │   ├── Sidebar.css
│   │   ├── AuthButton.jsx
│   │   ├── AuthButton.css
│   │   └── LanguageSwitcher.jsx
│   ├── ask/          ← CHAT mode chatbot ✅
│   │   ├── AskPage.jsx            Uses ChatContext, no own header
│   │   ├── ChatStream.jsx
│   │   ├── Message.jsx            Full markdown + follow-up suggestions
│   │   ├── Composer.jsx           Voice input + STT
│   │   ├── StarterQuestions.jsx   6 diverse starter prompts
│   │   ├── Citation.jsx
│   │   ├── SourceDrawer.jsx
│   │   ├── ThinkingIndicator.jsx
│   │   └── ask.css
│   ├── do/           ← GUIDE mode FSM components ✅
│   │   ├── JourneySelector.jsx
│   │   ├── JourneyPlayer.jsx
│   │   ├── StepRenderer.jsx
│   │   ├── ProgressDots.jsx
│   │   ├── StepHelper.jsx
│   │   ├── do.css
│   │   └── steps/
│   │       ├── InfoStep.jsx
│   │       ├── ChoiceStep.jsx
│   │       ├── ChecklistStep.jsx
│   │       ├── ActionStep.jsx
│   │       └── CompletionStep.jsx
│   ├── learn/        ← LEARN mode ✅
│   │   ├── LearnHome.jsx
│   │   ├── ChapterReader.jsx
│   │   ├── SectionRenderer.jsx
│   │   ├── learn.css
│   │   └── sections/
│   │       ├── ContentSections.jsx
│   │       ├── QuizSection.jsx
│   │       └── EVMSimulator.jsx
│   └── map/          ← FIND BOOTH mode ✅
│       ├── BoothFinder.jsx        Google Maps + Places API
│       └── BoothFinder.css
├── contexts/
│   ├── AuthContext.jsx            Firebase Auth (Google Sign-in)
│   └── ChatContext.jsx            Shared chat state (sidebar ↔ AskPage)
├── journeys/         ← FSM journey definitions (JSON data) ✅
│   ├── _types.js
│   ├── first-time-voter.json
│   ├── missing-name.json
│   ├── moved-cities.json
│   ├── migrant-worker.json
│   ├── election-day.json
│   ├── pwd-senior.json
│   └── index.js
├── hooks/
│   ├── useJourney.js              FSM engine
│   ├── useJourneyProgress.js      Journey localStorage persistence
│   └── useChatHistory.js          Chat sessions (20 max, auto-titled)
├── services/
│   ├── firebase.js                Firebase init (app, db, functions, auth)
│   ├── askClient.js               SSE streaming client (history + suggestions)
│   └── analytics.js               Firebase Analytics wrapper
├── design-system/    ← tokens.css, typography
└── learn/
    ├── _types.js
    └── chapters.js                6 chapter definitions
```

## Routes
| Path | Component | Status |
|---|---|---|
| `/` | HomePage | ✅ |
| `/chat` | AskPage | ✅ |
| `/guide` | JourneySelector | ✅ |
| `/guide/:journeyId` | JourneyPlayer | ✅ |
| `/learn` | LearnHome | ✅ |
| `/learn/:chapterId` | ChapterReader | ✅ |
| `/map` | BoothFinder | ✅ |

## Environment Variables
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_MAPS_API_KEY          # Optional — enables /map route
```

## Agent Rules (READ BEFORE EVERY ACTION)
1. NEVER install shadcn/ui, MUI, Ant Design, Chakra, or any component library
2. NEVER expose API keys in frontend code — always use Cloud Functions
3. NEVER suggest paid APIs — all data must be free and publicly available
4. NEVER rewrite a file completely when fixing a bug — diagnose first
5. ALWAYS check PROGRESS.md before starting work to know current state
6. ALWAYS update PROGRESS.md at end of session
7. When building UI — think editorial magazine, not SaaS dashboard
8. Mobile-first. Test at 375px width first.
9. RAG answers must cite which ECI document they came from
10. Chat state is shared via ChatContext — never duplicate in AskPage local state
11. Sidebar state (collapsed/mobile) lives in AppLayout in App.jsx — pass as props

## Current Phase
- [x] CHAT Mode — Complete ✅
- [x] GUIDE Mode — All 11 phases + Enhancement Pass complete ✅
- [x] LEARN Mode — Complete ✅
- [x] Day 5 — Deploy + Polish ✅
- [x] Day 6 — Analytics + Translate + Auth ✅
- [x] Day 7 — Sidebar, Chat History, BoothFinder, Production Chat ✅
→ Check PROGRESS.md for detailed status
