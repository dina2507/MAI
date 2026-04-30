# Civic — Indian Election Assistant

**Civic** is an interactive civic education platform that helps every Indian voter understand the election process, timelines, and steps in an easy-to-follow way. It combines a RAG-powered Q&A chatbot, step-by-step guided journeys, an interactive learning academy, and a polling booth locator — all grounded in official Election Commission of India (ECI) documents.

[![Live Demo](https://img.shields.io/badge/Live_Demo-maiapp--494222.web.app-F97316?style=for-the-badge&logo=firebase)](https://maiapp-494222.web.app)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=flat&logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-Flash-4285F4?style=flat&logo=google)](https://ai.google.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev)

---

## Problem Statement

> *Create an assistant that helps users understand the election process, timelines, and steps in an interactive and easy-to-follow way.*

Millions of Indian citizens — especially first-time voters, migrant workers, and rural communities — are denied their democratic rights simply because the election process feels too complex. Civic bridges that information gap by making India's electoral machinery clear, accessible, and actionable for every citizen.

---

## Features

### Chat — RAG-Powered Q&A
Ask any question about Indian elections and receive answers grounded **exclusively** in official ECI documents.

- Streaming responses with real-time token rendering
- Inline citations `[1]` `[2]` with expandable source drawer
- Multi-turn conversation context — follow-up questions work naturally
- AI-generated follow-up suggestions after every answer
- Chat history persisted locally — conversations survive page refreshes
- Up to 20 sessions stored and accessible from the sidebar
- Voice input via Web Speech API (Indian English)
- Gemini Flash with temperature 0.3 for factual, grounded responses

### Guide — Voter Journey Companion
Step-by-step guided flows for six real voter situations, driven by a Finite State Machine engine.

| Journey | Steps |
|---|---|
| First-time voter registration (Form 6) | 8 |
| Name missing from electoral roll | 9 (with 3 branching paths) |
| Moved cities / student away (Form 8A) | 7 |
| Migrant worker — know your rights | 6 |
| Election day companion (booth → EVM → VVPAT) | 10 |
| PwD / Senior citizen — home voting & Saksham | 7 |

- Auto-saves progress; resumes where you left off
- Keyboard shortcuts (Enter, Escape, number keys for choices)
- Text-to-Speech narration on every step
- Google Calendar integration for election date reminders
- Civic Helper — inline RAG assistance at any step

### Learn — Interactive Election Academy
Six chapters of factual, ECI-sourced content covering how India's democracy works.

- Interactive quizzes with instant feedback and explanations
- High-fidelity EVM/VVPAT simulator — 3-panel state machine with 7-second voting cycle
- Text-to-Speech narration
- Timeline, callout, prose, and quiz section types

### Find Booth — Polling Station Locator
Locate the nearest polling booth and Electoral Registration Office.

- Google Maps with dark theme matching the app aesthetic
- Geolocation one-tap search or address/PIN code input
- Google Places autocomplete for Indian addresses
- Results list with numbered markers and directions link
- Fallback to official ECI electoral search portal

---

## Sidebar Navigation
Persistent collapsible sidebar across all modes — modelled after modern chat UIs.

- **Collapse/expand** — 260px full view ↔ 64px icon-only mode
- **Mode navigation** — Chat, Guide, Learn, Find Booth with per-mode accent colours
- **Chat history** — auto-titled from first message, up to 20 sessions, click to restore
- **User profile** — Google Sign-in with avatar, name, and one-click sign-out
- **Mobile** — slides in as a full-height drawer with backdrop overlay

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, custom design system, Framer Motion |
| Styling | Tailwind CSS utilities + custom CSS — no component libraries |
| Backend | Firebase Cloud Functions (Node.js, asia-south1) |
| AI — Generation | Gemini Flash (streaming, temperature 0.3) |
| AI — Embeddings | Gemini Embedding 2 (768-dim cosine similarity, top-8 retrieval) |
| Database | Firebase Firestore (ECI document chunks, rate limits) |
| Auth | Firebase Auth — Google Sign-in |
| Hosting | Firebase Hosting |

### Google Services

| Service | Role |
|---|---|
| Gemini Flash | Streaming RAG Q&A + Guide mode fallback helper |
| Gemini Embedding 2 | Semantic document retrieval (768-dim, top-8 chunks) |
| Firebase Firestore | ECI document chunk storage + rate limiting |
| Firebase Cloud Functions | Secure Gemini API proxy (rate limited: 10/min, 100/day) |
| Firebase Auth | Google Sign-in, user identity |
| Firebase Hosting | Production deployment |
| Google Translate API | 10 Indian languages (Hindi, Tamil, Telugu, Bengali, and more) |
| Google Text-to-Speech | Accessibility narration across all modes |
| Google Calendar API | Election date reminders in Guide mode |
| Google Maps JS API | Polling booth and ERO office locator |

---

## RAG Architecture

```
ECI PDF Documents
      ↓ (ingest.js)
  Parse + Chunk (~800 tokens, ~100 overlap)
      ↓
  Embed (Gemini Embedding 2, 768-dim)
      ↓
  Store in Firestore (eci_chunks collection)

At query time (askGeminiStream Cloud Function):
  User question → Embed → Cosine similarity → Top-8 chunks
      ↓
  Build prompt: system instructions + passages + conversation history
      ↓
  Gemini Flash streams answer (temperature 0.3)
      ↓
  Server-Sent Events → Frontend renders tokens + citations + suggestions
```

**Data sources — all free and public:**
- ECI FAQ: eci.gov.in/faq
- ECI Handbooks (downloadable PDFs from eci.gov.in)
- Form 6 / Form 8A instructions (NVSP portal)
- EVM/VVPAT process manual (ECI public PDF)

---

## Local Setup

### Prerequisites
- Node.js 18+
- Firebase CLI — `npm install -g firebase-tools`
- A Firebase project with Firestore, Functions, and Auth enabled

### 1. Clone and install

```bash
git clone https://github.com/dina2507/MAI.git
cd MAI
npm install
cd functions && npm install && cd ..
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional — enables the polling booth map
VITE_MAPS_API_KEY=your_google_maps_api_key
```

Set the Gemini API key as a Firebase secret:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

### 3. Ingest ECI documents

Place ECI PDF files in `functions/documents/` then run:

```bash
cd functions && node ingest.js
```

### 4. Run locally

```bash
npm run dev
```

### 5. Deploy to Firebase

```bash
npm run build
firebase deploy
```

---

## Project Structure

```
src/
├── components/
│   ├── ask/               Chat mode — RAG chatbot
│   │   ├── AskPage.jsx
│   │   ├── ChatStream.jsx
│   │   ├── Message.jsx    Full markdown + follow-up suggestions
│   │   ├── Composer.jsx   Voice input + auto-grow textarea
│   │   ├── StarterQuestions.jsx
│   │   ├── SourceDrawer.jsx
│   │   └── ask.css
│   ├── do/                Guide mode — FSM journey player
│   ├── learn/             Learn mode — interactive academy
│   ├── map/               Find Booth — Google Maps locator
│   │   ├── BoothFinder.jsx
│   │   └── BoothFinder.css
│   └── ui/                Shared components
│       ├── Sidebar.jsx    Collapsible navigation sidebar
│       ├── Sidebar.css
│       ├── AuthButton.jsx
│       └── LanguageSwitcher.jsx
├── contexts/
│   ├── AuthContext.jsx    Firebase Auth provider
│   └── ChatContext.jsx    Shared chat state (sidebar ↔ AskPage)
├── hooks/
│   ├── useJourney.js              FSM engine
│   ├── useJourneyProgress.js      Journey localStorage persistence
│   └── useChatHistory.js          Chat session localStorage (20 sessions)
├── journeys/              6 journey JSON definitions + FSM index
├── learn/                 6 chapter definitions
├── services/
│   ├── firebase.js        Firebase init
│   ├── askClient.js       SSE streaming client (history + suggestions)
│   └── analytics.js       Firebase Analytics wrapper
└── design-system/         CSS tokens and typography

functions/
├── index.js               askGemini + askGeminiStream Cloud Functions
├── ingest.js              PDF → chunks → embeddings pipeline
└── rateLimit.js           Rate limiting (10/min, 100/day per fingerprint)
```

---

## Design Philosophy

- **No component libraries** — entire UI built from scratch; "Editorial Civic Journal" aesthetic
- **Mobile-first** — designed and tested at 375px width; sidebar becomes a drawer on mobile
- **Dark mode first** — near-black background (#0A0A0F), deep saffron accent (#F97316)
- **Grounded AI** — every Chat answer traces back to an ECI document; no hallucinations
- **Accessible** — Text-to-Speech on all content, 10 Indian languages via Google Translate
- **Persistent** — chat history, journey progress, and chapter progress all survive page refreshes

---

*Built by Dinagar — because every Indian voter deserves to understand their democratic rights.*
