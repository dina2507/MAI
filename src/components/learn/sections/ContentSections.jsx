import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, Info } from "lucide-react";

const CALLOUT_ICONS = {
  fact: Info,
  tip: Lightbulb,
  warning: AlertTriangle,
};

const CALLOUT_COLORS = {
  fact: "#3B6FEB",
  tip: "#F97316",
  warning: "#FBBF24",
};

export function ProseSection({ section }) {
  return (
    <div className="learn-prose">
      {section.title && <h3 className="learn-section-title">{section.title}</h3>}
      <div className="learn-body">
        <ReactMarkdown>{section.body}</ReactMarkdown>
      </div>
    </div>
  );
}

export function CalloutSection({ section }) {
  const Icon = CALLOUT_ICONS[section.calloutType] || Info;
  const color = CALLOUT_COLORS[section.calloutType] || "#3B6FEB";
  return (
    <div className="learn-callout" style={{ "--callout-color": color }}>
      <div className="learn-callout-icon">
        <Icon size={18} />
      </div>
      <div className="learn-callout-body">
        <ReactMarkdown>{section.body}</ReactMarkdown>
      </div>
    </div>
  );
}

export function TimelineSection({ section }) {
  return (
    <div className="learn-timeline">
      {section.title && <h3 className="learn-section-title">{section.title}</h3>}
      <div className="learn-timeline-items">
        {section.items.map((item, i) => (
          <motion.div
            key={i}
            className="learn-timeline-item"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
          >
            <div className="learn-timeline-marker" />
            <div className="learn-timeline-content">
              <div className="learn-timeline-label">{item.year}</div>
              <div className="learn-timeline-event">{item.event}</div>
              {item.detail && (
                <div className="learn-timeline-detail">{item.detail}</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
