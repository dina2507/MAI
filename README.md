# Civic — Indian Election Assistant 🇮🇳

> **Civic** (formerly MAI) is a specialized intelligence platform designed to empower Indian citizens with accurate electoral knowledge. The name reflects our commitment to civic duty and informed participation.

[![Live Demo](https://img.shields.io/badge/Live_Demo-maiapp--494222.web.app-F97316?style=for-the-badge&logo=firebase)](https://maiapp-494222.web.app)

Civic is an interactive, culturally-grounded assistant designed to help Indian voters navigate the complex election process. It moves beyond generic chat interfaces to offer a comprehensive, three-pillar approach to civic education and action.

## 🌟 The Three Modes of Civic

Civic is built on a custom design system ("Editorial Civic Journal") and provides three distinct modes:

### 1. LEARN Mode 📚
An interactive, chapter-by-chapter election explainer.
- **6 Chapters** of factual, ECI-sourced content.
- **Interactive Quizzes** to test knowledge.
- **EVM/VVPAT Simulator**: A high-fidelity interactive state machine.
- **Accessibility**: Built-in Text-to-Speech (TTS).

### 2. GUIDE Mode 🚀
(Formerly DO mode) A Finite State Machine (FSM) driven journey player for real voter situations.
- **Guided Journeys**: 6 distinct flows for common scenarios.
- **Interactive Steps**: Branching choices and actionable checklists.
- **Civic Helper**: Context-aware RAG-grounded assistance.
- **Smart Progress**: Auto-saves progress locally.

### 3. CHAT Mode 💬
(Formerly ASK mode) A highly accurate RAG (Retrieval-Augmented Generation) chatbot.
- **Grounded strictly in ECI Data**: Official ECI FAQs and handbooks.
- **Citations Included**: Transparent source documentation.
- **Streaming UI**: Fast, real-time responses.

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
*Developed with ❤️ by Dinagar.*
