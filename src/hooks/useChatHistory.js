import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "civic_chat_sessions";
const MAX_SESSIONS = 20;

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function generateTitle(messages) {
  const first = messages.find((m) => m.role === "user");
  if (!first?.text) return "New conversation";
  const text = first.text.trim();
  return text.length > 48 ? text.slice(0, 48) + "…" : text;
}

export function useChatHistory() {
  const [sessions, setSessions] = useState(loadFromStorage);
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const s = loadFromStorage();
    return s.length > 0 ? s[0].id : crypto.randomUUID();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const activeMessages = sessions.find((s) => s.id === activeSessionId)?.messages ?? [];

  const persistMessages = useCallback(
    (messages) => {
      if (!messages.length) return;
      const title = generateTitle(messages);
      setSessions((prev) => {
        const idx = prev.findIndex((s) => s.id === activeSessionId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], title, messages };
          return updated;
        }
        const newSession = { id: activeSessionId, title, createdAt: Date.now(), messages };
        return [newSession, ...prev].slice(0, MAX_SESSIONS);
      });
    },
    [activeSessionId]
  );

  const startNewSession = useCallback(() => {
    const newId = crypto.randomUUID();
    setActiveSessionId(newId);
    return newId;
  }, []);

  const loadSession = useCallback(
    (sessionId) => {
      setActiveSessionId(sessionId);
      return sessions.find((s) => s.id === sessionId)?.messages ?? [];
    },
    [sessions]
  );

  return { sessions, activeMessages, persistMessages, startNewSession, loadSession, activeSessionId };
}
