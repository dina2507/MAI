# Civic — Indian Election Assistant

**Civic** is an interactive civic education platform that helps every Indian voter understand the election process, timelines, and steps in an easy-to-follow way. It combines a RAG-powered Q&A chatbot, step-by-step guided journeys, and an interactive learning academy — all grounded exclusively in official Election Commission of India (ECI) documents.

[![Live Demo](https://img.shields.io/badge/Live_Demo-maiapp--494222.web.app-F97316?style=for-the-badge&logo=firebase)](https://maiapp-494222.web.app)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFCA28?style=flat&logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Pro-4285F4?style=flat&logo=google)](https://ai.google.dev)

---

## Problem Statement

> *Create an assistant that helps users understand the election process, timelines, and steps in an interactive and easy-to-follow way.*

Millions of Indian citizens — especially first-time voters, migrant workers, and rural communities — are denied their democratic rights simply because the election process feels too complex. Civic bridges that information gap by making India's electoral machinery clear, accessible, and actionable for every citizen.

---

## Features

### Chat — RAG-Powered Q&A
Ask any question about Indian elections and receive answers grounded **exclusively** in official ECI documents. No hallucinations — every answer cites its source.

- Streaming responses with real-time token rendering
- Inline citations with expandable source drawer
- Multi-turn conversation context (follow-up questions work naturally)
- Chat history saved locally — conversations persist across reloads
- Voice input via Web Speech API

### Guide — Voter Journey Companion
Step-by-step guided flows for six real voter situations, driven by a Finite State Machine engine.

| Journey | Steps |
|---|---|
| First-time voter registration (Form 6) | 8 |
| Name missing from electoral roll | 9 (with branching) |
| Moved cities / student away (Form 8) | 7 |
| Migrant worker — know your rights | 6 |
| Election day companion | 10 |
| PwD / Senior citizen — home voting | 7 |

- Auto-saves progress; resumes where you left off
- Keyboard shortcuts (Enter, Escape, number keys)
- Text-to-Speech narration on every step
- Google Calendar integration for election reminders
- Civic Helper — inline RAG assistance at any step

### Learn — Interactive Election Academy
Six chapters of factual, ECI-sourced content covering how India's democracy works.

- Interactive quizzes with instant feedback
- High-fidelity EVM/VVPAT simulator (3-panel state machine, 7-second voting cycle)
- Text-to-Speech narration
- Timeline, callout, and prose section types

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, custom design system, Framer Motion |
| Styling | Tailwind CSS utilities + custom CSS (no component libraries) |
| Backend | Firebase Cloud Functions (Node.js, asia-south1) |
| AI | Gemini 1.5 Flash (streaming) + Gemini Embedding 2 (RAG) |
| Database | Firebase Firestore (ECI document chunks, rate limits) |
| Auth | Firebase Auth — Google Sign-in |
| Hosting | Firebase Hosting |

### Google Services

| Service | Role |
|---|---|
| Gemini 1.5 Flash | Streaming RAG Q&A and Guide mode fallback |
| Gemini Embedding 2 | Semantic document retrieval (768-dim cosine similarity) |
| Firebase Firestore | ECI document chunks storage + rate limiting |
| Firebase Cloud Functions | Secure Gemini API proxy |
| Firebase Auth | Google Sign-in |
| Firebase Hosting | Production deployment |
| Google Translate API | 10 Indian languages (Hindi, Tamil, Telugu, and more) |
| Google Text-to-Speech | Accessibility narration across all modes |
| Google Calendar API | Election date reminders in Guide mode |
| Google Maps JS API | Polling booth and ERO office locator |

---

## RAG Architecture

1. **Ingestion** — ECI PDFs are parsed, chunked (~800 tokens with ~100-token overlap), and embedded using Gemini Embedding 2
2. **Storage** — Chunks and embeddings stored in Firestore (`eci_chunks` collection)
3. **Retrieval** — At query time: embed question → cosine similarity → top-5 chunks
4. **Generation** — Gemini streams an answer grounded strictly in retrieved passages, with citations

**Data sources (all free and public):**
- ECI FAQ: eci.gov.in/faq
- ECI Handbooks (downloadable PDFs)
- Form 6 / Form 8 instructions (NVSP portal)
- EVM/VVPAT process manual (ECI public PDF)

---

## Local Setup

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Auth, and Functions enabled

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
```

Set the Gemini API key as a Firebase secret:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

### 3. Ingest ECI documents

Place PDF files in `functions/documents/` and run:

```bash
cd functions
node ingest.js
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
│   ├── ask/          # Chat mode (RAG chatbot)
│   ├── do/           # Guide mode (FSM journeys)
│   ├── learn/        # Learn mode (academy)
│   └── ui/           # Shared components
├── hooks/
│   ├── useJourney.js          # FSM engine
│   ├── useJourneyProgress.js  # Journey persistence
│   └── useChatHistory.js      # Chat session persistence
├── journeys/         # 6 journey definitions (JSON)
├── learn/            # 6 chapter definitions
├── services/
│   ├── firebase.js   # Firebase init
│   └── askClient.js  # SSE streaming client
├── contexts/
│   └── AuthContext.jsx
└── design-system/    # CSS tokens and typography

functions/
├── index.js          # Cloud Functions (askGemini, askGeminiStream)
├── ingest.js         # PDF → chunks → embeddings pipeline
└── rateLimit.js      # Rate limiting (10/min, 100/day)
```

---

## Design Philosophy

- **No component libraries** — entire UI built from scratch for a unique "Editorial Civic Journal" aesthetic
- **Mobile-first** — designed and tested at 375px width
- **Dark mode first** — near-black background (#0A0A0F), saffron accent (#F97316)
- **Grounded AI** — the chatbot never invents information; every answer traces to an ECI document
- **Accessible** — Text-to-Speech on all content, multi-language support

---

*Built by Dinagar — because every Indian voter deserves to understand their democratic rights.*
