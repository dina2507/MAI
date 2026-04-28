# MAI | ASK Mode — Complete Build Guide

> **What you'll build:** A production-ready, RAG-grounded conversational assistant that answers Indian election questions using ONLY official ECI documents, with a stunning editorial chat interface that doesn't look AI-made.

> **Time estimate:** 1.5 – 2 full days
> **Difficulty:** Intermediate
> **Outcome:** Deployable, citable, beautiful

---

## Table of Contents

1. [Overview & What "Stunning" Means Here](#1-overview)
2. [Mental Model — Understand RAG Before You Build It](#2-mental-model)
3. [Final Architecture](#3-architecture)
4. [Prerequisites & Accounts](#4-prerequisites)
5. [Phase 1 — Firebase & Project Foundation](#5-phase-1)
6. [Phase 2 — The Ingestion Pipeline (Documents → Embeddings)](#6-phase-2)
7. [Phase 3 — The Retrieval + Generation Cloud Function](#7-phase-3)
8. [Phase 4 — The Design System (Editorial Civic Journal)](#8-phase-4)
9. [Phase 5 — The Chat UI Components](#9-phase-5)
10. [Phase 6 — Streaming Integration](#10-phase-6)
11. [Phase 7 — Citations, Sources & Polish](#11-phase-7)
12. [Phase 8 — Production Hardening](#12-phase-8)
13. [Phase 9 — Deployment](#13-phase-9)
14. [Troubleshooting Playbook](#14-troubleshooting)

---

<a id="1-overview"></a>
## 1. Overview & What "Stunning" Means Here

### What ASK Mode does

A user lands on the ASK page and asks a question in natural language — *"What is Form 6?"*, *"My name is missing from the voter list, what do I do?"*, *"When was the last general election?"* — and MAI responds with:

1. A clear, grounded answer in plain language
2. Inline citations like `[1]` `[2]` mapped to the exact ECI document chunk
3. Expandable source previews showing the original text
4. Streamed response with elegant motion
5. Optional voice input and audio playback

### Why this is architecturally different

```
Plain Gemini chatbot:
  Question → Gemini training data → Answer
  ❌ May hallucinate
  ❌ Uncited
  ❌ Outdated

MAI's RAG system:
  Question → Embed → Vector search on ECI docs →
  Top-k relevant chunks → Gemini with context →
  Grounded answer + citations
  ✅ Only answers from official sources
  ✅ Every claim cites a document
  ✅ Auditable
```

### The aesthetic direction — "Editorial Civic Journal"

This is the single most important design decision. Most AI chat UIs look like ChatGPT clones — gray bubbles, generic white cards, rounded everything. MAI will look nothing like that.

**Visual direction:**

- Think *The New Yorker* meets *Rest of World* meets an old-school election pamphlet
- Newspaper-grade typography — a confident serif display face paired with a precise sans body
- Warm near-black background (#0A0A0F) with a subtle grain overlay
- Cream paper accent (#F5F0E8) instead of pure white — never pure white
- Saffron (#FF6B35) as a single, disciplined accent — used sparingly
- Citations rendered like academic footnotes, not tooltip chips
- Messages as editorial prose, not bubbles
- Generous whitespace, asymmetric composition

**What we reject:**
- Chat bubbles
- Purple-to-blue gradients
- Generic Inter everywhere
- Shadcn card patterns
- Emoji-heavy UI
- "AI shimmer" loading states

---

<a id="2-mental-model"></a>
## 2. Mental Model — Understand RAG Before You Build It

**Read this section end-to-end before writing a single line of code.**

### The core problem RAG solves

When you ask Gemini *"What's the deadline to file Form 8 in Tamil Nadu?"*, it might give you a plausible-sounding answer that's actually wrong — because Gemini's training data may be outdated, partial, or mixed with incorrect forum posts.

In a legal/electoral context, wrong answers are dangerous. A voter misled about deadlines loses their vote.

### How RAG fixes it

RAG = **R**etrieval **A**ugmented **G**eneration.

Instead of asking Gemini a question cold, you first **retrieve** relevant paragraphs from your trusted documents, then **augment** Gemini's prompt with that context, then ask it to generate an answer **using only that context**.

### The 4-step flow

```
1. INGESTION (done once, offline)
   ECI PDFs → Split into chunks → Convert each chunk to a vector
   (embedding) → Store vectors + text in Firestore

2. RETRIEVAL (done on every user question)
   User question → Convert to vector → Find the 5 chunks
   with most similar vectors (cosine similarity)

3. AUGMENTATION
   Build a prompt: "Using ONLY these passages, answer the question.
   Cite passages as [1], [2]...  If answer isn't in passages,
   say so. Passages: <inject top-5 chunks>"

4. GENERATION
   Send to Gemini → Stream response → Render with citations
```

### What an "embedding" actually is

A piece of text becomes a list of numbers — say, 768 floats — that represents its meaning in high-dimensional space. Texts with similar meanings have vectors that point in similar directions. We measure similarity via **cosine similarity**: the angle between two vectors.

We'll use Google's `text-embedding-004` model to generate these vectors. It's free for our volume.

### Why we're NOT using a dedicated vector database

For MAI's corpus (~500–2000 chunks from public ECI docs), we don't need Pinecone, Weaviate, or Chroma. Those add complexity for a scale we don't have.

**Our approach:** Store chunks + embeddings in Firestore. On each query, load all embeddings into memory in the Cloud Function, compute cosine similarity, return top-k. This is simple, free, and performant at our scale.

### The system prompt is the safety wall

Our Gemini system prompt will explicitly say:
- Answer ONLY from provided passages
- Never use outside knowledge
- If the answer isn't in the passages, say "I don't have information on that in my ECI sources"
- Always cite passages as `[1]`, `[2]`

This is what prevents hallucinations.

---

<a id="3-architecture"></a>
## 3. Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                     │
│                                                              │
│   /ask page                                                  │
│   ├── <ChatStream />            message history              │
│   ├── <Composer />              input + voice                │
│   ├── <Citation />              footnote component           │
│   ├── <SourceDrawer />          expandable source preview    │
│   └── <StarterQuestions />      empty-state prompts          │
│                                                              │
│   State managed via React Context + hooks                    │
│   Streaming via Server-Sent Events                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (Firebase callable)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              FIREBASE CLOUD FUNCTIONS (Node.js 20)           │
│                                                              │
│   /askGemini     POST { question, conversationId }           │
│       ├── Embed question (text-embedding-004)                │
│       ├── Load chunk embeddings from Firestore cache         │
│       ├── Cosine similarity → top 5 chunks                   │
│       ├── Build grounded prompt                              │
│       ├── Stream Gemini 1.5 Pro response                     │
│       └── Return streamed text + source metadata             │
│                                                              │
│   /ingest        (admin-only, run once locally)              │
│       ├── Parse ECI PDFs                                     │
│       ├── Chunk (800 tokens, 100 overlap)                    │
│       ├── Embed each chunk                                   │
│       └── Write to Firestore                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE FIRESTORE                        │
│                                                              │
│   /eci_chunks/{chunkId}                                      │
│     ├── text          (the chunk content)                    │
│     ├── embedding     (768-dim vector)                       │
│     ├── source        (PDF filename)                         │
│     ├── sourceUrl     (ECI public URL)                       │
│     ├── page          (page number)                          │
│     └── heading       (section heading if extracted)         │
│                                                              │
│   /conversations/{uid}/{conversationId}                      │
│     ├── messages[]                                           │
│     ├── createdAt                                            │
│     └── updatedAt                                            │
└─────────────────────────────────────────────────────────────┘
```

---

<a id="4-prerequisites"></a>
## 4. Prerequisites & Accounts

Before you start, have these ready:

### Software
- Node.js 20+ (`node --version`)
- npm 10+ or pnpm
- Firebase CLI: `npm install -g firebase-tools`
- Git

### Accounts
- Google account (for Firebase + Gemini)
- A free-tier Firebase project with **Blaze plan** enabled (pay-as-you-go — needed for Cloud Functions outbound calls. Free tier more than covers this project.)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Documents to collect (download these NOW)
Put them in a folder called `data/eci-pdfs/` inside your project:

1. ECI Voter Guide — https://eci.gov.in (search "Voter Guide")
2. ECI FAQ PDF on registration
3. Form 6 instructions PDF
4. Form 8 instructions PDF
5. EVM & VVPAT manual (ECI)
6. Model Code of Conduct brief
7. Any State Chief Electoral Officer FAQ for your state (e.g., Tamil Nadu CEO)

Aim for 5–10 PDFs, totaling roughly 200–500 pages. That will produce ~800–2000 chunks. Plenty for a strong demo.

---

<a id="5-phase-1"></a>
## 5. Phase 1 — Firebase & Project Foundation

### 5.1 Install dependencies

From your project root (where `package.json` lives):

```bash
# Frontend dependencies
npm install firebase framer-motion lucide-react react-markdown remark-gfm clsx

# Dev dependencies
npm install -D tailwindcss@^3 postcss autoprefixer
npx tailwindcss init -p
```

### 5.2 Initialize Firebase

```bash
firebase login
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions (use TypeScript = **No** — keep it JS for speed)
- ✅ Hosting
- ✅ Emulators (Firestore + Functions)

Node runtime for Functions: **20**.

### 5.3 Install Cloud Function dependencies

```bash
cd functions
npm install @google/generative-ai firebase-admin firebase-functions pdf-parse
cd ..
```

### 5.4 Configure environment variables

Create `functions/.env` (this file is gitignored automatically by Firebase):

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Create `.env.local` at the root for the frontend (Vite auto-loads it):

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Get these from Firebase Console → Project Settings → Your Apps → Web App Config.

### 5.5 Firestore security rules

Edit `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ECI chunks: public read, admin-only write
    match /eci_chunks/{chunkId} {
      allow read: if true;
      allow write: if false;  // Only written via admin SDK
    }

    // User conversations
    match /conversations/{userId}/messages/{messageId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

Deploy the rules:

```bash
firebase deploy --only firestore:rules
```

### 5.6 Firebase client initialization

Create `src/services/firebase.js`:

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app, "asia-south1");  // Mumbai
export const auth = getAuth(app);
```

**Why `asia-south1`?** Lowest latency for Indian users. Always pick the region nearest your audience.

---

<a id="6-phase-2"></a>
## 6. Phase 2 — The Ingestion Pipeline (Documents → Embeddings)

This is the work that happens **once, offline** — you run a script, it processes every PDF, and writes chunks + embeddings to Firestore.

### 6.1 The ingestion script

Create `functions/ingest.js`. This is a **local-only** script you'll run once.

```javascript
// functions/ingest.js
// Run with: node ingest.js
// Requires: admin SDK service account key

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";
import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync("./service-account.json", "utf8"))
  ),
});

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

// ============================================================
// CHUNKING STRATEGY
// ============================================================
// Split by double-newlines first (natural paragraph breaks),
// then merge small chunks up to ~800 tokens, with ~100 token overlap.

const TARGET_TOKENS = 800;
const OVERLAP_TOKENS = 100;
const CHARS_PER_TOKEN = 4; // rough heuristic

function splitIntoChunks(text, source, sourceUrl) {
  // Clean up the text
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  // First, split on paragraph breaks
  const paragraphs = cleaned.split(/\n\n+/).filter((p) => p.length > 50);

  const chunks = [];
  let current = "";
  let currentStartIdx = 0;

  for (const para of paragraphs) {
    const paraTokens = Math.ceil(para.length / CHARS_PER_TOKEN);
    const currentTokens = Math.ceil(current.length / CHARS_PER_TOKEN);

    if (currentTokens + paraTokens > TARGET_TOKENS && current.length > 0) {
      // Commit current chunk
      chunks.push({
        text: current.trim(),
        source,
        sourceUrl,
      });

      // Start new chunk with overlap from previous
      const overlapChars = OVERLAP_TOKENS * CHARS_PER_TOKEN;
      current = current.slice(-overlapChars) + "\n\n" + para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }

  if (current.trim().length > 0) {
    chunks.push({
      text: current.trim(),
      source,
      sourceUrl,
    });
  }

  return chunks;
}

// ============================================================
// EMBEDDING
// ============================================================

async function embed(text) {
  const result = await embedModel.embedContent(text);
  return result.embedding.values; // 768-dim vector
}

// ============================================================
// INGEST ONE PDF
// ============================================================

async function ingestPdf(filePath, sourceUrl) {
  const fileName = path.basename(filePath);
  console.log(`\n📄 Processing ${fileName}...`);

  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  console.log(`   Pages: ${data.numpages}, Text length: ${data.text.length}`);

  const chunks = splitIntoChunks(data.text, fileName, sourceUrl);
  console.log(`   Chunks created: ${chunks.length}`);

  // Embed in batches to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const embedded = await Promise.all(
      batch.map(async (chunk) => {
        const embedding = await embed(chunk.text);
        return { ...chunk, embedding };
      })
    );

    // Write to Firestore
    const writeBatch = db.batch();
    for (const chunk of embedded) {
      const ref = db.collection("eci_chunks").doc();
      writeBatch.set(ref, {
        ...chunk,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    await writeBatch.commit();

    console.log(`   ✓ Embedded & stored ${i + batch.length}/${chunks.length}`);
    // Rate limit buffer
    await new Promise((r) => setTimeout(r, 1000));
  }
}

// ============================================================
// MAIN
// ============================================================

const MANIFEST = [
  {
    file: "./data/eci-pdfs/voter-guide.pdf",
    url: "https://eci.gov.in/voter-guide",
  },
  {
    file: "./data/eci-pdfs/form-6.pdf",
    url: "https://eci.gov.in/files/forms/form-6",
  },
  {
    file: "./data/eci-pdfs/form-8.pdf",
    url: "https://eci.gov.in/files/forms/form-8",
  },
  {
    file: "./data/eci-pdfs/evm-manual.pdf",
    url: "https://eci.gov.in/evm-manual",
  },
  // add more here
];

async function main() {
  console.log("🚀 Starting ECI document ingestion...\n");

  for (const entry of MANIFEST) {
    try {
      await ingestPdf(entry.file, entry.url);
    } catch (err) {
      console.error(`   ✗ Failed: ${entry.file}`, err.message);
    }
  }

  console.log("\n✅ Ingestion complete.");
  process.exit(0);
}

main();
```

### 6.2 Get a service account key (local ingestion only)

1. Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key**
3. Save as `functions/service-account.json`
4. **Add to `.gitignore` IMMEDIATELY**:
   ```
   functions/service-account.json
   functions/.env
   data/eci-pdfs/
   ```

### 6.3 Add dotenv for local script

```bash
cd functions
npm install dotenv pdf-parse
```

Add to `functions/package.json`:

```json
{
  "type": "module",
  "scripts": {
    "ingest": "node ingest.js"
  }
}
```

### 6.4 Run ingestion

```bash
cd functions
npm run ingest
```

Expect this to take 10–20 minutes for ~5 PDFs. You'll see a live log of each chunk being embedded. When done, check Firestore Console — you should have hundreds of documents in `eci_chunks`.

### 6.5 Verify the corpus

Run a quick check:

```javascript
// functions/verify.js
import admin from "firebase-admin";
import fs from "fs";

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync("./service-account.json", "utf8"))
  ),
});

const db = admin.firestore();

const snap = await db.collection("eci_chunks").count().get();
console.log(`Total chunks: ${snap.data().count}`);

const sample = await db.collection("eci_chunks").limit(1).get();
sample.forEach((doc) => {
  const d = doc.data();
  console.log("Sample chunk:");
  console.log("  Source:", d.source);
  console.log("  Text (first 200):", d.text.slice(0, 200));
  console.log("  Embedding dims:", d.embedding.length);
});

process.exit(0);
```

Run: `node verify.js`. You should see your chunk count and a sample.

---

<a id="7-phase-3"></a>
## 7. Phase 3 — The Retrieval + Generation Cloud Function

Now the live function that runs on every user question.

### 7.1 The main Cloud Function

Create `functions/index.js`:

```javascript
// functions/index.js
import { onCall, HttpsError } from "firebase-functions/v2/https";
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
// For our ~1000-chunk corpus, this is ~6MB. Fits easily.

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
Not: "Form 6 is used for new voter registration (Passage 1: Voter Guide, page 4)."
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
// ASK FUNCTION — streamed
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
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const genModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    try {
      // Step 1: Embed the question
      const qEmbedding = (await embedModel.embedContent(question)).embedding.values;

      // Step 2: Load chunks (cached)
      const chunks = await loadChunks();

      // Step 3: Retrieve top 5
      const retrieved = topK(qEmbedding, chunks, 5);

      // Step 4: Build grounded prompt
      const prompt = buildPrompt(question, retrieved);

      // Step 5: Generate (non-streaming for callable; streaming via separate HTTPS endpoint below)
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
```

### 7.2 A streaming HTTPS endpoint for better UX

Callable functions don't stream easily. We'll add a second endpoint for streaming Server-Sent Events (SSE):

```javascript
// Add to functions/index.js

import { onRequest } from "firebase-functions/v2/https";

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
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const genModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    try {
      const qEmbedding = (await embedModel.embedContent(question)).embedding.values;
      const chunks = await loadChunks();
      const retrieved = topK(qEmbedding, chunks, 5);

      // Send sources first
      const sources = retrieved.map((c, i) => ({
        index: i + 1,
        source: c.source,
        sourceUrl: c.sourceUrl,
        snippet: c.text.slice(0, 300) + (c.text.length > 300 ? "..." : ""),
      }));
      res.write(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`);

      // Stream generation
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
      res.write(`data: ${JSON.stringify({ type: "error", message: "Failed" })}\n\n`);
      res.end();
    }
  }
);
```

### 7.3 Set the Gemini secret

```bash
firebase functions:secrets:set GEMINI_API_KEY
# Paste your key when prompted
```

### 7.4 Deploy & test

```bash
firebase deploy --only functions
```

Test with curl:

```bash
curl -X POST https://asia-south1-<your-project>.cloudfunctions.net/askGeminiStream \
  -H "Content-Type: application/json" \
  -d '{"question":"What is Form 6?"}'
```

You should see streaming SSE events.

---

<a id="8-phase-4"></a>
## 8. Phase 4 — The Design System (Editorial Civic Journal)

**This is where "stunning" happens.** Most AI apps look generic because they skip this step. We won't.

### 8.1 The typography — fonts that actually have character

Create `src/design-system/typography.css`:

```css
/* Load distinctive fonts — NOT generic Inter/Roboto */

/* Display: Fraunces — editorial, warm serif with optical sizes */
/* Body: Geist — modern, precise sans from Vercel */
/* Mono: JetBrains Mono — for citations and technical elements */

@import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap");

:root {
  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Geist", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

/* Base */
html, body {
  font-family: var(--font-body);
  font-feature-settings: "ss01", "ss02", "cv11";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.01em;
}

/* Display sizes — ratio: 1.333 (perfect fourth) */
.text-display-2xl {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 6vw, 5.5rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  font-weight: 400;
  font-variation-settings: "opsz" 144;
}

.text-display-xl {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 4vw, 3.75rem);
  line-height: 1;
  letter-spacing: -0.03em;
  font-weight: 400;
  font-variation-settings: "opsz" 90;
}

.text-display-lg {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  font-weight: 500;
}

.text-display-italic {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
}

/* Body sizes */
.text-body-lg {
  font-size: 1.125rem;
  line-height: 1.6;
}

.text-body {
  font-size: 1rem;
  line-height: 1.65;
}

.text-body-sm {
  font-size: 0.875rem;
  line-height: 1.55;
}

.text-caption {
  font-size: 0.75rem;
  line-height: 1.4;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.text-mono {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: -0.02em;
}
```

### 8.2 The color system — disciplined, not rainbow

Update `src/design-system/tokens.css`:

```css
:root {
  /* ============================================================
     COLOR SYSTEM — Editorial Civic Journal
     Dominant: near-black ink
     Paper: warm cream (never pure white)
     Accent: saffron (sparingly)
     Support: india blue, muted slate
     ============================================================ */

  /* Ink scale (backgrounds & deep text) */
  --ink-900: #0A0A0F;       /* Deepest background */
  --ink-800: #14141B;       /* Surface */
  --ink-700: #1E1E29;       /* Elevated surface */
  --ink-600: #2A2A38;       /* Border / divider */
  --ink-500: #3D3D4E;       /* Subtle emphasis */
  --ink-400: #6B6B7B;       /* Muted text */
  --ink-300: #9999A8;       /* Placeholder */

  /* Paper (warm whites) */
  --paper-100: #F5F0E8;     /* Primary paper */
  --paper-200: #ECE6DB;     /* Muted paper */
  --paper-300: #D9D3C6;     /* Paper subtle */

  /* Saffron (primary accent — use sparingly) */
  --saffron-500: #FF6B35;   /* Primary */
  --saffron-400: #FF8A5C;   /* Hover */
  --saffron-600: #E55A2B;   /* Pressed */
  --saffron-glow: rgba(255, 107, 53, 0.15);

  /* India Blue (secondary) */
  --blue-500: #2540D4;
  --blue-400: #4B63E8;
  --blue-600: #1C32B5;

  /* Semantic */
  --success: #34D399;
  --warning: #FBBF24;
  --error: #F87171;

  /* ============================================================
     TYPE & SPACING
     ============================================================ */

  --space-px: 1px;
  --space-0-5: 0.125rem;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* Radii — restrained, not pill-heavy */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 500ms;

  /* Shadows — subtle, not dramatic */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.25);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.35);
  --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.45);
  --shadow-glow: 0 0 40px var(--saffron-glow);

  /* Layout */
  --max-prose: 680px;
  --max-wide: 1080px;
}

/* ============================================================
   GLOBAL STYLES
   ============================================================ */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background: var(--ink-900);
  color: var(--paper-100);
  min-height: 100vh;
}

/* Grain overlay on body — subtle texture */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Selection */
::selection {
  background: var(--saffron-500);
  color: var(--ink-900);
}

/* Scrollbar */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: var(--ink-900); }
::-webkit-scrollbar-thumb {
  background: var(--ink-600);
  border-radius: 5px;
}
::-webkit-scrollbar-thumb:hover { background: var(--ink-500); }

/* Links */
a {
  color: var(--saffron-500);
  text-decoration: none;
  text-underline-offset: 3px;
  transition: color var(--duration-fast) var(--ease-out);
}
a:hover {
  color: var(--saffron-400);
  text-decoration: underline;
}

/* Focus ring */
:focus-visible {
  outline: 2px solid var(--saffron-500);
  outline-offset: 2px;
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 8.3 Import everything

Update `src/main.jsx`:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./design-system/tokens.css";
import "./design-system/typography.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

<a id="9-phase-5"></a>
## 9. Phase 5 — The Chat UI Components

Now the fun part. Every component below is hand-built, no library.

### 9.1 Folder structure

```
src/
├── components/
│   └── ask/
│       ├── AskPage.jsx
│       ├── ChatStream.jsx
│       ├── Message.jsx
│       ├── Composer.jsx
│       ├── Citation.jsx
│       ├── SourceDrawer.jsx
│       ├── StarterQuestions.jsx
│       ├── ThinkingIndicator.jsx
│       └── ask.css
```

### 9.2 The ASK page — the editorial frame

Create `src/components/ask/AskPage.jsx`:

```jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatStream from "./ChatStream";
import Composer from "./Composer";
import StarterQuestions from "./StarterQuestions";
import SourceDrawer from "./SourceDrawer";
import { askMai } from "../../services/askClient";
import "./ask.css";

export default function AskPage() {
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const [openSource, setOpenSource] = useState(null);
  const abortRef = useRef(null);

  async function handleAsk(question) {
    if (!question.trim() || pending) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      text: question,
    };
    const aiMsgId = crypto.randomUUID();
    const aiMsg = {
      id: aiMsgId,
      role: "assistant",
      text: "",
      sources: [],
      streaming: true,
    };

    setMessages((m) => [...m, userMsg, aiMsg]);
    setPending(true);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      await askMai(question, abort.signal, {
        onSources: (sources) => {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aiMsgId ? { ...msg, sources } : msg
            )
          );
        },
        onToken: (token) => {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aiMsgId ? { ...msg, text: msg.text + token } : msg
            )
          );
        },
        onDone: () => {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aiMsgId ? { ...msg, streaming: false } : msg
            )
          );
          setPending(false);
        },
        onError: () => {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === aiMsgId
                ? {
                    ...msg,
                    text:
                      msg.text ||
                      "Something went wrong. Please try again, or call the Voter Helpline at 1950.",
                    streaming: false,
                  }
                : msg
            )
          );
          setPending(false);
        },
      });
    } catch (err) {
      setPending(false);
    }
  }

  function handleStop() {
    abortRef.current?.abort();
    setPending(false);
  }

  function handleClear() {
    if (pending) handleStop();
    setMessages([]);
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="ask-page">
      {/* Editorial header */}
      <header className="ask-header">
        <div className="ask-header-inner">
          <div className="ask-masthead">
            <span className="ask-masthead-dot" aria-hidden />
            <span className="text-caption">MAI — ASK</span>
          </div>
          {!isEmpty && (
            <button className="ask-clear-btn" onClick={handleClear}>
              New conversation
            </button>
          )}
        </div>
      </header>

      {/* Main stage */}
      <main className="ask-stage">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="ask-empty"
            >
              <h1 className="text-display-2xl ask-title">
                Ask about the election process in{" "}
                <span className="text-display-italic ask-title-accent">India</span>
              </h1>
              <p className="text-body-lg ask-subtitle">
                Every answer is grounded in official documents from the Election Commission of India.
              </p>
              <StarterQuestions onPick={handleAsk} />
            </motion.div>
          ) : (
            <motion.div
              key="stream"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="ask-conversation"
            >
              <ChatStream
                messages={messages}
                onOpenSource={setOpenSource}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Composer */}
      <div className="ask-composer-wrap">
        <Composer
          onSubmit={handleAsk}
          onStop={handleStop}
          disabled={pending}
        />
        <p className="ask-disclaimer text-caption">
          MAI cites official ECI documents. For urgent issues, call 1950.
        </p>
      </div>

      {/* Source drawer */}
      <AnimatePresence>
        {openSource && (
          <SourceDrawer
            source={openSource}
            onClose={() => setOpenSource(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 9.3 The chat stream

Create `src/components/ask/ChatStream.jsx`:

```jsx
import { useEffect, useRef } from "react";
import Message from "./Message";

export default function ChatStream({ messages, onOpenSource }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="chat-stream">
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} onOpenSource={onOpenSource} />
      ))}
      <div ref={endRef} style={{ height: "2rem" }} />
    </div>
  );
}
```

### 9.4 The message component — editorial, not bubbles

Create `src/components/ask/Message.jsx`:

```jsx
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import Citation from "./Citation";
import ThinkingIndicator from "./ThinkingIndicator";

export default function Message({ message, onOpenSource }) {
  const [copied, setCopied] = useState(false);

  if (message.role === "user") {
    return (
      <motion.div
        className="msg msg-user"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="msg-user-marker" aria-hidden />
        <p className="msg-user-text">{message.text}</p>
      </motion.div>
    );
  }

  // Assistant
  const isEmpty = !message.text && message.streaming;

  return (
    <motion.article
      className="msg msg-assistant"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="msg-byline">
        <span className="msg-byline-mark" aria-hidden>M</span>
        <span className="text-caption msg-byline-label">MAI</span>
        {message.streaming && <ThinkingIndicator />}
      </header>

      {isEmpty ? (
        <div className="msg-initial-loading">
          <ThinkingIndicator large />
        </div>
      ) : (
        <>
          <div className="msg-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="msg-p">{renderWithCitations(children, message.sources, onOpenSource)}</p>,
                ul: ({ children }) => <ul className="msg-ul">{children}</ul>,
                ol: ({ children }) => <ol className="msg-ol">{children}</ol>,
                li: ({ children }) => <li className="msg-li">{renderWithCitations(children, message.sources, onOpenSource)}</li>,
                strong: ({ children }) => <strong className="msg-strong">{children}</strong>,
                code: ({ children }) => <code className="msg-code">{children}</code>,
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>

          {!message.streaming && message.sources?.length > 0 && (
            <footer className="msg-sources">
              <div className="text-caption msg-sources-label">Sources</div>
              <ol className="msg-sources-list">
                {message.sources.map((s) => (
                  <li key={s.index}>
                    <button
                      className="msg-source-btn"
                      onClick={() => onOpenSource(s)}
                    >
                      <span className="msg-source-num">[{s.index}]</span>
                      <span className="msg-source-title">{s.source}</span>
                    </button>
                  </li>
                ))}
              </ol>

              <div className="msg-actions">
                <button
                  className="msg-action"
                  onClick={() => {
                    navigator.clipboard.writeText(message.text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </footer>
          )}
        </>
      )}
    </motion.article>
  );
}

/**
 * Replace inline [1], [2] markers in text with Citation components.
 * Walks through React children recursively.
 */
function renderWithCitations(children, sources, onOpenSource) {
  if (!sources?.length) return children;

  const walk = (node) => {
    if (typeof node === "string") {
      const parts = node.split(/(\[\d+\])/g);
      return parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const num = parseInt(match[1], 10);
          const source = sources.find((s) => s.index === num);
          return (
            <Citation
              key={i}
              number={num}
              source={source}
              onOpen={onOpenSource}
            />
          );
        }
        return part;
      });
    }
    if (Array.isArray(node)) {
      return node.map((n, i) => <span key={i}>{walk(n)}</span>);
    }
    return node;
  };

  return walk(children);
}
```

### 9.5 The citation component — academic footnote feel

Create `src/components/ask/Citation.jsx`:

```jsx
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
```

### 9.6 The composer — input with voice, mature feel

Create `src/components/ask/Composer.jsx`:

```jsx
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
```

### 9.7 The starter questions — editorial empty state

Create `src/components/ask/StarterQuestions.jsx`:

```jsx
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const QUESTIONS = [
  {
    heading: "First-time voter",
    prompt: "How do I register as a first-time voter in India?",
  },
  {
    heading: "Missing name",
    prompt: "My name isn't on the voter list. What should I do?",
  },
  {
    heading: "Moving house",
    prompt: "I moved to a new city. How do I transfer my voter registration?",
  },
  {
    heading: "Valid documents",
    prompt: "What ID documents are accepted at the polling booth?",
  },
];

export default function StarterQuestions({ onPick }) {
  return (
    <div className="starters">
      {QUESTIONS.map((q, i) => (
        <motion.button
          key={q.heading}
          className="starter"
          onClick={() => onPick(q.prompt)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.15 + i * 0.06,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          whileHover={{ y: -2 }}
        >
          <div className="starter-heading text-caption">{q.heading}</div>
          <div className="starter-prompt">{q.prompt}</div>
          <ArrowUpRight size={16} className="starter-arrow" />
        </motion.button>
      ))}
    </div>
  );
}
```

### 9.8 The thinking indicator — not a generic spinner

Create `src/components/ask/ThinkingIndicator.jsx`:

```jsx
import { motion } from "framer-motion";

export default function ThinkingIndicator({ large = false }) {
  return (
    <div className={`thinking ${large ? "thinking-large" : ""}`} aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="thinking-dot"
          animate={{
            y: [0, -4, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}
```

### 9.9 The source drawer — expandable original text

Create `src/components/ask/SourceDrawer.jsx`:

```jsx
import { motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

export default function SourceDrawer({ source, onClose }) {
  return (
    <motion.div
      className="drawer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="drawer-header">
          <div>
            <div className="text-caption drawer-label">
              Source [{source.index}]
            </div>
            <h3 className="text-display-lg drawer-title">{source.source}</h3>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="drawer-body">
          <p className="drawer-snippet">{source.snippet}</p>

          {source.sourceUrl && (
            <a
              href={source.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-link"
            >
              View original document <ExternalLink size={14} />
            </a>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}
```

### 9.10 The stylesheet

Create `src/components/ask/ask.css`. This is long but every block serves the aesthetic:

```css
/* ============================================================
   ASK PAGE — EDITORIAL CIVIC JOURNAL
   ============================================================ */

.ask-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  max-width: 100vw;
  overflow-x: hidden;
}

/* ====== HEADER ====== */

.ask-header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(20px);
  background: rgba(10, 10, 15, 0.7);
  border-bottom: 1px solid var(--ink-600);
}

.ask-header-inner {
  max-width: var(--max-wide);
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ask-masthead {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--paper-100);
}

.ask-masthead-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--saffron-500);
  box-shadow: 0 0 12px var(--saffron-500);
}

.ask-clear-btn {
  background: transparent;
  border: 1px solid var(--ink-600);
  color: var(--paper-100);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.ask-clear-btn:hover {
  border-color: var(--saffron-500);
  color: var(--saffron-500);
}

/* ====== STAGE ====== */

.ask-stage {
  position: relative;
  padding: var(--space-10) var(--space-6);
  max-width: var(--max-wide);
  width: 100%;
  margin: 0 auto;
  z-index: 2;
}

/* ====== EMPTY STATE ====== */

.ask-empty {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
  padding-top: var(--space-16);
  max-width: var(--max-prose);
  margin: 0 auto;
}

.ask-title {
  color: var(--paper-100);
  max-width: 14ch;
}

.ask-title-accent {
  color: var(--saffron-500);
}

.ask-subtitle {
  color: var(--ink-400);
  max-width: 48ch;
}

/* ====== STARTER QUESTIONS ====== */

.starters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

@media (max-width: 640px) {
  .starters {
    grid-template-columns: 1fr;
  }
}

.starter {
  text-align: left;
  background: var(--ink-800);
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  cursor: pointer;
  color: var(--paper-100);
  font-family: var(--font-body);
  position: relative;
  transition: all var(--duration-base) var(--ease-out);
  overflow: hidden;
}

.starter::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    var(--saffron-glow) 100%
  );
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-out);
}

.starter:hover {
  border-color: var(--saffron-500);
  transform: translateY(-2px);
}

.starter:hover::before {
  opacity: 1;
}

.starter-heading {
  color: var(--saffron-500);
  margin-bottom: var(--space-2);
  font-weight: 500;
  position: relative;
  z-index: 1;
}

.starter-prompt {
  font-size: 1rem;
  line-height: 1.45;
  color: var(--paper-100);
  position: relative;
  z-index: 1;
}

.starter-arrow {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  color: var(--ink-400);
  transition: all var(--duration-base) var(--ease-out);
}

.starter:hover .starter-arrow {
  color: var(--saffron-500);
  transform: translate(2px, -2px);
}

/* ====== CONVERSATION ====== */

.ask-conversation {
  max-width: var(--max-prose);
  margin: 0 auto;
}

.chat-stream {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

/* ====== USER MESSAGE — editorial quote style ====== */

.msg-user {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-2) 0;
}

.msg-user-marker {
  width: 3px;
  background: var(--saffron-500);
  border-radius: 2px;
  flex-shrink: 0;
}

.msg-user-text {
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1.35;
  font-style: italic;
  color: var(--paper-100);
  font-weight: 400;
}

/* ====== ASSISTANT MESSAGE ====== */

.msg-assistant {
  padding-left: var(--space-1);
}

.msg-byline {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.msg-byline-mark {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--paper-100);
  color: var(--ink-900);
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.875rem;
}

.msg-byline-label {
  color: var(--ink-400);
  font-weight: 500;
}

.msg-body {
  color: var(--paper-100);
  font-size: 1.0625rem;
  line-height: 1.7;
}

.msg-p {
  margin-bottom: var(--space-4);
}
.msg-p:last-child { margin-bottom: 0; }

.msg-ul, .msg-ol {
  margin: var(--space-4) 0;
  padding-left: var(--space-6);
}

.msg-li {
  margin-bottom: var(--space-2);
}

.msg-strong {
  color: var(--paper-100);
  font-weight: 600;
}

.msg-code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--ink-700);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--saffron-400);
}

.msg-initial-loading {
  padding: var(--space-4) 0;
}

/* ====== CITATIONS ====== */

.cite {
  display: inline;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.7em;
  color: var(--saffron-500);
  transition: color var(--duration-fast) var(--ease-out);
  vertical-align: super;
  line-height: 0;
}

.cite:hover {
  color: var(--saffron-400);
  text-decoration: underline;
}

.cite-empty {
  color: var(--ink-400);
  cursor: default;
}

/* ====== SOURCES FOOTER ====== */

.msg-sources {
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--ink-600);
}

.msg-sources-label {
  color: var(--ink-400);
  margin-bottom: var(--space-3);
  font-weight: 500;
}

.msg-sources-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-4) 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.msg-source-btn {
  background: transparent;
  border: none;
  color: var(--ink-400);
  padding: var(--space-2) 0;
  cursor: pointer;
  display: flex;
  gap: var(--space-3);
  align-items: baseline;
  font-family: var(--font-body);
  font-size: 0.875rem;
  text-align: left;
  transition: color var(--duration-fast) var(--ease-out);
}

.msg-source-btn:hover {
  color: var(--saffron-500);
}

.msg-source-num {
  font-family: var(--font-mono);
  color: var(--saffron-500);
  font-size: 0.75rem;
}

.msg-actions {
  display: flex;
  gap: var(--space-2);
}

.msg-action {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: transparent;
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-md);
  color: var(--ink-400);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  font-family: var(--font-body);
}

.msg-action:hover {
  border-color: var(--paper-100);
  color: var(--paper-100);
}

/* ====== THINKING DOTS ====== */

.thinking {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 0 var(--space-2);
}

.thinking-dot {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--saffron-500);
}

.thinking-large .thinking-dot {
  width: 8px;
  height: 8px;
}

/* ====== COMPOSER ====== */

.ask-composer-wrap {
  position: sticky;
  bottom: 0;
  background: linear-gradient(
    to top,
    var(--ink-900) 0%,
    var(--ink-900) 70%,
    transparent 100%
  );
  padding: var(--space-6) var(--space-6) var(--space-4);
  z-index: 5;
}

.composer {
  max-width: var(--max-prose);
  margin: 0 auto;
}

.composer-inner {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  background: var(--ink-800);
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-xl);
  padding: var(--space-2);
  transition: border-color var(--duration-base) var(--ease-out);
}

.composer-inner:focus-within {
  border-color: var(--saffron-500);
  box-shadow: 0 0 0 3px var(--saffron-glow);
}

.composer-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  padding: var(--space-3) var(--space-4);
  color: var(--paper-100);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.5;
  max-height: 200px;
}

