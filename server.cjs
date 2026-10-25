require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

console.log("--- Starting AIVOA.AI RCA Backend ---");
console.log("Gemini key exists:", Boolean(process.env.GEMINI_API_KEY));

const ai = new GoogleGenAI({
apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
res.send("AIVOA.AI RCA Backend is running.");
});

app.post("/api/analyze", async (req, res) => {
try {
const { title, batchNumber, stage, description, evidence } = req.body;

console.log("Analysis request received:", title || "Untitled incident");

if (!process.env.GEMINI_API_KEY) {
  return res.status(500).json({
    error: "Gemini API key is missing. Check your .env file.",
  });
}

if (!description || !description.trim()) {
  return res.status(400).json({
    error: "Please provide an incident description.",
  });
}

const prompt = `

You are an AI assistant supporting pharmaceutical API quality professionals
with preliminary root cause investigations.

Analyze the incident information below.

INCIDENT INFORMATION:
Title: ${title || "Not provided"}
Batch Number: ${batchNumber || "Not provided"}
Manufacturing Stage: ${stage || "Not provided"}
Description: ${description}
Available Evidence: ${evidence || "No evidence provided"}

Return a valid JSON object with exactly these fields:
{
"summary": "A concise preliminary assessment",
"potentialCauses": [
{
"cause": "A possible cause, clearly identified as a hypothesis",
"reasoning": "Why this cause may be relevant to the incident",
"evidenceToCheck": "Specific records, tests, or observations to review",
"confidence": "Low, Medium, or High, with appropriate caution"
}
],
"evidenceGaps": ["Information that is missing and should be checked"],
"correctiveActions": ["Suggested actions to investigate or address the current issue"],
"preventiveActions": ["Suggested actions to reduce recurrence"]
}

Important rules:

- Return JSON only, with no Markdown fences.

- Never invent batch records, measurements, test results, or verified facts.

- Clearly distinguish supplied evidence from hypotheses and suggestions.

- If the information is insufficient, state that in the summary.

- Do not present a potential cause as confirmed without evidence.

- All recommendations require qualified human review.

- Do not make product release decisions.

- Keep recommendations relevant to pharmaceutical API manufacturing.
  `;
  
  // const response = await ai.models.generateContent({
  // model: "gemini-3.8-flash",
  // contents: prompt,
  // config: {
  // responseMimeType: "application/json",
  // },
  // });

  
  // const text = response.text;
  console.log("Sending request to Gemini...");



console.log("Gemini response received!");
let response;

for (let attempt = 1; attempt <= 3; attempt++) {
try {
console.log("Gemini request attempt ${attempt}...");

response = await ai.models.generateContent({
  model: "gemini-3.8-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
  },
});

break;

} catch (error) {
const isTemporary =
error.status === 503 ||
error.status === 429 ||
error.status === 500;

if (!isTemporary || attempt === 3) {
  throw error;
}

const waitTime = attempt * 3000;
console.log(`Gemini is busy. Retrying in ${waitTime / 1000} seconds...`);

await new Promise((resolve) => setTimeout(resolve, waitTime));

}
}

if (!response) {
throw new Error("Gemini could not provide a response. Please try again.");
}

console.log("Gemini response received!");
const text = response.text;
console.log("Gemini output:", text);
  
  if (!text) {
  throw new Error("Gemini returned an empty response.");
  }
  
  let analysis;
  
  try {
  analysis = JSON.parse(text);
  } catch {
  console.error("Gemini returned invalid JSON.");
  throw new Error("AI returned an unreadable result. Please try again.");
  }
  
  res.json(analysis);
  } catch (error) {
  console.error("GEMINI ERROR:", error.message);
  
  res.status(500).json({
  error: error.message || "Analysis failed. Please try again.",
  });
  }
  });

const server = app.listen(3001, () => {
console.log("AIVOA.AI RCA backend running on port 3001");
});

server.on("error", (error) => {
console.error("SERVER ERROR:", error.message);
});

process.on("unhandledRejection", (error) => {
console.error("Unhandled rejection:", error);
});