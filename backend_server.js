import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
// Allow requests from the local React frontend
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());

// Initialize the AI client using the new SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The exact system prompt to translate gestures
const SYSTEM_PROMPT = `
You are an expert linguistic translation agent. Ingest a chronological stream of raw sign language gesture tokens and translate them into a single, grammatically correct, and natural-sounding English sentence.
Rules:
1. Syntactic Reordering: Reorder Object-Subject-Verb to standard Subject-Verb-Object.
2. Grammar Interpolation: Infer and insert missing articles, prepositions, and conjugations.
3. Noise Reduction: Ignore consecutive duplicate tokens.
4. Intent Classification: Classify intent as COMMAND, QUESTION, or STATEMENT.
`;

// Define the exact JSON schema to guarantee proper n8n routing
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        original_tokens: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        translated_text: { type: Type.STRING },
        intent: {
            type: Type.STRING,
            enum: ["COMMAND", "QUESTION", "STATEMENT"]
        }
    },
    required: ["original_tokens", "translated_text", "intent"]
};

// Main Webhook Endpoint (Mimics the n8n Webhook Node)
app.post('/webhook/gestures', async (req, res) => {
    try {
        const { tokens } = req.body;

        if (!tokens || !Array.isArray(tokens)) {
            return res.status(400).json({ error: "Invalid payload. Provide an array of tokens." });
        }

        console.log(`\n[Webhook] Received tokens: ${tokens.join(', ')}`);

        // Mimic the n8n LLM Node
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: JSON.stringify(tokens),
            config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.1, // Low temperature for deterministic output
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        // Parse the LLM's text string into a JSON object
        const parsedResult = JSON.parse(response.text());
        console.log(`[LLM Output] Intent: ${parsedResult.intent} | Translation: "${parsedResult.translated_text}"`);

        // Mimic the n8n Switch/Routing Node
        let routingStatus = "";
        switch (parsedResult.intent) {
            case 'COMMAND':
                routingStatus = "POST /api/smarthome/execute success";
                break;
            case 'QUESTION':
                routingStatus = "POST /api/tts/speak success";
                break;
            case 'STATEMENT':
                routingStatus = "PUT /api/logs/save success";
                break;
            default:
                routingStatus = "UNKNOWN INTENT - Fallback route triggered";
        }

        console.log(`[Router] ${routingStatus}`);

        // Return the final data back to the frontend
        res.status(200).json({
            ...parsedResult,
            backend_route_status: routingStatus
        });

    } catch (error) {
        console.error("[Error] Pipeline failed:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Agentic Backend running on http://localhost:${PORT}`);
    console.log(`Waiting for gestures at POST /webhook/gestures`);
});