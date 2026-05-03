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
    file: "../data/eci-pdfs/voter-guide.pdf",
    url: "https://eci.gov.in/voter-guide",
  },
  {
    file: "../data/eci-pdfs/form-6.pdf",
    url: "https://eci.gov.in/files/forms/form-6",
  },
  {
    file: "../data/eci-pdfs/form-8.pdf",
    url: "https://eci.gov.in/files/forms/form-8",
  },
  {
    file: "../data/eci-pdfs/evm-manual.pdf",
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
