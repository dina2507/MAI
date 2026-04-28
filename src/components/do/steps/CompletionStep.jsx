import { motion } from "framer-motion";
import { Check, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function CompletionStep({ step, journey, onComplete }) {
  const navigate = useNavigate();

  function handleAction(action) {
    if (action.type === "journey") {
      navigate(`/do/${action.target}`);
    } else if (action.type === "link") {
      if (action.target?.startsWith("tel:")) {
        window.location.href = action.target;
      } else {
        window.open(action.target, "_blank", "noopener");
      }
    } else if (action.type === "close") {
      navigate("/do");
    }
    onComplete?.();
  }

  return (
    <motion.div
      className="step step-completion"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="completion-mark"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -8, 0] }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Check size={42} strokeWidth={2.5} />
      </motion.div>
      <h1 className="text-display-2xl step-title">{step.title}</h1>
      {step.summary && (
        <div className="step-body text-body-lg">
          <ReactMarkdown>{step.summary}</ReactMarkdown>
        </div>
      )}
      {step.nextActions?.length > 0 && (
        <div className="completion-actions">
          {step.nextActions.map((action, i) => (
            <motion.button
              key={i}
              className={`completion-btn ${i === 0 ? "primary" : "secondary"}`}
              onClick={() => handleAction(action)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              whileTap={{ scale: 0.98 }}
            >
              {action.label}
              {action.type === "close" ? <X size={16} /> : <ArrowRight size={16} />}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
