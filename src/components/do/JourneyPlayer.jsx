import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, X, HelpCircle, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useJourney } from "../../hooks/useJourney";
import { useJourneyProgress, loadProgress, clearProgress } from "../../hooks/useJourneyProgress";
import { getJourney } from "../../journeys";
import StepRenderer from "./StepRenderer";
import ProgressDots from "./ProgressDots";
import StepHelper from "./StepHelper";
import "./do.css";

export default function JourneyPlayer() {
  const { journeyId } = useParams();
  const navigate = useNavigate();
  const journey = getJourney(journeyId);
  const [showHelper, setShowHelper] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(null);

  useEffect(() => {
    if (!journey) return;
    const saved = loadProgress(journey.id);
    if (saved && saved.currentStepId !== journey.startStepId) {
      setResumePrompt(saved);
    }
  }, [journey]);

  if (!journey) {
    return (
      <div className="journey-not-found">
        <h2 className="text-display-lg">Journey not found</h2>
        <button onClick={() => navigate("/do")} className="step-primary-btn">
          Back to journeys
        </button>
      </div>
    );
  }

  return (
    <JourneyView
      journey={journey}
      onExit={() => navigate("/do")}
      resumeFrom={resumePrompt}
      onResumePromptDismiss={() => setResumePrompt(null)}
      showHelper={showHelper}
      setShowHelper={setShowHelper}
    />
  );
}

function JourneyView({ journey, onExit, resumeFrom, onResumePromptDismiss, showHelper, setShowHelper }) {
  const [shouldResume, setShouldResume] = useState(null);

  const initialState = shouldResume === true ? resumeFrom : {};
  const j = useJourney(journey, initialState);

  useJourneyProgress(journey.id, {
    currentStepId: j.currentStepId,
    history: j.history,
    data: j.data,
    currentStep: j.currentStep,
  });

  function handleExit() {
    if (!j.isComplete && j.history.length > 0) {
      const ok = window.confirm("Leave this journey? Your progress is saved automatically — you can resume later.");
      if (!ok) return;
    }
    onExit();
  }

  function handleRestart() {
    if (window.confirm("Start over from the beginning?")) {
      clearProgress(journey.id);
      j.reset();
    }
  }

  if (resumeFrom && shouldResume === null) {
    return (
      <div className="journey-shell">
        <ResumePrompt
          journey={journey}
          onResume={() => {
            setShouldResume(true);
            onResumePromptDismiss();
          }}
          onStartOver={() => {
            clearProgress(journey.id);
            setShouldResume(false);
            onResumePromptDismiss();
          }}
        />
      </div>
    );
  }

  return (
    <div className="journey-shell" style={{ "--journey-accent": journey.accent }}>
      <header className="journey-topbar">
        <button className="topbar-btn" onClick={handleExit} aria-label="Exit journey">
          <X size={20} />
        </button>
        <div className="topbar-center">
          <ProgressDots history={j.history} current={j.currentStepId} accent={journey.accent} />
        </div>
        <div className="topbar-right">
          {!j.isComplete && (
            <button className="topbar-btn" onClick={handleRestart} aria-label="Restart journey">
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </header>

      <main className="journey-stage">
        <AnimatePresence mode="wait">
          <StepRenderer
            key={j.currentStepId}
            step={j.currentStep}
            journey={journey}
            onNext={j.goTo}
          />
        </AnimatePresence>
      </main>

      {!j.isComplete && (
        <footer className="journey-footer">
          <button className="footer-btn" onClick={j.back} disabled={!j.canGoBack}>
            <ChevronLeft size={16} />
            Back
          </button>
          <button className="footer-btn" onClick={() => setShowHelper(true)}>
            <HelpCircle size={16} />
            Confused? Ask MAI
          </button>
        </footer>
      )}

      <AnimatePresence>
        {showHelper && (
          <StepHelper
            journey={journey}
            step={j.currentStep}
            onClose={() => setShowHelper(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ResumePrompt({ journey, onResume, onStartOver }) {
  return (
    <motion.div
      className="resume-prompt"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="resume-card">
        <div className="text-caption resume-eyebrow">Welcome back</div>
        <h2 className="text-display-lg">Continue where you left off?</h2>
        <p className="text-body resume-body">
          You started <em>{journey.title}</em> earlier. Pick up where you stopped, or start over.
        </p>
        <div className="resume-actions">
          <button className="step-primary-btn" onClick={onResume}>Resume</button>
          <button className="step-secondary-btn" onClick={onStartOver}>Start over</button>
        </div>
      </div>
    </motion.div>
  );
}
