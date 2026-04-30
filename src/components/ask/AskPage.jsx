import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ChatStream from "./ChatStream";
import Composer from "./Composer";
import StarterQuestions from "./StarterQuestions";
import SourceDrawer from "./SourceDrawer";
import { askCivic } from "../../services/askClient";
import { useChatHistory } from "../../hooks/useChatHistory";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import AuthButton from "../ui/AuthButton";
import "./ask.css";

export default function AskPage() {
  const { activeMessages, persistMessages, startNewSession, sessions, loadSession } = useChatHistory();
  const [messages, setMessages] = useState(activeMessages);
  const [pending, setPending] = useState(false);
  const [openSource, setOpenSource] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const abortRef = useRef(null);

  // Save to localStorage whenever a request completes
  useEffect(() => {
    if (!pending && messages.length > 0) {
      persistMessages(messages);
    }
  }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAsk(question) {
    if (!question.trim() || pending) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", text: question };
    const aiMsgId = crypto.randomUUID();
    const aiMsg = { id: aiMsgId, role: "assistant", text: "", sources: [], streaming: true };

    setMessages((m) => [...m, userMsg, aiMsg]);
    setPending(true);

    const abort = new AbortController();
    abortRef.current = abort;

    // Build history from completed exchanges (last 6 entries = 3 turns)
    const history = messages
      .filter((m) => !m.streaming)
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      await askCivic(
        question,
        abort.signal,
        {
          onSources: (sources) => {
            setMessages((m) =>
              m.map((msg) => (msg.id === aiMsgId ? { ...msg, sources } : msg))
            );
          },
          onToken: (token) => {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === aiMsgId ? { ...msg, text: msg.text + token } : msg
              )
            );
          },
          onDone: () => {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === aiMsgId ? { ...msg, streaming: false } : msg
              )
            );
            setPending(false);
          },
          onError: () => {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === aiMsgId
                  ? {
                      ...msg,
                      text:
                        msg.text ||
                        "Something went wrong. Please try again, or call the Voter Helpline at 1950.",
                      streaming: false,
                    }
                  : msg
              )
            );
            setPending(false);
          },
        },
        history
      );
    } catch {
      setPending(false);
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setPending(false);
  }

  function handleClear() {
    if (pending) handleStop();
    startNewSession();
    setMessages([]);
  }

  function handleLoadSession(sessionId) {
    const msgs = loadSession(sessionId);
    setMessages(msgs);
    setShowHistory(false);
  }

  const isEmpty = messages.length === 0;
  const pastSessions = sessions.filter((s) => s.messages?.length > 0);

  return (
    <div className="ask-page">
      <header className="ask-header">
        <div className="ask-header-inner">
          <Link to="/" className="ask-masthead">
            <span className="ask-masthead-dot" aria-hidden />
            <span className="text-caption">CIVIC — CHAT</span>
          </Link>
          <div className="ask-header-actions">
            <LanguageSwitcher />
            <AuthButton />
            {pastSessions.length > 0 && (
              <div className="ask-history-wrap">
                <button
                  className="ask-clear-btn"
                  onClick={() => setShowHistory((v) => !v)}
                >
                  History
                </button>
                {showHistory && (
                  <div className="ask-history-dropdown">
                    {pastSessions.slice(0, 5).map((s) => {
                      const first = s.messages.find((m) => m.role === "user");
                      return (
                        <button
                          key={s.id}
                          className="ask-history-item"
                          onClick={() => handleLoadSession(s.id)}
                        >
                          <span className="ask-history-preview">
                            {first?.text?.slice(0, 60) || "Conversation"}
                          </span>
                          <span className="ask-history-date">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {!isEmpty && (
              <button className="ask-clear-btn" onClick={handleClear}>
                New conversation
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="ask-stage">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="ask-empty"
            >
              <h1 className="text-display-2xl ask-title">
                Ask anything about{" "}
                <span className="text-display-italic ask-title-accent">Indian elections</span>
              </h1>
              <p className="text-body-lg ask-subtitle">
                Verified answers grounded in official documentation from the Election Commission of India.
              </p>
              <StarterQuestions onPick={handleAsk} />
            </motion.div>
          ) : (
            <motion.div
              key="stream"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="ask-conversation"
            >
              <ChatStream messages={messages} onOpenSource={setOpenSource} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="ask-composer-wrap">
        <Composer onSubmit={handleAsk} onStop={handleStop} disabled={pending} />
        <p className="ask-disclaimer text-caption">
          Civic cites official ECI documents. For urgent issues, call 1950.
        </p>
      </div>

      <AnimatePresence>
        {openSource && (
          <SourceDrawer source={openSource} onClose={() => setOpenSource(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
