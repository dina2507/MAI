import { useEffect, useRef } from "react";
import Message from "./Message";

export default function ChatStream({ messages, onOpenSource, onAsk }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="chat-stream" role="log" aria-live="polite" aria-relevant="additions">
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} onOpenSource={onOpenSource} onAsk={onAsk} />
      ))}
      <div ref={endRef} style={{ height: "2rem" }} />
    </div>
  );
}
