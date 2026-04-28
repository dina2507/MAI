import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  // We can try a REST call to list models if SDK doesn't expose it easily.
  // Wait, let's just do a simple fetch to https://generativelanguage.googleapis.com/v1beta/models?key=...
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  const models = data.models.filter(m => m.name.includes("embed"));
  console.log(models.map(m => m.name));
}

main();