.composer-input::placeholder {
  color: var(--ink-400);
}

.composer-actions {
  display: flex;
  gap: var(--space-1);
  padding-right: var(--space-1);
  padding-bottom: var(--space-1);
}

.composer-mic, .composer-send {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.composer-mic {
  background: transparent;
  color: var(--ink-400);
}

.composer-mic:hover {
  background: var(--ink-700);
  color: var(--paper-100);
}

.composer-mic.listening {
  background: var(--saffron-glow);
  color: var(--saffron-500);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--saffron-glow); }
  50% { box-shadow: 0 0 0 8px transparent; }
}

.composer-send {
  background: var(--saffron-500);
  color: var(--ink-900);
}

.composer-send:hover:not(:disabled) {
  background: var(--saffron-400);
  transform: translateY(-1px);
}

.composer-send:disabled {
  background: var(--ink-600);
  color: var(--ink-400);
  cursor: not-allowed;
}

.composer-send.stopping {
  background: var(--paper-100);
  color: var(--ink-900);
}

.ask-disclaimer {
  max-width: var(--max-prose);
  margin: var(--space-3) auto 0;
  color: var(--ink-400);
  text-align: center;
  letter-spacing: 0.05em;
}

/* ====== DRAWER ====== */

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 15, 0.6);
  backdrop-filter: blur(4px);
  z-index: 50;
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: 100%;
  max-width: 480px;
  height: 100%;
  background: var(--ink-800);
  border-left: 1px solid var(--ink-600);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-6);
  border-bottom: 1px solid var(--ink-600);
}

