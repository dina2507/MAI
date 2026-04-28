import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-2" });

async function main() {
  try {
    const result = await embedModel.embedContent({
        content: { role: "user", parts: [{ text: "Hello world" }] },
        outputDimensionality: 768
    });
    console.log("gemini-embedding-2 works!", result.embedding.values.length);
  } catch (e) {
    console.log("Failed", e.message);
  }
}

main();
