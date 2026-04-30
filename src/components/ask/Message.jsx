import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Citation from "./Citation";
import ThinkingIndicator from "./ThinkingIndicator";

export default function Message({ message, onOpenSource, onAsk }) {
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

  const isEmpty = !message.text && message.streaming;
  const isNoAnswer =
    message.text.toLowerCase().includes("i don't have information") ||
    message.text.toLowerCase().includes("not in my verified");

  function handleCopy() {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <motion.article
      className="msg msg-assistant"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="msg-byline">
        <span className="msg-byline-mark" aria-hidden>C</span>
        <span className="text-caption msg-byline-label">Civic</span>
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
              <a href="tel:1950" className="helpline-link">Call Voter Helpline 1950</a>
            </div>
          ) : (
            <div className="msg-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h2 className="msg-h2">{children}</h2>,
                  h2: ({ children }) => <h2 className="msg-h2">{children}</h2>,
                  h3: ({ children }) => <h3 className="msg-h3">{children}</h3>,
                  p: ({ children }) => (
                    <p className="msg-p">
                      {renderWithCitations(children, message.sources, onOpenSource)}
                    </p>
                  ),
                  ul: ({ children }) => <ul className="msg-ul">{children}</ul>,
                  ol: ({ children }) => <ol className="msg-ol">{children}</ol>,
                  li: ({ children }) => (
                    <li className="msg-li">
                      {renderWithCitations(children, message.sources, onOpenSource)}
                    </li>
                  ),
                  strong: ({ children }) => <strong className="msg-strong">{children}</strong>,
                  em: ({ children }) => <em className="msg-em">{children}</em>,
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className="msg-code">{children}</code>
                    ) : (
                      <pre className="msg-pre"><code>{children}</code></pre>
                    ),
                  blockquote: ({ children }) => (
                    <blockquote className="msg-blockquote">{children}</blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="msg-table-wrap">
                      <table className="msg-table">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => <th className="msg-th">{children}</th>,
                  td: ({ children }) => <td className="msg-td">{children}</td>,
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener" className="msg-link">
                      {children}
                    </a>
                  ),
                  hr: () => <hr className="msg-hr" />,
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )}

          {!message.streaming && (
            <footer className="msg-footer">
              {message.sources?.length > 0 && (
                <div className="msg-sources">
                  <div className="text-caption msg-sources-label">Sources</div>
                  <ol className="msg-sources-list">
                    {message.sources.map((s) => (
                      <li key={s.index}>
                        <button className="msg-source-btn" onClick={() => onOpenSource(s)}>
                          <span className="msg-source-num">[{s.index}]</span>
                          <span className="msg-source-title">{s.source}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="msg-actions">
                <button className="msg-action" onClick={handleCopy}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>

              {message.suggestions?.length > 0 && (
                <div className="msg-suggestions">
                  <p className="text-caption msg-suggestions-label">Follow-up questions</p>
                  <div className="msg-suggestions-list">
                    {message.suggestions.map((s, i) => (
                      <button
                        key={i}
                        className="msg-suggestion"
                        onClick={() => onAsk?.(s)}
                      >
                        <span>{s}</span>
                        <ArrowUpRight size={13} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </footer>
          )}
        </>
      )}
    </motion.article>
  );
}

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
            <Citation key={i} number={num} source={source} onOpen={onOpenSource} />
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
