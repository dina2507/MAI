import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import Citation from "./Citation";
import ThinkingIndicator from "./ThinkingIndicator";

export default function Message({ message, onOpenSource }) {
  const [copied, setCopied] = useState(false);

  if (message.role === "user") {
    return (
      <motion.div
        className="msg msg-user"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="msg-user-marker" aria-hidden />
        <p className="msg-user-text">{message.text}</p>
      </motion.div>
    );
  }

  // Assistant
  const isEmpty = !message.text && message.streaming;
  const isNoAnswer = message.text.toLowerCase().includes("i don't have information");

  return (
    <motion.article
      className="msg msg-assistant"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="msg-byline">
        <span className="msg-byline-mark" aria-hidden>M</span>
        <span className="text-caption msg-byline-label">MAI</span>
        {message.streaming && <ThinkingIndicator />}
      </header>

      {isEmpty ? (
        <div className="msg-initial-loading">
          <ThinkingIndicator large />
        </div>
      ) : (
        <>
          {isNoAnswer ? (
            <div className="msg-no-answer">
              <p className="msg-p">{message.text}</p>
              <a href="tel:1950" className="helpline-link">
                Call Voter Helpline 1950
              </a>
            </div>
          ) : (
            <div className="msg-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="msg-p">{renderWithCitations(children, message.sources, onOpenSource)}</p>,
                  ul: ({ children }) => <ul className="msg-ul">{children}</ul>,
                  ol: ({ children }) => <ol className="msg-ol">{children}</ol>,
                  li: ({ children }) => <li className="msg-li">{renderWithCitations(children, message.sources, onOpenSource)}</li>,
                  strong: ({ children }) => <strong className="msg-strong">{children}</strong>,
                  code: ({ children }) => <code className="msg-code">{children}</code>,
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )}

          {!message.streaming && message.sources?.length > 0 && (
            <footer className="msg-sources">
              <div className="text-caption msg-sources-label">Sources</div>
              <ol className="msg-sources-list">
                {message.sources.map((s) => (
                  <li key={s.index}>
                    <button
                      className="msg-source-btn"
                      onClick={() => onOpenSource(s)}
                    >
                      <span className="msg-source-num">[{s.index}]</span>
                      <span className="msg-source-title">{s.source}</span>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="msg-actions">
                <button
                  className="msg-action"
                  onClick={() => {
                    navigator.clipboard.writeText(message.text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </footer>
          )}
        </>
      )}
    </motion.article>
  );
}

/**
 * Replace inline [1], [2] markers in text with Citation components.
 * Walks through React children recursively.
 */
function renderWithCitations(children, sources, onOpenSource) {
  if (!sources?.length) return children;

  const walk = (node) => {
    if (typeof node === "string") {
      const parts = node.split(/(\[\d+\])/g);
      return parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const num = parseInt(match[1], 10);
          const source = sources.find((s) => s.index === num);
          return (
            <Citation
              key={i}
              number={num}
              source={source}
              onOpen={onOpenSource}
            />
          );
        }
        return part;
      });
    }
    if (Array.isArray(node)) {
      return node.map((n, i) => <span key={i}>{walk(n)}</span>);
    }
    return node;
  };

  return walk(children);
}
