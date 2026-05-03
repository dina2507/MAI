import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Check, ArrowRight, X, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { markComplete } from "../../../hooks/useJourneyProgress";
import { logCivicEvent } from "../../../services/analytics";

export default function CompletionStep({ step, journey, onComplete }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Mark journey as completed + fire confetti
  useEffect(() => {
    if (journey?.id) {
      markComplete(journey.id);
      logCivicEvent("journey_completed", { journey_id: journey.id, journey_title: journey.title });
    }
    const canvas = canvasRef.current;
    if (canvas) fireConfetti(canvas);
  }, [journey?.id, journey?.title]);

  function handleAction(action) {
    if (action.type === "journey") {
      navigate(`/guide/${action.target}`);
    } else if (action.type === "link") {
      if (action.target?.startsWith("tel:")) {
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = action.target;
      } else {
        window.open(action.target, "_blank", "noopener");
      }
    } else if (action.type === "close") {
      navigate("/guide");
    }
    onComplete?.();
  }

  function handleShare() {
    const url = `${window.location.origin}/guide/${journey?.id}`;
    const text = `I just completed "${journey?.title}" on Civic — the Indian election assistant! Check it out:`;
    if (navigator.share) {
      navigator.share({ title: "Civic Journey", text, url }).catch(() => {});
    } else {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
      window.open(waUrl, "_blank", "noopener");
    }
  }

  return (
    <motion.div
      className="step step-completion"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="confetti-canvas"
        aria-hidden="true"
      />

      <motion.div
        className="completion-mark"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -8, 0] }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Check size={42} strokeWidth={2.5} />
      </motion.div>
      <h1 className="text-display-2xl step-title">{step.title}</h1>
      {step.summary && (
        <div className="step-body text-body-lg">
          <ReactMarkdown>{step.summary}</ReactMarkdown>
        </div>
      )}
      {step.nextActions?.length > 0 && (
        <div className="completion-actions">
          {step.nextActions.map((action, i) => (
            <motion.button
              key={i}
              className={`completion-btn ${i === 0 ? "primary" : "secondary"}`}
              onClick={() => handleAction(action)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              whileTap={{ scale: 0.98 }}
            >
              {action.label}
              {action.type === "close" ? <X size={16} /> : <ArrowRight size={16} />}
            </motion.button>
          ))}
          <motion.button
            className="completion-btn secondary"
            onClick={handleShare}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share2 size={16} />
            Share this journey
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

CompletionStep.propTypes = {
  step: PropTypes.shape({
    title: PropTypes.string.isRequired,
    summary: PropTypes.string,
    nextActions: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      target: PropTypes.string,
    })),
  }).isRequired,
  journey: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  onComplete: PropTypes.func,
};

/**
 * Lightweight confetti using canvas — no library needed.
 * Fires ~60 particles in journey accent color.
 */
function fireConfetti(canvas) {
  const ctx = canvas.getContext("2d");
  const W = canvas.width = canvas.parentElement?.offsetWidth || 640;
  const H = canvas.height = canvas.parentElement?.offsetHeight || 400;

  const colors = ["#FF6B35", "#F59E0B", "#34D399", "#3B6FEB", "#7C3AED", "#F97316"];
  const particles = Array.from({ length: 60 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 100,
    y: H / 2,
    vx: (Math.random() - 0.5) * 14,
    vy: Math.random() * -12 - 4,
    size: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 12,
    life: 1,
  }));

  let frame;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    let alive = false;

    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.rotation += p.rotSpeed;
      p.life -= 0.012;
      p.vx *= 0.99;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }

    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  animate();
  // Auto-cleanup after 3s
  setTimeout(() => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, W, H);
  }, 3000);
}
