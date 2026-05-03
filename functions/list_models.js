import "dotenv/config";

async function main() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  const models = data.models.filter(m => m.name.includes("embed"));
  console.log(models.map(m => m.name));
}

main();
