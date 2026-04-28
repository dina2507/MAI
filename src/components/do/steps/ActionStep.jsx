import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Calendar, Phone, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function ActionStep({ step, onNext }) {
  const [actionDone, setActionDone] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter") onNext(step.continueStepId);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, onNext]);

  function handleAction() {
    const a = step.action;
    if (a.type === "link") {
      window.open(a.url, "_blank", "noopener");
    } else if (a.type === "phone") {
      window.location.href = `tel:${a.phone}`;
    } else if (a.type === "calendar") {
      addToGoogleCalendar(a.calendar);
    } else if (a.type === "copy") {
      navigator.clipboard.writeText(a.url || step.body || "");
    }
    setActionDone(true);
  }

  function actionIcon() {
    const t = step.action?.type;
    if (t === "link") return <ExternalLink size={18} />;
    if (t === "phone") return <Phone size={18} />;
    if (t === "calendar") return <Calendar size={18} />;
    if (t === "copy") return actionDone ? <Check size={18} /> : <Copy size={18} />;
    return null;
  }

  return (
    <motion.div
      className="step step-action"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {step.eyebrow && <div className="step-eyebrow text-caption">{step.eyebrow}</div>}
      <h1 className="text-display-2xl step-title">{step.title}</h1>
      {step.body && (
        <div className="step-body text-body-lg">
          <ReactMarkdown>{step.body}</ReactMarkdown>
        </div>
      )}
      <button className="action-card" onClick={handleAction}>
        <div className="action-icon">{actionIcon()}</div>
        <div className="action-label">{step.action.label}</div>
      </button>
      <button
        className="step-secondary-btn"
        onClick={() => onNext(step.continueStepId)}
      >
        {actionDone ? "Continue" : "I'll do this later — continue"}
        <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}

/**
 * Generates a Google Calendar link and opens it in a new tab.
 * Date defaults to 1 week from today if not provided.
 */
function addToGoogleCalendar({ title, description, date }) {
  const start = date ? new Date(date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d) => {
    const iso = d.toISOString();
    return iso.replace(/[-:]|\.\d{3}/g, "");
  };
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(description || "")}`;
  window.open(url, "_blank", "noopener");
}
