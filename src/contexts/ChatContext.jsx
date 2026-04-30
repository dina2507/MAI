import { createContext, useContext, useState, useCallback } from "react";
import { useChatHistory } from "../hooks/useChatHistory";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const {
    sessions,
    activeMessages,
    persistMessages,
    startNewSession,
    loadSession: loadFromHistory,
    activeSessionId,
  } = useChatHistory();

  const [messages, setMessages] = useState(activeMessages);

  const startNewChat = useCallback(() => {
    startNewSession();
    setMessages([]);
  }, [startNewSession]);

  const loadSession = useCallback(
    (sessionId) => {
      const msgs = loadFromHistory(sessionId);
      setMessages(msgs);
    },
    [loadFromHistory]
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        sessions,
        activeSessionId,
        persistMessages,
        startNewChat,
        loadSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
