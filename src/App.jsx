import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Navigation, BookOpen, ChevronRight } from "lucide-react";
import AskPage from "./components/ask/AskPage";
import JourneySelector from "./components/do/JourneySelector";
import JourneyPlayer from "./components/do/JourneyPlayer";
import LearnHome from "./components/learn/LearnHome";
import ChapterReader from "./components/learn/ChapterReader";
import NotFound from "./components/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import LanguageSwitcher from "./components/ui/LanguageSwitcher";
import { AuthProvider } from "./contexts/AuthContext";
import AuthButton from "./components/ui/AuthButton";
import "./App.css";

function HomePage() {
  return (
    <div className="home-page">
      <header className="home-topbar">
        <LanguageSwitcher />
        <AuthButton />
      </header>
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
            <span className="text-caption">Civic — Indian Election Assistant</span>
          </div>
          <h1 className="text-display-2xl home-title">
            Your vote is your voice.
            <br />
            <span className="text-display-italic home-title-accent">
              Know how to use it.
            </span>
          </h1>
          <p className="text-body-lg home-subtitle">
            Civic is a specialized intelligence platform designed to empower 
            Indian voters. Ask questions grounded in ECI documents, follow 
            step-by-step voter journeys, or explore how India's democracy actually works.
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
            to: "/chat",
            icon: MessageCircle,
            name: "CHAT",
            accent: "#F97316",
            tagline: "RAG-powered query assistant",
            description: "Ask any question about Indian elections. Answers are grounded exclusively in official ECI documents — never hallucinated.",
            cta: "Start inquiry",
          },
          {
            to: "/guide",
            icon: Navigation,
            name: "GUIDE",
            accent: "#3B6FEB",
            tagline: "Guided voter journeys",
            description: "Step-by-step guides for real situations — first-time registration, name correction, election day, and more.",
            cta: "Pick your path",
          },
          {
            to: "/learn",
            icon: BookOpen,
            name: "LEARN",
            accent: "#15803D",
            tagline: "Interactive election academy",
            description: "6 chapters covering how elections work, voter registration, EVM/VVPAT, and your rights. Includes an interactive EVM simulator.",
            cta: "Start learning",
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
          Civic — Advanced Election Intelligence · Data sourced exclusively from{" "}
          <a href="https://www.eci.gov.in" target="_blank" rel="noopener">eci.gov.in</a>
          {" "}· Empowering every citizen
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<AskPage />} />
            <Route path="/guide" element={<JourneySelector />} />
            <Route path="/guide/:journeyId" element={<JourneyPlayer />} />
            <Route path="/learn" element={<LearnHome />} />
            <Route path="/learn/:chapterId" element={<ChapterReader />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
