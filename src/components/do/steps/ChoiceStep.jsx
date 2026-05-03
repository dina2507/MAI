import PropTypes from "prop-types";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChoiceStep({ step, onNext }) {
  useEffect(() => {
    function handleKey(e) {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num > 0 && num <= step.choices.length) {
        const choice = step.choices[num - 1];
        onNext(choice.nextStepId, { picked: choice.label });
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [step, onNext]);

  return (
    <motion.div
      className="step step-choice"
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
      <div className="choice-list">
        {step.choices.map((choice, i) => (
          <motion.button
            key={i}
            className="choice-card"
            onClick={() => onNext(choice.nextStepId, { picked: choice.label })}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="choice-text">
              <div className="choice-label">{choice.label}</div>
              {choice.sublabel && (
                <div className="choice-sublabel">{choice.sublabel}</div>
              )}
            </div>
            <ArrowRight size={18} className="choice-arrow" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

ChoiceStep.propTypes = {
  step: PropTypes.shape({
    title: PropTypes.string.isRequired,
    body: PropTypes.string,
    choices: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      sublabel: PropTypes.string,
      nextStepId: PropTypes.string.isRequired,
    })).isRequired,
  }).isRequired,
  onNext: PropTypes.func.isRequired,
};
