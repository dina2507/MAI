import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function main() {
  try {
    const result = await embedModel.embedContent("Hello world");
    console.log("text-embedding-004 works!", result.embedding.values.length);
  } catch (e) {
    console.log("Failed text-embedding-004", e.message);
  }
}

main();
