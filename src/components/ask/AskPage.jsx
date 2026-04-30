import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatStream from "./ChatStream";
import Composer from "./Composer";
import StarterQuestions from "./StarterQuestions";
import SourceDrawer from "./SourceDrawer";
import { askCivic } from "../../services/askClient";
import { useChat } from "../../contexts/ChatContext";
import "./ask.css";

export default function AskPage() {
  const { messages, setMessages, persistMessages } = useChat();
  const [pending, setPending] = useState(false);
  const [openSource, setOpenSource] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!pending && messages.length > 0) {
      persistMessages(messages);
    }
  }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAsk(question) {
    if (!question.trim() || pending) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", text: question };
    const aiMsgId = crypto.randomUUID();
    const aiMsg = { id: aiMsgId, role: "assistant", text: "", sources: [], suggestions: [], streaming: true };

    setMessages((m) => [...m, userMsg, aiMsg]);
    setPending(true);

    const abort = new AbortController();
    abortRef.current = abort;

    const history = messages
      .filter((m) => !m.streaming)
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      await askCivic(
        question,
        abort.signal,
        {
          onSources: (sources) =>
            setMessages((m) =>
              m.map((msg) => (msg.id === aiMsgId ? { ...msg, sources } : msg))
            ),
          onToken: (token) =>
            setMessages((m) =>
              m.map((msg) =>
                msg.id === aiMsgId ? { ...msg, text: msg.text + token } : msg
              )
            ),
          onSuggestions: (suggestions) =>
            setMessages((m) =>
              m.map((msg) => (msg.id === aiMsgId ? { ...msg, suggestions } : msg))
            ),
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
                        "Something went wrong. Please try again, or call the Voter Helpline at **1950**.",
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

  const isEmpty = messages.length === 0;

  return (
    <div className="ask-page">
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
                Every answer is grounded in official ECI documents — sources cited inline, never hallucinated.
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
              <ChatStream
                messages={messages}
                onOpenSource={setOpenSource}
                onAsk={handleAsk}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="ask-composer-wrap">
        <Composer onSubmit={handleAsk} onStop={handleStop} disabled={pending} />
        <p className="ask-disclaimer text-caption">
          Civic cites official ECI documents only. Urgent? Call{" "}
          <a href="tel:1950" className="ask-helpline-link">Voter Helpline 1950</a>.
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
