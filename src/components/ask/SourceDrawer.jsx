import { motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

export default function SourceDrawer({ source, onClose }) {
  return (
    <motion.div
      className="drawer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-header">
          <div>
            <div className="text-caption drawer-label">
              Source [{source.index}]
            </div>
            <h3 className="text-display-lg drawer-title">{source.source}</h3>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="drawer-body">
          <p className="drawer-snippet">{source.snippet}</p>

          {source.sourceUrl && (
            <a
              href={source.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-link"
            >
              View original document <ExternalLink size={14} />
            </a>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}
