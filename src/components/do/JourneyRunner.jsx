import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";

export default function JourneyRunner({ journey, onComplete }) {
  const [currentNodeId, setCurrentNodeId] = useState(journey.initialNodeId);
  const [history, setHistory] = useState([journey.initialNodeId]); // for back navigation if needed

  const node = journey.nodes[currentNodeId];

  function handleNext(targetId) {
    if (!targetId) return;
    setHistory((h) => [...h, targetId]);
    setCurrentNodeId(targetId);
  }

  function handleBack() {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      setHistory(newHistory);
      setCurrentNodeId(newHistory[newHistory.length - 1]);
    }
  }

  if (!node) {
    return <div className="text-error">Error: Node {currentNodeId} not found.</div>;
  }

  return (
    <div className="runner">
      <header className="runner-header">
        <h2 className="text-display-xl runner-title">{journey.title}</h2>
        <div className="runner-progress">
          Step {history.length}
        </div>
      </header>

      <div className="runner-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNodeId}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="node-container"
          >
            <div className="node-content">
              <ReactMarkdown>{node.content}</ReactMarkdown>
            </div>

            <div className="node-actions">
              {node.type === "question" && node.options && (
                <div className="options-grid">
                  {node.options.map((opt, i) => (
                    <button
                      key={i}
                      className="btn-option"
                      onClick={() => handleNext(opt.targetNodeId)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {node.type === "info" && node.nextNodeId && (
                <button
                  className="btn-primary"
                  onClick={() => handleNext(node.nextNodeId)}
                >
                  Continue <ArrowRight size={16} />
                </button>
              )}

              {node.type === "action" && (
                <a
                  href={node.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  {node.actionLabel || "Proceed"} <ExternalLink size={16} />
                </a>
              )}

              {node.isTerminal && (
                <div className="terminal-state">
                  <div className="terminal-message text-caption">
                    <CheckCircle2 size={16} className="text-success" />
                    Journey Complete
                  </div>
                  <button className="btn-secondary" onClick={onComplete}>
                    Return to Journeys
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {history.length > 1 && (
        <footer className="runner-footer">
          <button className="btn-ghost" onClick={handleBack}>
            ← Back to previous step
          </button>
        </footer>
      )}
    </div>
  );
}
