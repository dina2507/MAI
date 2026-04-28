// functions/index.js
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

admin.initializeApp();
const db = admin.firestore();

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// ============================================================
// IN-MEMORY EMBEDDING CACHE
// ============================================================
// Load all chunk embeddings into memory on cold start.
let chunkCache = null;

async function loadChunks() {
  if (chunkCache) return chunkCache;

  logger.info("Loading chunks into memory...");
  const snap = await db.collection("eci_chunks").get();
  chunkCache = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  logger.info(`Loaded ${chunkCache.length} chunks`);
  return chunkCache;
}

// ============================================================
// COSINE SIMILARITY
// ============================================================

function cosineSim(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function topK(queryEmbedding, chunks, k = 5) {
  return chunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSim(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

// ============================================================
// SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `You are MAI, an assistant that helps Indian citizens understand the election process. You answer questions using ONLY the provided passages from official Election Commission of India documents.

RULES:
1. Use ONLY information from the passages below. Never use outside knowledge.
2. If the answer isn't in the passages, say: "I don't have information on that in my ECI sources. You can reach the Voter Helpline at 1950."
3. Always cite passages inline as [1], [2], [3] etc., matching the passage numbers.
4. Be concise. Use plain language. Prefer short paragraphs and bullet lists for steps.
5. Never mention specific political parties or candidates. Stay strictly neutral.
6. Never speculate about future elections or make predictions.
7. If a user asks in Hindi/Tamil/another Indian language, respond in that language but keep citations as [1], [2].
8. Format your response in markdown.

When citing, use this format: "Form 6 is used for new voter registration [1]."
`;

function buildPrompt(question, chunks) {
  const passages = chunks
    .map(
      (chunk, i) =>
        `[${i + 1}] Source: ${chunk.source}\n${chunk.text}`
    )
    .join("\n\n---\n\n");

  return `${SYSTEM_PROMPT}

===== PASSAGES =====

${passages}

===== USER QUESTION =====

${question}

===== YOUR ANSWER (markdown, with [1][2] citations) =====`;
}

// ============================================================
// ASK FUNCTION — Callable
// ============================================================

export const askGemini = onCall(
  {
    region: "asia-south1",
    secrets: [GEMINI_API_KEY],
    cors: true,
    maxInstances: 10,
  },
  async (request) => {
    const { question } = request.data;

    if (!question || typeof question !== "string" || question.length > 500) {
      throw new HttpsError(
        "invalid-argument",
        "Question must be a string under 500 characters."
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    // Fix: Using gemini-embedding-2 with 768 output dimensions as verified in Phase 2
    const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const genModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    try {
      // Step 1: Embed the question
      const embedResult = await embedModel.embedContent({
        content: { role: "user", parts: [{ text: question }] },
        outputDimensionality: 768
      });
      const qEmbedding = embedResult.embedding.values;

      // Step 2: Load chunks (cached)
      const chunks = await loadChunks();

      // Step 3: Retrieve top 5
      const retrieved = topK(qEmbedding, chunks, 5);

      // Step 4: Build grounded prompt
      const prompt = buildPrompt(question, retrieved);

      // Step 5: Generate answer
      const result = await genModel.generateContent(prompt);
      const answer = result.response.text();

      // Step 6: Return answer + source metadata
      return {
        answer,
        sources: retrieved.map((c, i) => ({
          index: i + 1,
          source: c.source,
          sourceUrl: c.sourceUrl,
          snippet: c.text.slice(0, 300) + (c.text.length > 300 ? "..." : ""),
          score: c.score,
        })),
      };
    } catch (err) {
      logger.error("askGemini error:", err);
      throw new HttpsError("internal", "Failed to generate answer.");
    }
  }
);

// ============================================================
// ASK FUNCTION — Streaming HTTPS
// ============================================================

export const askGeminiStream = onRequest(
  {
    region: "asia-south1",
    secrets: [GEMINI_API_KEY],
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    // Basic CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    const { question } = req.body;
    if (!question || typeof question !== "string" || question.length > 500) {
      res.status(400).json({ error: "Invalid question" });
      return;
    }

    res.set("Content-Type", "text/event-stream");
    res.set("Cache-Control", "no-cache");
    res.set("Connection", "keep-alive");

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    // Fix: Using gemini-embedding-2 with 768 output dimensions
    const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
    const genModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    try {
      // Step 1: Retrieve context
      const embedResult = await embedModel.embedContent({
        content: { role: "user", parts: [{ text: question }] },
        outputDimensionality: 768
      });
      const qEmbedding = embedResult.embedding.values;
      const chunks = await loadChunks();
      const retrieved = topK(qEmbedding, chunks, 5);

      // Step 2: Send sources first
      const sources = retrieved.map((c, i) => ({
        index: i + 1,
        source: c.source,
        sourceUrl: c.sourceUrl,
        snippet: c.text.slice(0, 300) + (c.text.length > 300 ? "..." : ""),
      }));
      res.write(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`);

      // Step 3: Stream generation
      const prompt = buildPrompt(question, retrieved);
      const streamResult = await genModel.generateContentStream(prompt);

      for await (const chunk of streamResult.stream) {
        const text = chunk.text();
        if (text) {
          res.write(`data: ${JSON.stringify({ type: "token", text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (err) {
      logger.error("askGeminiStream error:", err);
      res.write(`data: ${JSON.stringify({ type: "error", message: "Failed to generate answer." })}\n\n`);
      res.end();
    }
  }
);
