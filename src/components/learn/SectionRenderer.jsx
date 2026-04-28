import { motion, AnimatePresence } from "framer-motion";
import { ProseSection, CalloutSection, TimelineSection } from "./sections/ContentSections";
import { QuizSection } from "./sections/QuizSection";
import { EVMSimulator } from "./sections/EVMSimulator";

const SECTION_COMPONENTS = {
  prose: ProseSection,
  callout: CalloutSection,
  timeline: TimelineSection,
  quiz: QuizSection,
  evm: () => <EVMSimulator />,
};

export default function SectionRenderer({ section }) {
  const Component = SECTION_COMPONENTS[section.type];
  if (!Component) return null;
  return (
    <motion.div
      className="learn-section-wrap"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Component section={section} />
    </motion.div>
  );
}