.drawer-label {
  color: var(--saffron-500);
  margin-bottom: var(--space-2);
  font-family: var(--font-mono);
}

.drawer-title {
  color: var(--paper-100);
  max-width: 24ch;
}

.drawer-close {
  background: transparent;
  border: 1px solid var(--ink-600);
  color: var(--paper-100);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.drawer-close:hover {
  border-color: var(--saffron-500);
  color: var(--saffron-500);
}

.drawer-body {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}

.drawer-snippet {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--paper-100);
  padding-left: var(--space-4);
  border-left: 2px solid var(--saffron-500);
  margin-bottom: var(--space-6);
}

.drawer-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--saffron-500);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  padding: var(--space-3) var(--space-4);
  background: var(--ink-900);
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}

.drawer-link:hover {
  border-color: var(--saffron-500);
  background: var(--saffron-glow);
}

/* ====== MOBILE ====== */

@media (max-width: 640px) {
  .ask-stage { padding: var(--space-6) var(--space-4); }
  .ask-composer-wrap { padding: var(--space-4); }
  .ask-empty { padding-top: var(--space-8); gap: var(--space-6); }
  .msg-user-text { font-size: 1.25rem; }
  .msg-body { font-size: 1rem; }
  .drawer { max-width: 100%; }
}
```

---

<a id="10-phase-6"></a>
## 10. Phase 6 — Streaming Integration

### 10.1 The client-side streaming function

Create `src/services/askClient.js`:

```javascript
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
```

### 10.2 Wire the ASK page into your router

In your main `App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AskPage from "./components/ask/AskPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ask" element={<AskPage />} />
        {/* other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

<a id="11-phase-7"></a>
## 11. Phase 7 — Citations, Sources & Polish

### 11.1 Citation quality checks

After wiring everything, test each citation:
- Click `[1]` → drawer opens with correct source
- The snippet shown is the actual chunk used
- External link works when `sourceUrl` was populated

### 11.2 Handle edge cases in the UI

Update `Message.jsx` to detect the "no answer" response and render it distinctively:

```jsx
// inside Message.jsx, before rendering text
const isNoAnswer = message.text.toLowerCase().includes("i don't have information");

{isNoAnswer ? (
  <div className="msg-no-answer">
    <p className="msg-p">{message.text}</p>
    <a href="tel:1950" className="helpline-link">
      Call Voter Helpline 1950
    </a>
  </div>
) : (
  /* normal rendering */
)}
```

Add to CSS:

```css
.msg-no-answer {
  padding: var(--space-5);
  border: 1px dashed var(--ink-500);
  border-radius: var(--radius-lg);
  background: var(--ink-800);
}

