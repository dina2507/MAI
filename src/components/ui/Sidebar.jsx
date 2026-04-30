import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Navigation, BookOpen, MapPin,
  PanelLeftClose, PanelLeftOpen, Plus, LogIn, LogOut,
  ChevronDown, Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/chat",  icon: MessageCircle, label: "Chat",       accent: "#F97316" },
  { to: "/guide", icon: Navigation,    label: "Guide",      accent: "#3B6FEB" },
  { to: "/learn", icon: BookOpen,      label: "Learn",      accent: "#15803D" },
  { to: "/map",   icon: MapPin,        label: "Find Booth", accent: "#8B5CF6" },
];

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const diff = Date.now() - d;
  if (diff < 86_400_000) return "Today";
  if (diff < 172_800_000) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, loginWithGoogle, logout } = useAuth();
  const { sessions, activeSessionId, startNewChat, loadSession } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [historyOpen, setHistoryOpen] = useState(true);

  function handleNewChat() {
    startNewChat();
    navigate("/chat");
    onMobileClose?.();
  }

  function handleSession(id) {
    loadSession(id);
    navigate("/chat");
    onMobileClose?.();
  }

  const pastSessions = sessions.filter((s) => s.messages?.length > 0);
  const isOnChat = location.pathname === "/chat";

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={[
          "sidebar",
          collapsed ? "sidebar--collapsed" : "",
          mobileOpen ? "sidebar--open" : "",
        ].join(" ")}
      >
        {/* Brand + toggle */}
        <div className="sidebar-header">
          {!collapsed && (
            <Link to="/" className="sidebar-brand" onClick={onMobileClose}>
              <span className="sidebar-brand-dot" />
              <span className="sidebar-brand-name">Civic</span>
            </Link>
          )}
          <button
            className="sidebar-toggle"
            onClick={onToggle}
            title={collapsed ? "Expand" : "Collapse"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        {/* New chat */}
        <div className="sidebar-new-chat-wrap">
          <button
            className={`sidebar-new-chat ${collapsed ? "sidebar-new-chat--icon" : ""}`}
            onClick={handleNewChat}
            title="New conversation"
          >
            <Plus size={15} strokeWidth={2.5} />
            {!collapsed && <span>New conversation</span>}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Modes">
          {NAV_ITEMS.map(({ to, icon: Icon, label, accent }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? "sidebar-nav-item--active" : ""}`
              }
              style={{ "--nav-accent": accent }}
              title={collapsed ? label : undefined}
              onClick={onMobileClose}
            >
              <span className="sidebar-nav-icon"><Icon size={17} /></span>
              {!collapsed && <span className="sidebar-nav-label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-sep" />

        {/* History */}
        {!collapsed && pastSessions.length > 0 && (
          <div className="sidebar-history">
            <button
              className="sidebar-history-toggle"
              onClick={() => setHistoryOpen((v) => !v)}
            >
              <Clock size={12} />
              <span>Recent chats</span>
              <ChevronDown
                size={12}
                className={`sidebar-chevron ${historyOpen ? "sidebar-chevron--open" : ""}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {historyOpen && (
                <motion.ul
                  className="sidebar-history-list"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  {pastSessions.slice(0, 15).map((s) => (
                    <li key={s.id}>
                      <button
                        className={`sidebar-history-item ${s.id === activeSessionId && isOnChat ? "sidebar-history-item--active" : ""}`}
                        onClick={() => handleSession(s.id)}
                        title={s.title}
                      >
                        <span className="sidebar-history-title">{s.title || "Conversation"}</span>
                        <span className="sidebar-history-date">{formatDate(s.createdAt)}</span>
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="sidebar-spacer" />

        {/* Profile footer */}
        <div className="sidebar-footer">
          {user ? (
            <div className={`sidebar-profile ${collapsed ? "sidebar-profile--icon" : ""}`}>
              <img src={user.photoURL} alt="" className="sidebar-avatar" />
              {!collapsed && (
                <>
                  <div className="sidebar-profile-info">
                    <span className="sidebar-profile-name">{user.displayName?.split(" ")[0]}</span>
                    <span className="sidebar-profile-email">{user.email}</span>
                  </div>
                  <button className="sidebar-logout" onClick={logout} title="Sign out">
                    <LogOut size={14} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              className={`sidebar-signin ${collapsed ? "sidebar-signin--icon" : ""}`}
              onClick={loginWithGoogle}
              title="Sign in with Google"
            >
              <LogIn size={16} />
              {!collapsed && <span>Sign in</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
