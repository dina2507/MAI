import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { CHAPTER_MAP, CHAPTERS } from "../../learn/chapters";
import SectionRenderer from "./SectionRenderer";
import "../learn/learn.css";

export default function ChapterReader() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const chapter = CHAPTER_MAP[chapterId];

  const currentIndex = CHAPTERS.findIndex((c) => c.id === chapterId);
  const prevChapter = CHAPTERS[currentIndex - 1] || null;
  const nextChapter = CHAPTERS[currentIndex + 1] || null;

  if (!chapter) {
    return (
      <div className="learn-not-found">
        <h2 className="text-display-lg">Chapter not found</h2>
        <button onClick={() => navigate("/learn")} className="learn-back-btn">
          Back to chapters
        </button>
      </div>
    );
  }

  const Icon = Icons[chapter.icon] || BookOpen;

  return (
    <div className="learn-reader" style={{ "--chapter-accent": chapter.accent }}>
      {/* Sticky top bar */}
      <header className="learn-reader-bar">
        <Link to="/learn" className="learn-reader-back">
          <ChevronLeft size={16} />
          All chapters
        </Link>
        <span className="learn-reader-number text-caption">
          Chapter {chapter.number}
        </span>
      </header>

      {/* Hero */}
      <div className="learn-reader-hero">
        <motion.div
          className="learn-chapter-icon-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Icon size={36} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="learn-chapter-eyebrow text-caption">
            Chapter {chapter.number} · {chapter.readTime}
          </div>
          <h1 className="text-display-2xl learn-reader-title">{chapter.title}</h1>
          <p className="text-body-lg learn-reader-subtitle">{chapter.subtitle}</p>
        </motion.div>
      </div>

      {/* Content */}
      <main className="learn-reader-content">
        {chapter.sections.map((section, i) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>

      {/* Chapter navigation */}
      <nav className="learn-chapter-nav">
        {prevChapter ? (
          <button
            className="learn-nav-btn"
            onClick={() => navigate(`/learn/${prevChapter.id}`)}
          >
            <ChevronLeft size={18} />
            <div>
              <div className="text-caption">Previous</div>
              <div className="learn-nav-title">{prevChapter.title}</div>
            </div>
          </button>
        ) : <div />}

        {nextChapter ? (
          <button
            className="learn-nav-btn next"
            onClick={() => navigate(`/learn/${nextChapter.id}`)}
          >
            <div>
              <div className="text-caption">Next</div>
              <div className="learn-nav-title">{nextChapter.title}</div>
            </div>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button className="learn-nav-btn next" onClick={() => navigate("/learn")}>
            <div>
              <div className="text-caption">All done!</div>
              <div className="learn-nav-title">Back to chapters</div>
            </div>
            <ChevronRight size={18} />
          </button>
        )}
      </nav>
    </div>
  );
}
