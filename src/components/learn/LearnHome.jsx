import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { BookOpen, Cpu, ChevronLeft } from "lucide-react";
import { CHAPTERS } from "../../learn/chapters";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import "../learn/learn.css";

export default function LearnHome() {
  return (
    <div className="learn-home">
      <header className="learn-home-header">
        <div className="learn-home-masthead">
          <Link to="/" className="learn-home-link">
            <span className="learn-masthead-dot" />
            <span className="text-caption">MAI — LEARN</span>
          </Link>
          <div className="learn-home-actions">
            <LanguageSwitcher />
            <Link to="/" className="learn-back-home-btn">
              <ChevronLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="learn-home-main">
        <motion.div
          className="learn-home-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-display-2xl">
            Understand the election{" "}
            <span className="text-display-italic" style={{ color: "var(--saffron-500)" }}>
              from the ground up.
            </span>
          </h1>
          <p className="text-body-lg learn-home-subtitle">
            6 chapters on how Indian democracy actually works. Each takes less than 7 minutes.
          </p>
        </motion.div>

        {/* Chapter grid */}
        <div className="learn-chapter-grid">
          {CHAPTERS.map((chapter, i) => {
            const Icon = Icons[chapter.icon] || BookOpen;
            return (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.5 }}
              >
                <Link
                  to={`/learn/${chapter.id}`}
                  className="learn-chapter-card"
                  style={{ "--card-accent": chapter.accent }}
                >
                  <div className="learn-card-number text-caption">
                    Chapter {chapter.number}
                  </div>
                  <div className="learn-card-icon">
                    <Icon size={22} />
                  </div>
                  <h2 className="learn-card-title">{chapter.title}</h2>
                  <p className="learn-card-subtitle">{chapter.subtitle}</p>
                  <div className="learn-card-footer">
                    <span className="text-caption">{chapter.readTime}</span>
                    {chapter.sections.some((s) => s.type === "evm") && (
                      <span className="learn-card-badge">
                        <Cpu size={11} />
                        Interactive
                      </span>
                    )}
                    {chapter.sections.some((s) => s.type === "quiz") && (
                      <span className="learn-card-badge">Quiz</span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* EVM callout */}
        <motion.div
          className="learn-evm-callout"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="learn-evm-callout-icon">
            <Cpu size={24} />
          </div>
          <div>
            <div className="learn-evm-callout-title">Try the EVM Simulator</div>
            <div className="learn-evm-callout-body text-caption">
              Chapter 4 includes an interactive EVM — press the buttons and watch the VVPAT in action.
            </div>
          </div>
          <Link to="/learn/evm-vvpat" className="learn-evm-callout-link">
            Go to Chapter 4 →
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