.helpline-link {
  display: inline-block;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-5);
  background: var(--saffron-500);
  color: var(--ink-900) !important;
  border-radius: var(--radius-md);
  font-weight: 500;
}
```

### 11.3 Conversation persistence (optional, but scores well)

Once Firebase Auth is in, save each conversation:

```javascript
// src/services/conversation.js
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function saveMessage(uid, conversationId, message) {
  return addDoc(
    collection(db, "conversations", uid, "messages"),
    { ...message, conversationId, createdAt: serverTimestamp() }
  );
}
```

---

<a id="12-phase-8"></a>
## 12. Phase 8 — Production Hardening

### 12.1 Rate limiting

Add basic rate limiting to your Cloud Function. Create `functions/rateLimit.js`:

```javascript
import admin from "firebase-admin";

const db = admin.firestore();

const MAX_PER_MINUTE = 10;
const MAX_PER_DAY = 100;

export async function checkRateLimit(fingerprint) {
  const now = Date.now();
  const minuteWindow = Math.floor(now / 60_000);
  const dayWindow = Math.floor(now / 86_400_000);

  const ref = db.collection("rate_limits").doc(fingerprint);

  const result = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.data() || { minute: {}, day: {} };

    const minuteCount = (data.minute[minuteWindow] || 0) + 1;
    const dayCount = (data.day[dayWindow] || 0) + 1;

    if (minuteCount > MAX_PER_MINUTE) return { ok: false, reason: "minute" };
    if (dayCount > MAX_PER_DAY) return { ok: false, reason: "day" };

    // Keep only current windows
    tx.set(ref, {
      minute: { [minuteWindow]: minuteCount },
      day: { [dayWindow]: dayCount },
    });

    return { ok: true };
  });

  return result;
}
```

Use it in the stream handler:

```javascript
const fingerprint = req.ip || "anonymous";
const check = await checkRateLimit(fingerprint);
if (!check.ok) {
  res.status(429).json({ error: `Too many requests (${check.reason})` });
  return;
}
```

### 12.2 Input safety

Strip suspicious inputs:

```javascript
function sanitizeQuestion(q) {
  return q
    .slice(0, 500)
    .replace(/<[^>]*>/g, "")        // no HTML
    .replace(/[<>{}[\]]/g, "")       // no bracket injection
    .trim();
}
```

### 12.3 Content Security Policy

Add to your Firebase Hosting config. Edit `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; connect-src 'self' https://*.cloudfunctions.net https://firestore.googleapis.com https://identitytoolkit.googleapis.com; img-src 'self' data:; object-src 'none'; frame-ancestors 'none';"
          },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
        ]
      }
    ]
  }
}
```

### 12.4 Error monitoring

Log every failed request with enough context:

```javascript
logger.error("askGeminiStream failure", {
  question: question.slice(0, 100),
  errorMessage: err.message,
  stack: err.stack,
});
```

Use Firebase Console → Functions → Logs to monitor.

### 12.5 Accessibility audit

Before deployment, check:
- ✅ All buttons have `aria-label`
- ✅ Focus rings visible on keyboard navigation
- ✅ Color contrast meets WCAG AA (paper on ink = 15:1, pass)
- ✅ Screen reader announces new messages (add `role="log"` + `aria-live="polite"` to chat stream)
- ✅ `prefers-reduced-motion` disables animations

Add to `ChatStream.jsx`:

```jsx
<div className="chat-stream" role="log" aria-live="polite" aria-relevant="additions">
```

---

<a id="13-phase-9"></a>
## 13. Phase 9 — Deployment

### 13.1 Build frontend

```bash
npm run build
```

### 13.2 Deploy everything

```bash
firebase deploy
```

This pushes:
- Functions (askGemini + askGeminiStream)
- Firestore rules
- Hosting (your built React app)

### 13.3 Smoke test on production URL

Your app is now at `https://<project-id>.web.app/ask`

