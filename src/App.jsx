import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AskPage from "./components/ask/AskPage";
import JourneySelector from "./components/do/JourneySelector";
import JourneyPlayer from "./components/do/JourneyPlayer";
import LearnHome from "./components/learn/LearnHome";
import ChapterReader from "./components/learn/ChapterReader";
import "./App.css";

function HomePage() {
  return (
    <div className="page">
      <span className="home-eyebrow text-caption">MAI — Indian Election Assistant</span>
      <h1 className="text-display-2xl home-title">
        Make every voter<br />
        <span className="text-display-italic">informed and ready.</span>
      </h1>
      <p className="text-body-lg home-subtitle">
        Your complete guide to Indian elections — ask, do, and learn.
      </p>
      <nav className="home-nav">
        <Link className="home-nav-link ask-link" to="/ask">
          <span className="home-nav-icon">✦</span>
          <span>ASK</span>
          <span className="home-nav-sub">RAG Chatbot</span>
        </Link>
        <Link className="home-nav-link do-link" to="/do">
          <span className="home-nav-icon">→</span>
          <span>DO</span>
          <span className="home-nav-sub">Guided Journeys</span>
        </Link>
        <Link className="home-nav-link learn-link" to="/learn">
          <span className="home-nav-icon">◎</span>
          <span>LEARN</span>
          <span className="home-nav-sub">Election Guide</span>
        </Link>
      </nav>
    </div>
  );
}

export default function App() {
  return (
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
  );
}
