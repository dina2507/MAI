import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Navigation, BookOpen, ChevronRight } from "lucide-react";
import AskPage from "./components/ask/AskPage";
import JourneySelector from "./components/do/JourneySelector";
import JourneyPlayer from "./components/do/JourneyPlayer";
import LearnHome from "./components/learn/LearnHome";
import ChapterReader from "./components/learn/ChapterReader";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

function HomePage() {
  return (
    <div className="home-page">
      {/* Hero section */}
      <div className="home-hero">
        <motion.div
          className="home-hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="home-badge">
            <span className="home-badge-dot" />
            <span className="text-caption">MAI — Indian Election Assistant</span>
          </div>
          <h1 className="text-display-2xl home-title">
            Your vote is your voice.
            <br />
            <span className="text-display-italic home-title-accent">
              Know how to use it.
            </span>
          </h1>
          <p className="text-body-lg home-subtitle">
            MAI (மை) means "ink" in Tamil — the ink on the voter's finger.
            Ask questions grounded in ECI documents, follow step-by-step
            voter journeys, or explore how India's democracy actually works.
          </p>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          className="home-stats"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="home-stat">
            <span className="home-stat-value">3</span>
            <span className="home-stat-label">Modes</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-value">6</span>
            <span className="home-stat-label">Guided Journeys</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-value">6</span>
            <span className="home-stat-label">Chapters</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-value">∞</span>
            <span className="home-stat-label">Questions</span>
          </div>
        </motion.div>
      </div>

      {/* Mode cards */}
      <div className="home-modes">
        {[
          {
            to: "/ask",
            icon: MessageCircle,
            name: "ASK",
            accent: "#F97316",
            tagline: "RAG-powered chatbot",
            description: "Ask any question about Indian elections. Answers are grounded exclusively in official ECI documents — never hallucinated.",
            cta: "Start asking",
          },
          {
            to: "/do",
            icon: Navigation,
            name: "DO",
            accent: "#3B6FEB",
            tagline: "Guided voter journeys",
            description: "Step-by-step guides for real situations — first-time registration, name correction, election day, and more.",
            cta: "Pick your journey",
          },
          {
            to: "/learn",
            icon: BookOpen,
            name: "LEARN",
            accent: "#15803D",
            tagline: "Interactive election guide",
            description: "6 chapters covering how elections work, voter registration, EVM/VVPAT, and your rights. Includes an interactive EVM simulator.",
            cta: "Start reading",
          },
        ].map((mode, i) => (
          <motion.div
            key={mode.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.6 }}
          >
            <Link
              to={mode.to}
              className="home-mode-card"
              style={{ "--mode-accent": mode.accent }}
            >
              <div className="home-mode-header">
                <div className="home-mode-icon">
                  <mode.icon size={22} />
                </div>
                <span className="home-mode-name">{mode.name}</span>
                <ChevronRight size={18} className="home-mode-arrow" />
              </div>
              <div className="home-mode-tagline text-caption">{mode.tagline}</div>
              <p className="home-mode-desc">{mode.description}</p>
              <div className="home-mode-cta">
                {mode.cta}
                <ChevronRight size={14} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-line" />
        <p className="text-caption home-footer-text">
          Built for the Google Prompt Wars Challenge · Data sourced exclusively from{" "}
          <a href="https://www.eci.gov.in" target="_blank" rel="noopener">eci.gov.in</a>
          {" "}· No paid APIs
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/do" element={<JourneySelector />} />
          <Route path="/do/:journeyId" element={<JourneyPlayer />} />
          <Route path="/learn" element={<LearnHome />} />
          <Route path="/learn/:chapterId" element={<ChapterReader />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
