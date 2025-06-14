import axios from "axios";

// Tavus CVI API integration (loads API key from environment variable)
const TAVUS_API_KEY =
	process.env.TAVUS_API_KEY || "sk-demo-2b7e7b7b-2b7e-4b7b-8b7b-2b7e7b7b2b7e";

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

// Create a Nutritionist persona for the AI video interface
export const createNutritionistPersona = async (backendLLMUrl) => {
	try {
		const response = await tavus.post("/personas", {
			persona_name: "NutritionistAI",
			system_prompt:
				"You are a friendly, evidence-based nutritionist. Give practical, healthy advice and ask questions to personalize recommendations.",
			pipeline_mode: "full",
			context:
				"You help users with meal planning, healthy eating, and nutrition questions. You use up-to-date science and are supportive.",
			default_replica_id: "r79e1c033f", // Free stock replica
			layers: {
				llm: {
					model: "custom_model_here",
					base_url: backendLLMUrl, // e.g., https://your-backend-url/chat/completions
					speculative_inference: true,
				},
				tts: {
					tts_engine: "cartesia",
				},
				perception: {
					perception_model: "raven-0",
				},
				stt: {
					stt_engine: "tavus-turbo",
					participant_pause_sensitivity: "high",
					participant_interrupt_sensitivity: "high",
					smart_turn_detection: true,
				},
			},
		});
		return response.data; // { persona_id, ... }
	} catch (error) {
		console.error(
			"Error creating Nutritionist persona:",
			error.response?.data || error.message
		);
		throw error;
	}
};

// Start a Tavus conversation with the Nutritionist persona
export const startNutritionistConversation = async (personaId, webhookUrl) => {
	try {
		const response = await tavus.post("/conversations", {
			replica_id: "r79e1c033f", // Free stock replica
			persona_id: personaId,
			conversation_name: "Nutritionist Consult",
			callback_url: webhookUrl, // Your backend webhook endpoint
			conversational_context:
				"You are talking to a user who wants personalized nutrition advice.",
		});
		return response.data; // { conversation_id, conversation_url, ... }
	} catch (error) {
		console.error(
			"Error starting Nutritionist conversation:",
			error.response?.data || error.message
		);
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
