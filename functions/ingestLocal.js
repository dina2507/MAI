// ingestLocal.js
// Drop this file inside your functions/ folder
// Run: node ingestLocal.js
// This replaces PDF scraping — uses pre-built ECI knowledge base

import admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync(path.join(__dirname, "service-account.json"), "utf8"))
  ),
});

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
// Load all JSON corpus files from the eci-knowledge-base folder
const CORPUS_DIR = path.join(__dirname, "..", "data", "eci-knowledge-base");

async function embed(text) {
  const result = await embedModel.embedContent({
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: 768
  });
  return result.embedding.values;
}

async function ingestFile(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const { source, sourceUrl, category, chunks } = raw;

  console.log(`\n📄 ${source}`);
  console.log(`   Chunks: ${chunks.length}`);

  const batchSize = 5;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const embedded = await Promise.all(
      batch.map(async (chunk) => {
        const text = chunk.text;
        const embedding = await embed(text);
        return {
          text,
          heading: chunk.heading || "",
          source,
          sourceUrl,
          category,
          embedding,
        };
      })
    );

    const writeBatch = db.batch();
    embedded.forEach((chunk) => {
      const ref = db.collection("eci_chunks").doc();
      writeBatch.set(ref, {
        ...chunk,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await writeBatch.commit();

    console.log(`   ✓ ${Math.min(i + batchSize, chunks.length)}/${chunks.length} embedded`);
    await new Promise((r) => setTimeout(r, 800)); // rate limit buffer
  }
}

async function main() {
  console.log("🚀 MAI ECI Knowledge Base Ingestion\n");

  if (!fs.existsSync(CORPUS_DIR)) {
    console.error(`❌ Corpus directory not found: ${CORPUS_DIR}`);
    console.error("   Create the folder: data/eci-knowledge-base/");
    console.error("   and place all .json files from the eci-corpus download inside it.");
    process.exit(1);
  }

  const files = fs.readdirSync(CORPUS_DIR).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.error("❌ No JSON files found in corpus directory.");
    process.exit(1);
  }

  console.log(`Found ${files.length} corpus files:\n`);
  files.forEach((f) => console.log(`  - ${f}`));

  for (const file of files) {
    await ingestFile(path.join(CORPUS_DIR, file));
  }

  console.log("\n✅ Ingestion complete!");
  console.log("   Run: node verify.js to confirm chunks in Firestore.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
