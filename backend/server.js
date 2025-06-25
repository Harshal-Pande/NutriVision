import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
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
let voiceAssistantHistory = [];

// Simple in-memory rate limiter (per IP, per minute)
const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 30;
const ipRequestCounts = {};

app.use((req, res, next) => {
	const ip = req.ip;
	const now = Date.now();
	if (!ipRequestCounts[ip]) ipRequestCounts[ip] = [];
	ipRequestCounts[ip] = ipRequestCounts[ip].filter(
		(ts) => now - ts < rateLimitWindowMs
	);
	if (ipRequestCounts[ip].length >= maxRequestsPerWindow) {
		return res
			.status(429)
			.json({ error: "Too many requests. Please try again later." });
	}
	ipRequestCounts[ip].push(now);
	next();
});

// Tavus API config
const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_BASE_URL = process.env.TAVUS_BASE_URL || "https://tavusapi.com/v2";
const tavus = axios.create({
	baseURL: TAVUS_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		"x-api-key": TAVUS_API_KEY,
	},
	timeout: 10000,
});

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
		const genAI = new GoogleGenerativeAI(
			"AIzaSyA2qukNrTJotAh30BPrVkBqtloRSZbKJcA"
		);
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

		// Use the official google-generativeai Python SDK via Node.js equivalent
		const genAI = new GoogleGenerativeAI(
			"AIzaSyA2qukNrTJotAh30BPrVkBqtloRSZbKJcA"
		);
		const geminiModel = genAI.getGenerativeModel({
			model: model || "gemini-1.5-flash",
		});
		let result;
		if (tools) {
			result = await geminiModel.generateContent(prompt);
		} else {
			result = await geminiModel.generateContent(prompt);
		}
		const response = {
			id: "chatcmpl-xxx",
			object: "chat.completion",
			created: Math.floor(Date.now() / 1000),
			model: model || "gemini-1.5-flash",
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

// List all Tavus conversations
app.get("/tavus/conversations", async (req, res) => {
	try {
		const response = await tavus.get("/conversations");
		res.json(response.data);
	} catch (err) {
		res
			.status(500)
			.json({ error: "Failed to list conversations", details: err.message });
	}
});

// End (delete) a Tavus conversation
app.delete("/tavus/conversations/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const response = await tavus.delete(`/conversations/${id}`);
		res.json(response.data);
	} catch (err) {
		res
			.status(500)
			.json({ error: "Failed to end conversation", details: err.message });
	}
});

// Start a new Tavus conversation after ending all previous ones
app.post("/tavus/conversations", async (req, res) => {
	try {
		// End all previous conversations
		const allConvos = await tavus.get("/conversations");
		const convos = allConvos.data?.conversations || allConvos.data?.data || [];
		for (const convo of convos) {
			const cid = convo.conversation_id || convo.id;
			if (cid) await tavus.delete(`/conversations/${cid}`);
		}
		// Start new conversation
		const { persona_id, webhook_url } = req.body;
		if (!persona_id)
			return res.status(400).json({ error: "persona_id required" });
		const response = await tavus.post("/conversations", {
			persona_id,
			replica_id: "r9fa0878977a",
			conversation_name: "Nutritionist Consult",
			callback_url: webhook_url,
		});
		res.json(response.data);
	} catch (err) {
		res
			.status(500)
			.json({ error: "Failed to start conversation", details: err.message });
	}
});

app.post("/voice-assistant/message", async (req, res) => {
	try {
		const { user, message } = req.body;
		if (!user || !message)
			return res.status(400).json({ error: "user and message required" });
		// Store user message
		voiceAssistantHistory.push({
			role: "user",
			user,
			text: message,
			timestamp: Date.now(),
		});
		// Call Gemini for AI response
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
		const result = await geminiModel.generateContent(message);
		const aiText = result.response.candidates[0].content.parts[0].text;
		// Call Google TTS for AI response audio
		const ttsResponse = await axios.post(
			"https://texttospeech.googleapis.com/v1/text:synthesize?key=" +
				process.env.GOOGLE_TTS_API_KEY,
			{
				input: { text: aiText },
				voice: { languageCode: "en-US", ssmlGender: "FEMALE" },
				audioConfig: { audioEncoding: "MP3" },
			}
		);
		const audioBase64 = ttsResponse.data.audioContent;
		// Store AI message
		voiceAssistantHistory.push({
			role: "ai",
			text: aiText,
			audio: audioBase64,
			timestamp: Date.now(),
		});
		res.json({ history: voiceAssistantHistory });
	} catch (err) {
		console.error("Error in /voice-assistant/message:", err);
		res
			.status(500)
			.json({ error: "Failed to process message", details: err.message });
	}
});

app.get("/voice-assistant/history", (req, res) => {
	res.json({ history: voiceAssistantHistory });
});

app.get("/tavus/conversation/:id/messages", async (req, res) => {
	try {
		const { id } = req.params;
		const response = await tavus.get(`/conversations/${id}?verbose=true`);
		// Try to return transcript/messages array
		const transcript =
			response.data.transcript ||
			response.data.messages ||
			response.data.data ||
			[];
		res.json({ transcript });
	} catch (err) {
		res
			.status(500)
			.json({ error: "Failed to fetch Tavus messages", details: err.message });
	}
});

app.post("/voice-assistant/transcribe", async (req, res) => {
	try {
		const { audioBase64 } = req.body;
		if (!audioBase64)
			return res.status(400).json({ error: "audioBase64 required" });
		// Google STT expects audio in base64 and config
		const sttRes = await axios.post(
			`https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_STT_API_KEY}`,
			{
				config: {
					encoding: "LINEAR16",
					sampleRateHertz: 16000,
					languageCode: "en-US",
				},
				audio: { content: audioBase64 },
			}
		);
		const transcription =
			sttRes.data.results?.map((r) => r.alternatives[0].transcript).join(" ") ||
			"";
		res.json({ transcription });
	} catch (err) {
		res
			.status(500)
			.json({ error: "Failed to transcribe audio", details: err.message });
	}
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
