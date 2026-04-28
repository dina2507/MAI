// src/services/askClient.js
// Streaming client for the askGeminiStream endpoint

const ENDPOINT =
  import.meta.env.VITE_ASK_ENDPOINT ||
  `https://asia-south1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net/askGeminiStream`;

/**
 * Stream a question to the backend and receive tokens as they arrive.
 * @param {string} question
 * @param {AbortSignal} signal
 * @param {{ onSources, onToken, onDone, onError }} handlers
 */
export async function askMai(question, signal, { onSources, onToken, onDone, onError }) {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal,
    });

    if (!res.ok || !res.body) {
      onError?.(new Error(`HTTP ${res.status}`));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || ""; // keep incomplete

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const payload = JSON.parse(line.slice(6));
          if (payload.type === "sources") onSources?.(payload.sources);
          else if (payload.type === "token") onToken?.(payload.text);
          else if (payload.type === "done") onDone?.();
          else if (payload.type === "error") onError?.(new Error(payload.message));
        } catch (e) {
          // malformed event, ignore
        }
      }
    }

    onDone?.();
  } catch (err) {
    if (err.name === "AbortError") return;
    onError?.(err);
  }
}
