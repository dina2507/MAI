export default function Citation({ number, source, onOpen }) {
  if (!source) return <sup className="cite cite-empty">[{number}]</sup>;

  return (
    <button
      className="cite"
      onClick={() => onOpen(source)}
      title={source.source}
    >
      <sup>[{number}]</sup>
    </button>
  );
}
