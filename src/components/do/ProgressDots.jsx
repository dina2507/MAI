export default function ProgressDots({ history, current, accent, stepIndex, totalSteps }) {
  const filled = history.length;
  const total = filled + 1; // visible position

  return (
    <div className="progress-dots-wrapper" aria-label={`Step ${total}`}>
      <div className="progress-dots">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`dot ${i < filled ? "filled" : i === filled ? "current" : ""}`}
            style={i === filled ? { background: accent } : {}}
          />
        ))}
      </div>
      {typeof stepIndex === "number" && totalSteps > 0 && (
        <div className="progress-counter text-caption">
          {stepIndex + 1} / {totalSteps}
        </div>
      )}
    </div>
  );
}
