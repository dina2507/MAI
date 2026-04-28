import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChecklistStep({ step, onNext, journey, onSaveData }) {
  // Restore checked state from journey data if navigating back
  const savedData = journey?._stepData?.[step.id];
  const [checked, setChecked] = useState(savedData?.checked || {});

  const toggle = (id) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Proactively save to FSM so back-navigation preserves state
      onSaveData?.(step.id, { checked: next });
      return next;
    });
  };

  const requiredItems = step.items.filter((i) => i.required);
  const allRequiredChecked = requiredItems.every((i) => checked[i.id]);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <motion.div
      className="step step-checklist"
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
      <div className="checklist">
        {step.items.map((item, i) => {
          const isChecked = checked[item.id];
          return (
            <motion.button
              key={item.id}
              className={`checklist-item ${isChecked ? "checked" : ""}`}
              onClick={() => toggle(item.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className={`checkbox ${isChecked ? "checked" : ""}`}>
                {isChecked && <Check size={14} strokeWidth={3} />}
              </div>
              <div className="checklist-text">
                <div className="checklist-label">
                  {item.label}
                  {item.required && <span className="req">*</span>}
                </div>
                {item.hint && <div className="checklist-hint">{item.hint}</div>}
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="checklist-footer">
        <div className="checklist-count text-caption">
          {checkedCount} of {step.items.length} ticked
        </div>
        <button
          className="step-primary-btn"
          onClick={() => onNext(step.continueStepId, { checked })}
          disabled={requiredItems.length > 0 && !allRequiredChecked}
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
