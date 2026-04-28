import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AskPage from "./components/ask/AskPage";
import DoPage from "./components/do/DoPage";
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
        Design system active. Choose a mode below.
      </p>
      <nav className="home-nav">
        <Link className="home-nav-link" to="/ask">ASK — RAG Chatbot</Link>
        <Link className="home-nav-link" to="/do">DO — Guided Journeys</Link>
        <Link className="home-nav-link" to="/learn">LEARN — Election Guide</Link>
      </nav>
    </div>
  );
}

function Placeholder({ name }) {
  return (
    <div className="page">
      <Link className="placeholder-back" to="/">← Back</Link>
      <h1 className="text-display-xl placeholder-title">{name}</h1>
      <p className="text-body placeholder-body">Coming soon.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/do" element={<DoPage />} />
        <Route path="/learn" element={<Placeholder name="LEARN Mode" />} />
      </Routes>
    </BrowserRouter>
  );
}


