import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, X, HelpCircle, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";
import { useJourney } from "../../hooks/useJourney";
import { useJourneyProgress, loadProgress, clearProgress } from "../../hooks/useJourneyProgress";
import { getJourney } from "../../journeys";
import StepRenderer from "./StepRenderer";
import ProgressDots from "./ProgressDots";
import StepHelper from "./StepHelper";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import "./do.css";

export default function JourneyPlayer() {
  const { journeyId } = useParams();
  const navigate = useNavigate();
  const journey = getJourney(journeyId);
  const [showHelper, setShowHelper] = useState(false);

  // Lazy initial state: check for saved progress once on mount
  const [resumePrompt, setResumePrompt] = useState(() => {
    if (!journey) return null;
    const saved = loadProgress(journey.id);
    return saved && saved.currentStepId !== journey.startStepId ? saved : null;
  });

  if (!journey) {
    return (
      <div className="journey-not-found">
        <h2 className="text-display-lg">Journey not found</h2>
        <button onClick={() => navigate("/guide")} className="step-primary-btn">
          Back to journeys
        </button>
      </div>
    );
  }

  return (
    <JourneyView
      journey={journey}
      onExit={() => navigate("/guide")}
      resumeFrom={resumePrompt}
      onResumePromptDismiss={() => setResumePrompt(null)}
      showHelper={showHelper}
      setShowHelper={setShowHelper}
    />
  );
}

function JourneyView({ journey, onExit, resumeFrom, onResumePromptDismiss, showHelper, setShowHelper }) {
  const [shouldResume, setShouldResume] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const initialState = shouldResume === true ? resumeFrom : {};
  const j = useJourney(journey, initialState);

  useJourneyProgress(journey.id, {
    currentStepId: j.currentStepId,
    history: j.history,
    data: j.data,
    currentStep: j.currentStep,
  });

  // Cancel TTS when step changes — setState here is intentional cleanup
  useEffect(() => {
    window.speechSynthesis?.cancel();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSpeaking(false);
  }, [j.currentStepId]);

  function handleSpeak() {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = (j.currentStep?.title || "") + ". " + (j.currentStep?.body || j.currentStep?.summary || "").replace(/[^a-zA-Z0-9.,?!\s]/g, "");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  // Keyboard shortcuts
  const { canGoBack, back } = j;
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        if (showHelper) {
          setShowHelper(false);
        } else if (canGoBack) {
          back();
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showHelper, setShowHelper, canGoBack, back]);

  function handleExit() {
    if (!j.isComplete && j.history.length > 0) {
      setShowExitModal(true);
      return;
    }
    onExit();
  }

  function handleRestart() {
    clearProgress(journey.id);
    j.reset();
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
          <ProgressDots history={j.history} current={j.currentStepId} accent={journey.accent} stepIndex={j.stepIndex} totalSteps={j.totalSteps} />
        </div>
        <div className="topbar-right">
          <LanguageSwitcher />
          <button className="topbar-btn" onClick={handleSpeak} aria-label="Read aloud">
            {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
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
            journey={{ ...journey, _stepData: j.data }}
            onNext={j.goTo}
            onSaveData={j.saveStepData}
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
            Confused? Ask Civic
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

      <AnimatePresence>
        {showExitModal && (
          <ExitModal
            onStay={() => setShowExitModal(false)}
            onLeave={() => {
              setShowExitModal(false);
              onExit();
            }}
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

function ExitModal({ onStay, onLeave }) {
  return (
    <motion.div
      className="exit-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onStay}
    >
      <motion.div
        className="exit-modal"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-display-lg">Leave this journey?</h3>
        <p className="text-body exit-body">Your progress is saved automatically — you can resume later.</p>
        <div className="exit-actions">
          <button className="step-primary-btn" onClick={onStay}>Stay</button>
          <button className="step-secondary-btn" onClick={onLeave}>Leave</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
