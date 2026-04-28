import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ALL_JOURNEYS } from "../../journeys";
import { loadProgress } from "../../hooks/useJourneyProgress";
import "./do.css";

export default function JourneySelector() {
  const navigate = useNavigate();

  return (
    <div className="do-home">
      <header className="do-home-header">
        <div className="do-home-masthead">
          <span className="do-masthead-dot" />
          <span className="text-caption">MAI — DO</span>
        </div>
      </header>

      <main className="do-home-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="do-home-intro"
        >
          <h1 className="text-display-2xl">
            Pick what brought you{" "}
            <span className="text-display-italic" style={{ color: "var(--saffron-500)" }}>
              here today.
            </span>
          </h1>
          <p className="text-body-lg do-home-subtitle">
            Step-by-step guides through real voter situations. Pause and resume anytime.
          </p>
        </motion.div>

        <div className="journey-grid">
          {ALL_JOURNEYS.map((journey, i) => {
            const Icon = Icons[journey.icon] || Icons.Compass;
            const inProgress = loadProgress(journey.id);
            return (
              <motion.button
                key={journey.id}
                className="journey-card"
                onClick={() => navigate(`/do/${journey.id}`)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                whileHover={{ y: -3 }}
                style={{ "--card-accent": journey.accent }}
              >
                <div className="journey-card-icon">
                  <Icon size={22} />
                </div>
                <div className="journey-card-body">
                  <h3 className="journey-card-title">{journey.title}</h3>
                  <p className="journey-card-subtitle">{journey.subtitle}</p>
                  <div className="journey-card-meta">
                    <span className="text-caption">{journey.estimatedTime}</span>
                    {inProgress && (
                      <span className="journey-card-resume text-caption">In progress</span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
