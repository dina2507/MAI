// functions/index.js
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { logger } from "firebase-functions";
import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "./rateLimit.js";

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
// INPUT SAFETY
// ============================================================

function sanitizeQuestion(q) {
  return q
    .slice(0, 500)
    .replace(/<[^>]*>/g, "")        // no HTML
    .replace(/[<>{}[\]]/g, "")       // no bracket injection
    .trim();
}

// ============================================================
// SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `You are Civic, a professional and authoritative AI assistant for the Indian electoral process. Your mission is to provide accurate, grounded, and easy-to-understand information to citizens.

RULES:
1. GROUNDING: Use ONLY information from the passages below. If the answer isn't there, say: "I don't have information on that in my official ECI sources. You can reach the Voter Helpline at 1950."
2. IDENTITY: You were built by Dinagar, a civic technology developer.
3. STRUCTURE: 
   - Use bold text for key terms.
   - Use bullet points for steps or lists.
   - For long answers, start with a "Quick Summary" or "Key Takeaway" section.
4. TONE: Professional, encouraging, and neutral. No political bias.
5. CITATIONS: Cite sources as [1], [2] immediately after the relevant sentence.
6. LANGUAGES: Respond in the user's language (Hindi, Tamil, etc.) if they ask in it, but keep citations in [X] format.
7. NEUTRALITY: Never discuss specific candidates or parties.

Format your response in clean Markdown.`;

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
    memory: "1GiB",
  },
  async (request) => {
    const rawQuestion = request.data?.question;

    if (!rawQuestion || typeof rawQuestion !== "string") {
      throw new HttpsError(
        "invalid-argument",
        "Question must be a string."
      );
    }
    
    const question = sanitizeQuestion(rawQuestion);
    if (!question) {
       throw new HttpsError("invalid-argument", "Question cannot be empty after sanitization.");
    }
    
    // Rate limit
    const fingerprint = request.auth?.uid || request.rawRequest?.ip || "anonymous";
    const check = await checkRateLimit(fingerprint);
    if (!check.ok) {
       throw new HttpsError("resource-exhausted", `Too many requests (${check.reason})`);
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
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
      logger.error("askGemini failure", {
        question: question.slice(0, 100),
        errorMessage: err.message,
        stack: err.stack,
      });
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
    memory: "1GiB",
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

    const rawQuestion = req.body?.question;
    if (!rawQuestion || typeof rawQuestion !== "string") {
      res.status(400).json({ error: "Invalid question" });
      return;
    }
    
    const question = sanitizeQuestion(rawQuestion);
    if (!question) {
       res.status(400).json({ error: "Empty question after sanitization" });
       return;
    }

    // Rate limit
    const fingerprint = req.ip || "anonymous";
    const check = await checkRateLimit(fingerprint);
    if (!check.ok) {
      res.status(429).json({ error: `Too many requests (${check.reason})` });
      return;
    }

    res.set("Content-Type", "text/event-stream");
    res.set("Cache-Control", "no-cache");
    res.set("Connection", "keep-alive");

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
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
      logger.error("askGeminiStream failure", {
        question: question.slice(0, 100),
        errorMessage: err.message,
        stack: err.stack,
      });
      res.write(`data: ${JSON.stringify({ type: "error", message: "Failed to generate answer." })}\n\n`);
      res.end();
    }
  }
);
