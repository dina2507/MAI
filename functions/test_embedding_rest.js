import "dotenv/config";

async function main() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        model: "models/gemini-embedding-2",
        content: {
            parts: [{text: "Hello"}]
        },
        outputDimensionality: 768
    })
  });
  const data = await response.json();
  console.log(data.embedding ? data.embedding.values.length : data);
}

main();
