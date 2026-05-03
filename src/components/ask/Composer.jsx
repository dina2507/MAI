import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square, Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Composer({ onSubmit, onStop, disabled }) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  // Voice setup (Web Speech API)
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setValue(transcript);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  function handleMic() {
    if (!recognitionRef.current) {
      alert("Voice input not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      setValue("");
      recognitionRef.current.start();
      setListening(true);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (disabled) {
      onStop();
      return;
    }
    if (!value.trim()) return;
    onSubmit(value);
    setValue("");
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <div className="composer-inner">
        <textarea
          ref={textareaRef}
          className="composer-input"
          placeholder="Ask about voter registration, deadlines, forms, your constituency..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          maxLength={500}
        />

        <div className="composer-actions">
          <motion.button
            type="button"
            onClick={handleMic}
            className={`composer-mic ${listening ? "listening" : ""}`}
            whileTap={{ scale: 0.92 }}
            aria-label={listening ? "Stop recording" : "Start voice input"}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </motion.button>

          <motion.button
            type="submit"
            className={`composer-send ${disabled ? "stopping" : ""}`}
            disabled={!disabled && !value.trim()}
            whileTap={{ scale: 0.92 }}
            aria-label={disabled ? "Stop" : "Send"}
          >
            {disabled ? <Square size={16} fill="currentColor" /> : <ArrowUp size={18} />}
          </motion.button>
        </div>
      </div>
    </form>
  );
}

Composer.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
