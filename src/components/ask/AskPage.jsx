import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ChatStream from "./ChatStream";
import Composer from "./Composer";
import StarterQuestions from "./StarterQuestions";
import SourceDrawer from "./SourceDrawer";
import { askMai } from "../../services/askClient";
import { useAuth } from "../../contexts/AuthContext";
import { saveChatSession, loadLastChatSession } from "../../services/chatService";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import AuthButton from "../ui/AuthButton";
import "./ask.css";

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [openSource, setOpenSource] = useState(null);
  const abortRef = useRef(null);

  // Load history on mount or when user changes
  useEffect(() => {
    if (user) {
      loadLastChatSession(user.uid).then((history) => {
        if (history) setMessages(history);
      });
    } else {
      setMessages([]);
    }
  }, [user]);

  // Save history when messages change (after AI is done)
  const saveHistory = async (msgs) => {
    if (user && msgs.length > 0) {
      await saveChatSession(user.uid, msgs);
    }
  };

  async function handleAsk(question) {
    if (!question.trim() || pending) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      text: question,
    };
    const aiMsgId = crypto.randomUUID();
    const aiMsg = {
      id: aiMsgId,
      role: "assistant",
      text: "",
      sources: [],
      streaming: true,
    };

    const newMessages = [...messages, userMsg, aiMsg];
    setMessages(newMessages);
    setPending(true);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      await askMai(question, abort.signal, {
        onSources: (sources) => {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aiMsgId ? { ...msg, sources } : msg
            )
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
          setMessages((m) => {
            const updated = m.map((msg) =>
              msg.id === aiMsgId ? { ...msg, streaming: false } : msg
            );
            saveHistory(updated);
            return updated;
          });
          setPending(false);
        },
        onError: () => {
          setMessages((m) => {
            const updated = m.map((msg) =>
              msg.id === aiMsgId
                ? {
                    ...msg,
                    text:
                      msg.text ||
                      "Something went wrong. Please try again, or call the Voter Helpline at 1950.",
                    streaming: false,
                  }
                : msg
            );
            saveHistory(updated);
            return updated;
          });
          setPending(false);
        },
      });
    } catch (err) {
      setPending(false);
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setPending(false);
  }

  function handleClear() {
    if (pending) handleStop();
    setMessages([]);
    if (user) {
      saveChatSession(user.uid, []);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="ask-page">
      {/* Editorial header */}
      <header className="ask-header">
        <div className="ask-header-inner">
          <Link to="/" className="ask-masthead">
            <span className="ask-masthead-dot" aria-hidden />
            <span className="text-caption">Civic — Chat</span>
          </Link>
          <div className="ask-header-actions">
            <LanguageSwitcher />
            <AuthButton />
            {!isEmpty && (
              <button className="ask-clear-btn" onClick={handleClear}>
                New conversation
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main stage */}
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
                Chat about the election process in{" "}
                <span className="text-display-italic ask-title-accent">India</span>
              </h1>
              <p className="text-body-lg ask-subtitle">
                Every answer is grounded in official documents from the Election Commission of India.
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Composer */}
      <div className="ask-composer-wrap">
        <Composer
          onSubmit={handleAsk}
          onStop={handleStop}
          disabled={pending}
        />
        <p className="ask-disclaimer text-caption">
          Civic cites official ECI documents. For urgent issues, call 1950.
        </p>
      </div>

      {/* Source drawer */}
      <AnimatePresence>
        {openSource && (
          <SourceDrawer
            source={openSource}
            onClose={() => setOpenSource(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

