# MAI — Indian Election Assistant
> MAI (மை) means "ink" in Tamil — the ink on the voter's finger.
> Built for Google Prompt Wars Challenge.

## Problem Statement
Create an assistant that helps users understand the Indian election 
process, timelines, and steps in an interactive and easy-to-follow way.

## What MAI Does
Three modes, one mission — make every Indian voter informed and ready:

1. **LEARN** — Interactive chapter-by-chapter election explainer + EVM Simulator
2. **DO** — FSM-driven guided journeys for 6 real voter situations
3. **ASK** — Gemini RAG chatbot grounded ONLY on public ECI documents

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
| Google Calendar API | Election date reminders |

## The 6 DO-Mode Journeys (FSM)
1. First-time voter → Form 6 walkthrough
2. Name missing from list → Diagnostic + remedies
3. Moved cities / student away → Form 8 / transfer guide
4. Migrant worker → Rights + alternative address proofs
5. Election day companion → Booth → EVM → VVPAT
6. PwD / Senior citizen → Home voting + Saksham guide

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
src/
├── components/
│   ├── ui/           ← Custom base components (Button, Card, etc.)
│   ├── learn/        ← LEARN mode components
│   ├── do/           ← DO mode FSM components
│   └── ask/          ← ASK mode chatbot
├── journeys/         ← FSM journey definitions (data, not components)
├── rag/              ← RAG pipeline utilities
├── hooks/            ← Custom React hooks
├── services/         ← Firebase + Google API wrappers
├── design-system/    ← tokens.css, typography, animations
└── pages/            ← Route-level components

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
- [x] Phase 1 (DO Mode) — Complete Build Done
→ Check PROGRESS.md for next steps (LEARN Mode)