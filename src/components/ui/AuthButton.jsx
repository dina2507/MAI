import { useAuth } from "../../contexts/AuthContext";
import { LogIn, LogOut } from "lucide-react";
import "./ui.css"; // Assuming ui.css exists and we can add some minimal styles there or use inline if not

export default function AuthButton() {
  const { user, loginWithGoogle, logout } = useAuth();

  if (user) {
    return (
      <button 
        onClick={logout} 
        className="auth-btn" 
        title="Sign Out"
        style={{ display: "flex", alignItems: "center", gap: "8px", background: "transparent", border: "1px solid var(--ink-600)", padding: "4px 12px", borderRadius: "8px", color: "var(--paper-100)", cursor: "pointer", fontSize: "0.875rem", fontFamily: "var(--font-body)" }}
      >
        <img 
          src={user.photoURL} 
          alt="Profile" 
          style={{ width: "24px", height: "24px", borderRadius: "50%" }} 
        />
        <span>{user.displayName?.split(" ")[0] || "User"}</span>
        <LogOut size={16} />
      </button>
    );
  }

  return (
    <button 
      onClick={loginWithGoogle} 
      className="auth-btn"
      style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--ink-800)", border: "1px solid var(--saffron-500)", padding: "6px 16px", borderRadius: "8px", color: "var(--saffron-500)", cursor: "pointer", fontSize: "0.875rem", fontFamily: "var(--font-body)", fontWeight: "500", transition: "all 0.2s ease" }}
    >
      <LogIn size={16} />
      <span>Sign In</span>
    </button>
  );
}
