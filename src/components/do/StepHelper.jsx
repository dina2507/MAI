import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { askMai } from "../../services/askClient";

export default function StepHelper({ journey, step, onClose }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  async function handleAsk(q) {
    const queryText = q || question;
    if (!queryText.trim() || loading) return;
    setLoading(true);
    setAnswer("");
    setQuestion(queryText);

    // Build context-rich question
    const fullQuestion = `Context: A user is going through the journey "${journey.title}", currently on step "${step.title}". Their question is: ${queryText}`;

    abortRef.current = new AbortController();
    let buffer = "";

    await askMai(fullQuestion, abortRef.current.signal, {
      onSources: () => {},
      onToken: (token) => {
        buffer += token;
        setAnswer(buffer);
      },
      onDone: () => setLoading(false),
      onError: () => {
        setAnswer("Sorry — I couldn't fetch an answer. Try the Voter Helpline at 1950.");
        setLoading(false);
      },
    });
  }

  const suggestions = [
    "What does this step actually mean?",
    "Why is this required?",
    "What if I don't have this?",
  ];

  return (
    <motion.div
      className="helper-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="helper-drawer"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="helper-header">
          <div>
            <div className="text-caption helper-eyebrow">Helper</div>
            <h3 className="text-display-lg">Ask about this step</h3>
          </div>
          <button className="helper-close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="helper-body">
          {!answer && !loading && (
            <div className="helper-suggestions">
              <div className="text-caption">Tap one to ask instantly</div>
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="helper-suggestion"
                  onClick={() => handleAsk(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {answer && (
            <div className="helper-answer text-body-lg">
              {answer}
            </div>
          )}

          {loading && !answer && (
            <div className="helper-loading">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          )}
        </div>

        <footer className="helper-composer">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask anything about this step..."
            className="helper-input"
            disabled={loading}
          />
          <button
            className="helper-send"
            onClick={() => handleAsk()}
            disabled={!question.trim() || loading}
          >
            <Send size={16} />
          </button>
        </footer>
      </motion.aside>
    </motion.div>
  );
}
