import axios from "axios";

const BACKEND_BASE_URL = "https://nutrivision-cvm8.onrender.com"; // Backend URL for LLM and webhooks

// Tavus CVI API integration (loads API key from environment variable)
const TAVUS_API_KEY = "8afeb2823a894ae9aad50cc90fa41149";

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
export const createNutritionistPersona = async (
	backendLLMUrl = BACKEND_BASE_URL + "/chat/completions"
) => {
	try {
		const response = await tavus.post("/personas", {
			persona_name: "NutritionistAI",
			default_replica_id: "r79e1c033f",
			system_prompt:
				"You are a friendly, evidence-based nutritionist. Give practical, healthy advice and ask questions to personalize recommendations.",
			context:
				"You help users with meal planning, healthy eating, and nutrition questions. You use up-to-date science and are supportive.",
			layers: {
				llm: {
					model: "gemini-1.5-flash-001",
					base_url: backendLLMUrl,
					api_key: "AIzaSyA2qukNrTJotAh30BPrVkBqtloRSZbKJcA",
					speculative_inference: true,
				},
				perception: {
					perception_model: "raven-0",
					ambient_awareness_queries: [
						"Is the user showing an ID card?",
						"Does the user appear distressed or uncomfortable?",
					],
					perception_tool_prompt:
						"You have a tool to notify the system when a bright outfit is detected, named `notify_if_bright_outfit_shown`. You MUST use this tool when a bright outfit is detected.",
					perception_tools: [
						{
							type: "function",
							function: {
								name: "notify_if_bright_outfit_shown",
								description:
									"Use this function when a bright outfit is detected in the image with high confidence",
								parameters: {
									type: "object",
									properties: {
										outfit_color: {
											type: "string",
											description: "Best guess on what color of outfit it is",
										},
									},
									required: ["outfit_color"],
								},
							},
						},
					],
				},
				tts: {
					tts_engine: "cartesia",
				},
				stt: {
					stt_engine: "tavus-advanced",
					smart_turn_detection: true,
					participant_pause_sensitivity: "high",
					participant_interrupt_sensitivity: "high",
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
export const startNutritionistConversation = async (
	personaId,
	webhookUrl = BACKEND_BASE_URL + "/webhook"
) => {
	try {
		const response = await tavus.post("/conversations", {
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

// List all personas from Tavus
export const listPersonas = async () => {
	try {
		const response = await tavus.get("/personas");
		return response.data.data; // Array of persona objects
	} catch (error) {
		console.error(
			"Error listing personas:",
			error.response?.data || error.message
		);
		throw error;
	}
};
