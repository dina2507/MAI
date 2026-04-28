import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const QUESTIONS = [
  {
    heading: "First-time voter",
    prompt: "How do I register as a first-time voter in India?",
  },
  {
    heading: "Missing name",
    prompt: "My name isn't on the voter list. What should I do?",
  },
  {
    heading: "Moving house",
    prompt: "I moved to a new city. How do I transfer my voter registration?",
  },
  {
    heading: "Valid documents",
    prompt: "What ID documents are accepted at the polling booth?",
  },
];

export default function StarterQuestions({ onPick }) {
  return (
    <div className="starters">
      {QUESTIONS.map((q, i) => (
        <motion.button
          key={q.heading}
          className="starter"
          onClick={() => onPick(q.prompt)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.15 + i * 0.06,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          whileHover={{ y: -2 }}
        >
          <div className="starter-heading text-caption">{q.heading}</div>
          <div className="starter-prompt">{q.prompt}</div>
          <ArrowUpRight size={16} className="starter-arrow" />
        </motion.button>
      ))}
    </div>
  );
}