Test:
- Empty state renders with starters
- Click a starter → response streams
- Citations are clickable
- Drawer opens + closes
- Voice input works (Chrome)
- Mobile layout works (open in phone)
- New conversation button clears state
- 429 appears if you hammer the endpoint

### 13.4 Submission checklist

- [ ] README updated with features + demo link
- [ ] Demo video recorded (2 min)
- [ ] GitHub repo is public
- [ ] `.env` files gitignored
- [ ] Service account key NOT in repo
- [ ] Custom domain (optional, but scores extra)

---

<a id="14-troubleshooting"></a>
## 14. Troubleshooting Playbook

| Symptom | Likely Cause | Fix |
|---|---|---|
| Ingestion fails with "Invalid API key" | `.env` not loaded | Ensure `import "dotenv/config"` at top of ingest.js |
| `askGeminiStream` returns 500 | Secret not set | Run `firebase functions:secrets:set GEMINI_API_KEY` and redeploy |
| No chunks retrieved | Empty Firestore | Re-run ingestion, verify with `verify.js` |
| Response doesn't cite | Weak prompt | Strengthen system prompt — be more explicit: "You MUST cite every fact" |
| Streaming hangs | CORS | Ensure `res.set("Access-Control-Allow-Origin", "*")` set BEFORE any write |
| Citations show `[1]` but no drawer | sources prop not passed | Check `onOpenSource` is wired all the way through |
| Mobile voice doesn't work | iOS Safari requires HTTPS | Test on deployed URL, not localhost |
| Cold start is slow (8+ sec) | Chunk cache not loaded | Pre-warm with scheduled function or accept first-request latency |
| Weird characters in answer | PDF encoding issues | Use `pdf-parse` options: `{ normalizeWhitespace: true }` |
| Answer mentions things not in sources | Prompt leak | Tighten system prompt with examples; reduce `temperature` to 0.2 |

