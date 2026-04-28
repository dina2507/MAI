import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "embedding-001" });

async function main() {
  try {
    const result = await embedModel.embedContent("Hello world");
    console.log("embedding-001 works!", result.embedding.values.length);
  } catch (e) {
    console.log("Failed embedding-001", e.message);
  }
}

main();
