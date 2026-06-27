import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const hasKey = Boolean(apiKey && apiKey !== "your_key_here");

const ai = hasKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Call Gemini with structured JSON output.
 * @param {object} opts
 * @param {string} opts.system - system instruction
 * @param {Array} opts.parts   - content parts (text and/or inlineData images)
 * @param {object} opts.schema - responseSchema
 * @returns {Promise<object>} parsed JSON
 */
export async function generateJSON({ system, parts, schema }) {
  if (!ai) throw new Error("NO_API_KEY");

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  });

  const text = response.text;
  if (!text) throw new Error("EMPTY_RESPONSE");

  try {
    return JSON.parse(text);
  } catch {
    // Best-effort: pull the first {...} block out
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("BAD_JSON");
  }
}

export const modelName = MODEL;
