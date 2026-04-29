# MAI (மை) — Indian Election Assistant 🇮🇳

> **MAI (மை)** means "ink" in Tamil — specifically, the indelible ink applied to a voter's finger. Built for the Google Prompt Wars Challenge.

[![Live Demo](https://img.shields.io/badge/Live_Demo-maiapp--494222.web.app-F97316?style=for-the-badge&logo=firebase)](https://maiapp-494222.web.app)

MAI is an interactive, culturally-grounded assistant designed to help Indian voters navigate the complex election process. It moves beyond generic chat interfaces to offer a comprehensive, three-pillar approach to civic education and action.

## 🌟 The Three Modes of MAI

MAI is built on a custom design system ("Editorial Civic Journal") and provides three distinct modes, ensuring that every Indian voter is informed, prepared, and ready.

### 1. LEARN Mode 📚
An interactive, chapter-by-chapter election explainer.
- **6 Chapters** of factual, ECI-sourced content (no hallucinations).
- **Interactive Quizzes** to test knowledge with reveal animations.
- **EVM/VVPAT Simulator**: A high-fidelity, 3-panel interactive state machine (Control Unit, Ballot Unit, VVPAT) with a 7-second realistic countdown.
- **Accessibility**: Built-in Text-to-Speech (TTS) to read chapters aloud.

### 2. DO Mode 🚀
A Finite State Machine (FSM) driven journey player for real voter situations.
- **Guided Journeys**: 6 distinct, step-by-step flows for common scenarios (First-time voter, Missing name, Moved cities, Migrant worker, Election day companion, PwD/Senior citizen).
- **Interactive Steps**: Branching choices, required checklists, and actionable steps (Calendar reminders, phone links).
- **Gemini Fallback Helper**: Stuck on a step? Open the drawer to ask MAI—context-aware and RAG-grounded.
- **Smart Progress**: Auto-saves progress to `localStorage` (7-day expiry) so users can resume later. Celebrates completion with a custom canvas confetti burst.
- **Power User Friendly**: Navigate entirely with keyboard shortcuts (Enter, Escape, Number keys).

### 3. ASK Mode 💬
A highly accurate RAG (Retrieval-Augmented Generation) chatbot.
- **Grounded strictly in ECI Data**: Answers are pulled *only* from official Election Commission of India (ECI) FAQs, handbooks, and manuals.
- **Citations Included**: Every answer cites its source document to ensure trust and transparency.
- **Streaming UI**: Fast, real-time token streaming directly from Firebase Cloud Functions.

## 🛠️ Tech Stack & Google Services

This project relies heavily on the Google Cloud ecosystem and Gemini models to provide a seamless, serverless experience.

*   **Frontend**: React + Vite (Custom Design System, Tailwind CSS, Framer Motion)
*   **Backend / Serverless**: Firebase Cloud Functions (Node.js)
*   **AI Model**: Gemini 1.5 Pro
*   **Database & RAG Store**: Firebase Firestore (stores chunked ECI documents, journey state, and user progress)
*   **Authentication**: Firebase Auth (Google Sign-in)
*   **Hosting**: Firebase Hosting

### Google APIs Integrated
| Service | Role in MAI |
|---|---|
| **Gemini 1.5 Pro** | Powers the core RAG Q&A and DO Mode fallback helper. |
| **Firebase Services** | Firestore for RAG data, Cloud Functions for secure proxy, Auth, and Hosting. |
| **Google Maps JS API** | Polling booth and ERO office locator. |
| **Google Translate API** | Multi-language support (10 Indian languages). |
| **Google Text-to-Speech API** | Accessibility narration on all LEARN and DO steps. |
| **Google Calendar API** | Election date reminders and voter registration deadlines. |

## 🚀 Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dina2507/MAI.git
   cd MAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `functions/` directory and add your Google/Gemini API keys as required by the Cloud Functions.
   
4. **Run the local development server:**
   ```bash
   npm run dev
   ```

5. **Deploy to Firebase (Production):**
   ```bash
   firebase deploy
   ```

## 📂 Architecture & Data Strategy
*   **No Component Libraries**: The entire UI is built from scratch to maintain a unique "Civic Journal" editorial aesthetic (No MUI, Antd, or Shadcn).
*   **Free & Public Data**: All RAG data is sourced from free, public ECI portals (NVSP, eci.gov.in). No paid 3rd-party voter roll APIs were used.
*   **Data-Driven Architecture**: The FSM engine in DO Mode is completely driven by JSON configurations, allowing infinite scalable journeys without code changes.

---
*Built with ❤️ for the Google Prompt Wars Challenge.*
