import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function InfoStep({ step, onNext }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter") onNext(step.nextStepId);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, onNext]);

  return (
    <motion.div
      className="step step-info"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {step.eyebrow && (
        <div className="step-eyebrow text-caption">{step.eyebrow}</div>
      )}
      <h1 className="text-display-2xl step-title">{step.title}</h1>
      {step.body && (
        <div className="step-body text-body-lg">
          <ReactMarkdown>{step.body}</ReactMarkdown>
        </div>
      )}
      <button
        className="step-primary-btn"
        onClick={() => onNext(step.nextStepId)}
      >
        Continue
        <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}
