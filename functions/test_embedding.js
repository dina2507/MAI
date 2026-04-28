import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const embedModel2 = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const embedModel3 = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

async function main() {
  try {
    const result3 = await embedModel3.embedContent("Hello world");
    console.log("gemini-embedding-2 works!", result3.embedding.values.length);
  } catch (e) {
    console.log("Failed gemini-embedding-2", e.message);
  }
  try {
    const result = await embedModel.embedContent("Hello world");
    console.log("text-embedding-004 works!", result.embedding.values.length);
  } catch (e) {
    console.log("Failed text-embedding-004", e.message);
  }
  try {
    const result2 = await embedModel2.embedContent("Hello world");
    console.log("gemini-embedding-001 works!", result2.embedding.values.length);
  } catch (e) {
    console.log("Failed gemini-embedding-001", e.message);
  }
}

main();
