import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const QUESTIONS = [
  {
    heading: "Register to vote",
    prompt: "How do I register as a first-time voter in India? What is Form 6?",
  },
  {
    heading: "Name not on voter list",
    prompt: "My name is missing from the electoral roll. What steps should I take?",
  },
  {
    heading: "Voter ID for election day",
    prompt: "What documents can I use at the polling booth if I don't have a Voter ID card?",
  },
  {
    heading: "EVM and VVPAT explained",
    prompt: "How does the Electronic Voting Machine work? What is VVPAT and how does it verify my vote?",
  },
  {
    heading: "Moving to a new city",
    prompt: "I moved to a different city. How do I transfer my voter registration using Form 8A?",
  },
  {
    heading: "Migrant worker rights",
    prompt: "I'm a migrant worker living away from my home state. Can I still vote? What are my options?",
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
          transition={{ delay: 0.12 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -2 }}
        >
          <div className="starter-heading text-caption">{q.heading}</div>
          <div className="starter-prompt">{q.prompt}</div>
          <ArrowUpRight size={15} className="starter-arrow" />
        </motion.button>
      ))}
    </div>
  );
}

StarterQuestions.propTypes = {
  onPick: PropTypes.func.isRequired,
};
