export default function ProgressDots({ history, current, accent }) {
  const filled = history.length;
  const total = filled + 1; // visible position

  return (
    <div className="progress-dots" aria-label={`Step ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`dot ${i < filled ? "filled" : i === filled ? "current" : ""}`}
          style={i === filled ? { background: accent } : {}}
        />
      ))}
    </div>
  );
}
