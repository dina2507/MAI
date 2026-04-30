# Civic — Build Progress
> Developer: Dinagar

## Build Roadmap
- [x] Day 1 — Vite setup + Firebase init + Gemini hello world + Design system
- [x] Day 2 — RAG pipeline (ECI docs → Firestore → grounded Gemini)
- [x] Day 3 — FSM Journey engine (GUIDE mode — all 6 journeys, all 11 phases)
- [x] Day 4 — LEARN mode (6 chapters + interactive quiz + EVM/VVPAT simulator)
- [x] Day 5 — Deploy + TTS Voice Layer + Home Page Redesign + Error Boundary
- [x] Day 6 — Analytics + Google Translate + Auth + Polish
- [x] Day 7 — Sidebar Nav + Chat History + Booth Finder + Production Chat Quality

## What's Done

### Foundation & CHAT Mode
- [x] Phase 1 — Firebase & Project Foundation
- [x] Phase 2 — The Ingestion Pipeline (PDF → chunks → embeddings)
- [x] Phase 3 — The Retrieval + Generation Cloud Function (RAG)
- [x] Phase 4 — The Design System (Editorial Civic Journal) + responsive polish
- [x] Phase 5–9 — CHAT Mode (Chat UI, Streaming SSE, Hardening, Deployment)

### GUIDE Mode — ALL 11 PHASES COMPLETE ✅
- [x] GUIDE Phase 1 — Journey Data Model (`_types.js`, 5 step types)
- [x] GUIDE Phase 2 — All 6 Journey Definitions
- [x] GUIDE Phase 3 — FSM Engine (`useJourney.js` + `useJourneyProgress.js`)
- [x] GUIDE Phase 4 — Component Library (StepRenderer + 5 step types)
- [x] GUIDE Phase 5 — Full-Screen Journey Player
- [x] GUIDE Phase 6 — Journey Selector (home with icons, accent colors, badges)
- [x] GUIDE Phase 7 — Checklist & Interactive Elements
- [x] GUIDE Phase 8 — Gemini Fallback Helper (StepHelper.jsx)
- [x] GUIDE Phase 9 — Lightweight Persistence (localStorage, 7-day expiry)
- [x] GUIDE Phase 10 — Polish & Animations
- [x] GUIDE Phase 11 — Routing (`/guide`, `/guide/:journeyId`)

### GUIDE Mode — Enhancement Pass ✅
- [x] Step counter ("3 / 8"), confetti on completion, completion badges
- [x] Inline exit modal, WhatsApp/native share
- [x] Keyboard shortcuts (Escape, Enter, number keys)
- [x] Step-level TTS (Web Speech API)

### LEARN Mode ✅
- [x] 6 chapter data files — real ECI facts
- [x] 5 section types: prose, callout, timeline, quiz, evm
- [x] Interactive quiz per chapter — A/B/C/D, reveal animation
- [x] EVM/VVPAT Simulator — 3-panel state machine, 7s countdown
- [x] Chapter reader with sticky topbar, scroll-animated sections, prev/next nav
- [x] LEARN home with chapter grid, per-chapter accent theming

### Day 5 — Deploy + Voice + Polish ✅
- [x] Production deploy → https://maiapp-494222.web.app
- [x] Premium home page — hero badge, stats row, mode cards
- [x] TTS on LEARN chapters and GUIDE steps
- [x] Error boundary + SEO OG meta tags
- [x] CSP hardened

### Day 6 — Analytics, Translate & Auth ✅
- [x] Firebase Analytics wrapper (`analytics.js`)
- [x] Events: `chapter_started`, `quiz_answered`, `journey_completed`
- [x] Web Speech API voice input for CHAT mode Composer
- [x] Google Translate — 10 Indian languages via LanguageSwitcher
- [x] Firebase Auth — Google Sign-in (AuthContext + AuthButton)
- [x] CSP updated for all Google domains (translate, auth, analytics, maps)

### Day 7 — Sidebar, Chat History, Booth Finder, Production Chat ✅

