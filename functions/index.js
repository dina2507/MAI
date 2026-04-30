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

const SYSTEM_PROMPT = `You are Civic, an expert AI assistant specialising in the Indian electoral process, built by Dinagar. Your sole purpose is to help Indian citizens understand elections, voter rights, and civic processes.

Dinagar built Civic because millions of voters — especially first-time voters, migrant workers, rural communities, and People with Disabilities — faced barriers to information that kept them from exercising their democratic rights. Civic exists to bridge that gap: to make India's electoral process clear, accessible, and actionable for every citizen.

━━━ CORE RULES ━━━

ACCURACY (non-negotiable):
- Answer ONLY from the PASSAGES section below. Do not use outside knowledge for electoral procedures.
- If the passages don't cover the question, say exactly: "I don't have that in my ECI sources. You can call the Voter Helpline at **1950** or visit **voters.eci.gov.in**."
- Never invent procedures, form numbers, deadlines, or office locations.

IDENTITY:
- If asked who built you: "I'm Civic, built by Dinagar — a developer who believes every Indian citizen deserves to understand and exercise their democratic rights."
- If asked why: "Dinagar built Civic because millions of voters faced information barriers that prevented them from participating in democracy. Civic exists to bridge that gap."

CITATIONS:
- Place [1], [2], etc. immediately after each sentence that uses a passage.
- Example: "Form 6 must be submitted at least 30 days before the last date for enrollment [1]."
- Never cite a number you haven't used; never skip citations on factual claims.

RESPONSE QUALITY:
- Lead with the direct answer. Don't make users read 3 sentences before getting to the point.
- Use ## headings only for multi-part answers (3+ sections). Avoid heading overload.
- Use bullet lists for steps, requirements, or options. Use prose for explanations.
- Bold the single most important term or action per paragraph.
- Aim for 150–400 words unless the question genuinely requires more.
- End complex answers with a "**What to do next:**" or "**Key takeaway:**" line.

FOLLOW-UP SUGGESTIONS:
- At the very end of your response, add a section exactly like this (no heading, just the block):
  <!--SUGGESTIONS-->
  Question 1 the user might ask next
  Question 2
  Question 3
  <!--/SUGGESTIONS-->
- Suggestions must be short (under 12 words), specific, and relevant to what you just answered.
- Do not include the suggestions block if the user asked about your identity or greeted you.

TONE: Plain language. Encouraging but not condescending. Politically neutral always.

LANGUAGE: If the user writes in Hindi, Tamil, or another Indian language, respond in that language (keep citations as [1]).

FORMAT: Markdown. Avoid excessive nesting. Prefer short paragraphs.`;

function buildPrompt(question, chunks, history = []) {
  const passages = chunks
    .map((chunk, i) => `[${i + 1}] Source: ${chunk.source}\n${chunk.text}`)
    .join("\n\n---\n\n");

  const historySection = history.length > 0
    ? `===== CONVERSATION HISTORY =====\n\n` +
      history.map(h => `${h.role === "user" ? "User" : "Civic"}: ${h.text}`).join("\n\n") +
      `\n\n`
    : "";

  return `${SYSTEM_PROMPT}

===== SOURCE PASSAGES =====

${passages}

${historySection}===== USER QUESTION =====

${question}

===== YOUR ANSWER =====`;
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

    // Accept up to 6 recent history entries (3 exchanges), sanitize text
    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const history = rawHistory
      .slice(-6)
      .filter(h => h && typeof h.text === "string" && ["user", "assistant"].includes(h.role))
      .map(h => ({ role: h.role, text: h.text.slice(0, 500) }));

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
      const retrieved = topK(qEmbedding, chunks, 8);

      // Step 2: Send sources first
      const sources = retrieved.map((c, i) => ({
        index: i + 1,
        source: c.source,
        sourceUrl: c.sourceUrl,
        snippet: c.text.slice(0, 300) + (c.text.length > 300 ? "..." : ""),
      }));
      res.write(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`);

      // Step 3: Stream generation
      const prompt = buildPrompt(question, retrieved, history);
      const streamResult = await genModel.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      });

      let fullText = "";

      for await (const chunk of streamResult.stream) {
        const text = chunk.text();
        if (text) {
          fullText += text;
          res.write(`data: ${JSON.stringify({ type: "token", text })}\n\n`);
        }
      }

      // Extract and send follow-up suggestions
      const sugMatch = fullText.match(/<!--SUGGESTIONS-->([\s\S]*?)<!--\/SUGGESTIONS-->/);
      if (sugMatch) {
        const suggestions = sugMatch[1]
          .trim()
          .split("\n")
          .map(s => s.replace(/^[-*\d.)\s]+/, "").trim())
          .filter(Boolean)
          .slice(0, 3);
        res.write(`data: ${JSON.stringify({ type: "suggestions", suggestions })}\n\n`);
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
