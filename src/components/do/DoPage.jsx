import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { journeys } from "../../journeys";
import JourneyRunner from "./JourneyRunner";
import "./do.css";

export default function DoPage() {
  const [activeJourney, setActiveJourney] = useState(null);

  return (
    <div className="do-page">
      {/* Editorial Header */}
      <header className="do-header">
        <div className="do-header-inner">
          <div className="do-masthead">
            <span className="do-masthead-dot" aria-hidden />
            <span className="text-caption">MAI — DO</span>
          </div>
          {activeJourney && (
            <button
              className="do-back-btn"
              onClick={() => setActiveJourney(null)}
            >
              <ArrowLeft size={16} />
              <span>All Journeys</span>
            </button>
          )}
        </div>
      </header>

      <main className="do-stage">
        <AnimatePresence mode="wait">
          {!activeJourney ? (
            <motion.div
              key="catalog"
              className="do-catalog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-display-2xl do-title">
                What do you need to{" "}
                <span className="text-display-italic do-title-accent">do?</span>
              </h1>
              <p className="text-body-lg do-subtitle">
                Guided, step-by-step walkthroughs for common voter situations.
              </p>

              <div className="journey-grid">
                {journeys.map((journey, i) => (
                  <motion.button
                    key={journey.id}
                    className="journey-card"
                    onClick={() => setActiveJourney(journey)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.15 + i * 0.08,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="journey-card-header">
                      <span className="text-caption">Journey {i + 1}</span>
                      <span className="journey-time">{journey.estimatedTime}</span>
                    </div>
                    <h3 className="journey-card-title">{journey.title}</h3>
                    <p className="journey-card-desc">{journey.description}</p>
                    <div className="journey-card-action">
                      <span>Start Journey</span>
                      <ArrowRight size={16} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="runner"
              className="do-runner-wrapper"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <JourneyRunner journey={activeJourney} onComplete={() => setActiveJourney(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