#### Sidebar Navigation
- [x] `Sidebar.jsx` + `Sidebar.css` — collapsible (260px ↔ 64px icon-only)
- [x] Persistent across all routes via `AppLayout` in `App.jsx`
- [x] Sections: brand, New Conversation, mode nav, Recent Chats, user profile
- [x] Per-mode accent colours on active nav item
- [x] Recent Chats — collapsible section, up to 15 sessions visible
- [x] User profile footer — avatar, name, email, sign-out button
- [x] Mobile drawer — slides in from left with backdrop overlay
- [x] Mobile top bar — 52px sticky bar with hamburger + brand

#### Chat History Persistence
- [x] `ChatContext.jsx` — shared chat state between Sidebar and AskPage
- [x] `useChatHistory.js` — localStorage, up to 20 sessions, auto-titled from first message
- [x] Session title = first user message (48 char truncation)
- [x] Sessions load on click from sidebar (navigate to /chat + restore messages)
- [x] "New conversation" button starts fresh session
- [x] History persisted after each completed request (triggers on pending → false)

#### Polling Booth Finder (/map)
- [x] `BoothFinder.jsx` + `BoothFinder.css` — standalone Google Maps page
- [x] `/map` route added to App.jsx
- [x] 4th mode card on homepage (purple accent #8B5CF6)
- [x] Dark-themed Google Maps (DARK_MAP_STYLES matching app palette)
- [x] Geolocation one-tap ("Use my location")
- [x] Address/PIN code search with Google Places autocomplete
- [x] Places search for polling booths and election offices
- [x] Numbered purple markers, results sidebar, click-to-pan
- [x] Directions link via Google Maps URL
- [x] Graceful no-API-key fallback (with link to ECI electoral portal)
- [x] CSP updated in firebase.json for maps.googleapis.com
- [x] Required env var: `VITE_MAPS_API_KEY`

#### Production Chat Quality
- [x] System prompt rewrite — direct answers first, strict citation rules, length guidance
- [x] RAG retrieval increased from k=5 to k=8 (more context per query)
- [x] Temperature set to 0.3 (factual, grounded, less creative drift)
- [x] Conversation history (last 3 turns) passed to Gemini for multi-turn support
- [x] Follow-up question suggestions — AI generates 3 via `<!--SUGGESTIONS-->` block, parsed as SSE event
- [x] Follow-up suggestions rendered as clickable chips after each answer
- [x] Message.jsx upgraded — full markdown: h2/h3, tables, blockquotes, code blocks, links, hr
- [x] 6 diverse StarterQuestions (was 4) — covers registration, EVM, migrant rights, etc.
- [x] `onSuggestions` SSE handler in askClient.js

#### App Architecture Updates
- [x] App.jsx — `AppLayout` wraps all routes, `ChatProvider` at root
- [x] Homepage — 4-column mode grid (was 3), no topbar auth (moved to sidebar)
- [x] `JourneySelector.jsx` + `LearnHome.jsx` — removed LanguageSwitcher (now in sidebar)
- [x] `AskPage.jsx` — no own header, uses `ChatContext`

## Routes
| Path | Component | Status |
|---|---|---|
| `/` | HomePage | ✅ |
| `/chat` | AskPage (ChatContext) | ✅ |
| `/guide` | JourneySelector | ✅ |
| `/guide/:journeyId` | JourneyPlayer | ✅ |
| `/learn` | LearnHome | ✅ |
| `/learn/:chapterId` | ChapterReader | ✅ |
| `/map` | BoothFinder | ✅ |

## Architecture Decisions
- Chat state lifted into `ChatContext` (not local to AskPage) so sidebar can manage sessions
- Sidebar state (collapsed/mobile) in `AppLayout` in `App.jsx` — passed as props, not context
- `useChatHistory` writes to localStorage; `ChatContext` owns the messages state
- Follow-up suggestions parsed from a structured comment block in the Gemini response
- Booth Finder uses modern Google Maps JS API with `importLibrary()` pattern
- All 3 original modes keep their own per-page headers (Guide/Learn have back-to-home)

## Current Blockers
None. All 4 modes fully built and deployed.

## Next Session Pick Up From
- Demo video — record walkthrough of all 4 modes
- Maps API key setup in Firebase — enable Maps JS API + Places API in Google Cloud Console
- Optional: Firestore-based chat history sync for authenticated users (cross-device)
