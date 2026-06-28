import "dotenv/config";
import { app } from "./app.js";
import { hasKey, modelName } from "./gemini.js";

// Local dev server. On Vercel the app is used via api/index.js (serverless).
const PORT = process.env.PORT || 8787;

app.listen(PORT, () => {
  console.log(`\n  ⚡ Saarthi API on http://localhost:${PORT}`);
  console.log(`  ${hasKey ? `🟢 Live Gemini (${modelName})` : "🟡 Mock mode — set GEMINI_API_KEY in .env for real AI"}\n`);
});
