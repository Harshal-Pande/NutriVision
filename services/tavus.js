import axios from "axios";

// Tavus CVI API integration (placeholder)
// Replace 'YOUR_TAVUS_API_KEY' with your actual Tavus API key
const TAVUS_API_KEY = "YOUR_TAVUS_API_KEY";

const TAVUS_BASE_URL = "https://tavusapi.com/v2";

const tavus = axios.create({
	baseURL: TAVUS_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		"x-api-key": TAVUS_API_KEY,
	},
});

export const getTavusVideoUrl = async (sessionId) => {
	// TODO: Implement Tavus CVI video session fetch
	return `https://cvi.tavus.io/session/${sessionId}`;
};

// Create a Tavus persona for the AI nutritionist
export const createPersona = async () => {
	try {
		const response = await tavus.post("/personas", {
			system_prompt:
				"You are a friendly nutritionist providing evidence-based health advice, cross-cultural recipes, and meal prep guidance.",
			persona_name: "NutritionistAI",
			context:
				"Use Gemini API for responses. Integrate with Google Maps, Calendar, and Expo APIs for dynamic tasks.",
			layers: {
				llm: {
					model: "custom_model",
					base_url:
						"https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/gemini-1.5-flash-001",
					api_key: "YOUR_GOOGLE_CLOUD_KEY", // Handled by Google Cloud ADC
				},
				tts: { tts_engine: "cartesia" },
				perception: { perception_model: "raven-0" },
			},
		});
		return response.data.persona_id;
	} catch (error) {
		console.error("Error creating persona:", error);
		throw error;
	}
};

// Start a Tavus conversation with webhook callback
export const startConversation = async (personaId, webhookUrl) => {
	try {
		const response = await tavus.post("/conversations", {
			replica_id: "STOCK_REPLICA_ID", // Get from Tavus Developer Portal
			persona_id: personaId,
			conversation_name: "NutritionConsult",
			callback_url: webhookUrl, // Webhook for callbacks
		});
		return {
			url: response.data.conversation_url,
			id: response.data.conversation_id,
		};
	} catch (error) {
		console.error("Error starting conversation:", error);
		throw error;
	}
};

// Send a text echo to the Tavus conversation
export const sendEcho = async (conversationId, text) => {
	try {
		await tavus.post("/interactions", {
			message_type: "conversation",
			event_type: "conversation.echo",
			conversation_id: conversationId,
			properties: {
				modality: "text",
				text,
			},
		});
	} catch (error) {
		console.error("Error sending echo:", error);
		throw error;
	}
};
