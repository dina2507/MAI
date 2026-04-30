import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Navigation, BookOpen, MapPin, ChevronRight, Menu } from "lucide-react";
import AskPage from "./components/ask/AskPage";
import JourneySelector from "./components/do/JourneySelector";
import JourneyPlayer from "./components/do/JourneyPlayer";
import LearnHome from "./components/learn/LearnHome";
import ChapterReader from "./components/learn/ChapterReader";
import BoothFinder from "./components/map/BoothFinder";
import NotFound from "./components/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import Sidebar from "./components/ui/Sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import "./App.css";

const MODE_CARDS = [
  {
    to: "/chat",
    icon: MessageCircle,
    name: "CHAT",
    accent: "#F97316",
    tagline: "RAG-powered Q&A assistant",
    description: "Ask anything about Indian elections. Every answer is grounded in official ECI documents — never hallucinated. Cites sources inline.",
    cta: "Start asking",
  },
  {
    to: "/guide",
    icon: Navigation,
    name: "GUIDE",
    accent: "#3B6FEB",
    tagline: "Step-by-step voter journeys",
    description: "Guided flows for real situations — first-time registration, name correction, election day walkthrough, and more.",
    cta: "Pick your journey",
  },
  {
    to: "/learn",
    icon: BookOpen,
    name: "LEARN",
    accent: "#15803D",
    tagline: "Interactive election academy",
    description: "6 chapters on how elections work, voter rights, EVM/VVPAT, and registration. Includes an interactive EVM simulator.",
    cta: "Start learning",
  },
  {
    to: "/map",
    icon: MapPin,
    name: "FIND BOOTH",
    accent: "#8B5CF6",
    tagline: "Locate your polling station",
    description: "Find the polling booth and Electoral Registration Office nearest to you using Google Maps.",
    cta: "Find my booth",
  },
];

function HomePage() {
  return (
    <div className="home-page">
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
            <span className="text-display-italic home-title-accent">Know how to use it.</span>
          </h1>
          <p className="text-body-lg home-subtitle">
            Civic helps every Indian voter understand the election process, timelines, and steps — through verified answers, guided journeys, and interactive learning.
          </p>
        </motion.div>

        <motion.div
          className="home-stats"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="home-stat">
            <span className="home-stat-value">4</span>
            <span className="home-stat-label">Modes</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-value">6</span>
            <span className="home-stat-label">Journeys</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-value">6</span>
            <span className="home-stat-label">Chapters</span>
          </div>
          <div className="home-stat-divider" />
          <div className="home-stat">
            <span className="home-stat-value">ECI</span>
            <span className="home-stat-label">Verified</span>
          </div>
        </motion.div>
      </div>

      <div className="home-modes">
        {MODE_CARDS.map((mode, i) => (
          <motion.div
            key={mode.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.09, duration: 0.55 }}
          >
            <Link
              to={mode.to}
              className="home-mode-card"
              style={{ "--mode-accent": mode.accent }}
            >
              <div className="home-mode-header">
                <div className="home-mode-icon">
                  <mode.icon size={20} />
                </div>
                <span className="home-mode-name">{mode.name}</span>
                <ChevronRight size={16} className="home-mode-arrow" />
              </div>
              <div className="home-mode-tagline text-caption">{mode.tagline}</div>
              <p className="home-mode-desc">{mode.description}</p>
              <div className="home-mode-cta">
                {mode.cta}
                <ChevronRight size={13} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <footer className="home-footer">
        <div className="home-footer-line" />
        <p className="text-caption home-footer-text">
          Civic — Data sourced exclusively from{" "}
          <a href="https://www.eci.gov.in" target="_blank" rel="noopener">eci.gov.in</a>
          {" "}· Built by Dinagar
        </p>
      </footer>
    </div>
  );
}

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`app-layout ${collapsed ? "app-layout--collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="app-main">
        {/* Mobile top bar */}
        <div className="app-mobile-bar">
          <button
            className="app-mobile-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="app-mobile-brand">Civic</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChatProvider>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat" element={<AskPage />} />
                <Route path="/guide" element={<JourneySelector />} />
                <Route path="/guide/:journeyId" element={<JourneyPlayer />} />
                <Route path="/learn" element={<LearnHome />} />
                <Route path="/learn/:chapterId" element={<ChapterReader />} />
                <Route path="/map" element={<BoothFinder />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </ChatProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
