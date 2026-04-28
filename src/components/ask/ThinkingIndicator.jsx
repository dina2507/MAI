import { motion } from "framer-motion";

export default function ThinkingIndicator({ large = false }) {
  return (
    <div className={`thinking ${large ? "thinking-large" : ""}`} aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="thinking-dot"
          animate={{
            y: [0, -4, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}
