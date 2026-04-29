import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <motion.div
        className="not-found-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="not-found-code">404</div>
        <h1 className="text-display-xl not-found-title">Page not found</h1>
        <p className="text-body-lg not-found-body">
          This page doesn't exist. You might have followed a broken link, or it may have been removed.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn primary">
            <Home size={16} />
            Go home
          </Link>
          <button className="not-found-btn secondary" onClick={() => window.history.back()}>
            <ArrowLeft size={16} />
            Go back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
