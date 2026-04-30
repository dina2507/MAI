import { useAuth } from "../../contexts/AuthContext";
import { LogIn, LogOut } from "lucide-react";
import "./AuthButton.css";

export default function AuthButton() {
  const { user, loginWithGoogle, logout } = useAuth();

  if (user) {
    return (
      <button 
        onClick={logout} 
        className="auth-btn auth-btn-signed-in" 
        title="Sign Out"
      >
        <img 
          src={user.photoURL} 
          alt="Profile" 
          className="auth-avatar"
        />
        <span className="auth-name">{user.displayName?.split(" ")[0] || "User"}</span>
        <LogOut size={16} />
      </button>
    );
  }

  return (
    <button 
      onClick={loginWithGoogle} 
      className="auth-btn auth-btn-sign-in"
    >
      <LogIn size={16} />
      <span>Sign In</span>
    </button>
  );
}
