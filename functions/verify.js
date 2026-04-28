// functions/verify.js
import admin from "firebase-admin";
import fs from "fs";

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync("./service-account.json", "utf8"))
  ),
});

const db = admin.firestore();

async function verify() {
  try {
    const snap = await db.collection("eci_chunks").count().get();
    console.log(`Total chunks: ${snap.data().count}`);

    const sample = await db.collection("eci_chunks").limit(1).get();
    if (!sample.empty) {
      const data = sample.docs[0].data();
      console.log("\n--- Sample Chunk ---");
      console.log(`Source: ${data.source}`);
      console.log(`Text preview: ${data.text.substring(0, 100)}...`);
      console.log(`Embedding dimensions: ${data.embedding ? data.embedding.length : "undefined"}`);
    }
  } catch (err) {
    console.error("Error fetching chunks:", err);
  }
}

verify();