---

## Final Notes — What "Production-Ready" Means Here

You've now built:

✅ A RAG pipeline with real vector embeddings, not keyword search
✅ A streaming Cloud Function with rate limiting
✅ An editorial-grade chat UI with zero component libraries
✅ Inline citations that link to actual source chunks
✅ Voice input using native Web Speech API
✅ Secure key management via Firebase secrets
✅ A content security policy
✅ Accessibility basics (focus rings, aria labels, reduced motion)
✅ Mobile-first responsive layout
✅ Deployed to Firebase Hosting at `asia-south1`

What makes this STAND OUT in a prompt-war competition:

1. **The architectural discipline** — RAG grounding is genuinely rare in student submissions
2. **The typography** — Fraunces + Geist + JetBrains Mono will feel distinctly un-AI
3. **The citations** — every claim is traceable. Judges can verify accuracy.
4. **The absence of component libraries** — every component is thoughtful, not imported
5. **The streaming UX** — tokens appear one by one, not all at once, which feels alive
6. **The source drawer** — showing the actual snippet builds trust instantly

When you record your demo, open with:
> *"MAI answers only from official Election Commission of India documents. Every citation links to the exact passage it came from. No hallucinations, no outside data."*

That sentence alone positions you above 90% of the field.

---

## What to Do Next

After ASK works end-to-end:
- Build **DO Mode** (FSM journeys) → reuses your Cloud Function patterns
- Build **LEARN Mode** (chapters + EVM simulator) → uses design system
- Add multilingual toggle (Translate API integration)
- Add audio playback (TTS integration)

You now have the foundation. Every other mode extends what you built here.

Good luck. Build fearlessly.
