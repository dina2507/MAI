import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { logCivicEvent } from "../../../services/analytics";

export function QuizSection({ section }) {
  const { question } = section;
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  function handleAnswer(i) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    
    const isCorrect = i === question.correct;
    logCivicEvent("quiz_answered", {
      question_text: question.question,
      is_correct: isCorrect,
      selected_option: question.options[i]
    });
  }

  const isCorrect = selected === question.correct;

  return (
    <div className="learn-quiz">
      <div className="learn-quiz-eyebrow text-caption">Quick check</div>
      <h3 className="learn-quiz-question">{question.question}</h3>
      <div className="learn-quiz-options">
        {question.options.map((opt, i) => {
          let state = "idle";
          if (revealed) {
            if (i === question.correct) state = "correct";
            else if (i === selected) state = "wrong";
          } else if (selected === i) {
            state = "selected";
          }
          return (
            <motion.button
              key={i}
              className={`learn-quiz-option ${state}`}
              onClick={() => handleAnswer(i)}
              disabled={revealed}
              whileTap={!revealed ? { scale: 0.98 } : {}}
            >
              <span className="learn-quiz-letter">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
              {revealed && i === question.correct && (
                <Check size={16} className="quiz-indicator" />
              )}
              {revealed && i === selected && i !== question.correct && (
                <X size={16} className="quiz-indicator" />
              )}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {revealed && (
          <motion.div
            className={`learn-quiz-result ${isCorrect ? "correct" : "wrong"}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="learn-quiz-verdict">
              {isCorrect ? "✓ Correct!" : "✗ Not quite"}
            </div>
            <div className="learn-quiz-explanation">{question.explanation}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
