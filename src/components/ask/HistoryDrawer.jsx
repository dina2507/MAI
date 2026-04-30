import { motion } from "framer-motion";
import { X, Clock, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { listUserChats } from "../../services/chatService";

export default function HistoryDrawer({ userId, currentChatId, onSelect, onClose }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      listUserChats(userId).then((data) => {
        setChats(data);
        setLoading(false);
      });
    }
  }, [userId]);

  return (
    <motion.div
      className="history-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="history-drawer"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="history-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Clock size={20} className="text-saffron-500" />
            <h3 className="text-display-lg">Chat History</h3>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="history-list">
          {loading ? (
            <div className="history-empty">Loading history...</div>
          ) : chats.length === 0 ? (
            <div className="history-empty">No past conversations yet.</div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                className={`history-card ${currentChatId === chat.id ? "active" : ""}`}
                onClick={() => {
                  onSelect(chat);
                  onClose();
                }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                   <MessageSquare size={16} style={{ marginTop: "3px", opacity: 0.5, flexShrink: 0 }} />
                   <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                     <span className="history-card-title">{chat.title || "Untitled Chat"}</span>
                     <span className="history-card-date">
                       {chat.updatedAt?.toDate().toLocaleDateString(undefined, { 
                         month: 'short', 
                         day: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                     </span>
                   </div>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}
