import { GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

let callbacks = [];

// 1. Tavus webhook endpoint
app.post("/webhook", (req, res) => {
	try {
		callbacks.push(req.body);
		// Optionally, limit array size or persist to DB
		res.status(200).send("Callback received");
	} catch (err) {
		console.error("Error in /webhook:", err);
		res
			.status(500)
			.json({ error: "Failed to process webhook", details: err.message });
	}
});

// 2. Endpoint for frontend to poll callback data
app.get("/callbacks", (req, res) => {
	try {
		res.json(callbacks);
	} catch (err) {
		console.error("Error in /callbacks:", err);
		res
			.status(500)
			.json({ error: "Failed to fetch callbacks", details: err.message });
	}
});

// 3. List available Gemini models
app.get("/models", async (req, res) => {
	try {
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		const models = await genAI.listModels();
		res.json(models);
	} catch (err) {
		console.error("Error in /models:", err);
		res
			.status(500)
			.json({ error: "Failed to list models", details: err.message });
	}
});

// 4. OpenAI-compatible chat completions endpoint for Tavus
app.post("/chat/completions", async (req, res) => {
	try {
		const { messages, model, stream, tools, api_key, base_url, ...rest } =
			req.body;
		if (!messages || !Array.isArray(messages)) {
			return res
				.status(400)
				.json({ error: "Invalid request: messages array required" });
		}
		const prompt = messages.map((m) => m.content).join("\n");
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		const geminiModel = genAI.getGenerativeModel({
			model: model || "gemini-1.5-flash-001",
		});
		// If tools/function calling is present, handle accordingly (future extensibility)
		let result;
		if (tools) {
			// For now, just generate content as usual; add function calling logic if needed
			result = await geminiModel.generateContent(prompt);
		} else {
			result = await geminiModel.generateContent(prompt);
		}
		const response = {
			id: "chatcmpl-xxx",
			object: "chat.completion",
			created: Math.floor(Date.now() / 1000),
			model: model || "gemini-1.5-flash-001",
			choices: [
				{
					index: 0,
					message: {
						role: "assistant",
						content: result.response.candidates[0].content.parts[0].text,
					},
					finish_reason: "stop",
				},
			],
		};
		res.json(response);
	} catch (err) {
		console.error("Error in /chat/completions:", err);
		res
			.status(500)
			.json({ error: "Failed to generate completion", details: err.message });
	}
});

// Health check endpoint for Render
app.get("/", (req, res) => {
	res.send("NutriVision backend is running.");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
