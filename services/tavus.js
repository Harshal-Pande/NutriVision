import axios from "axios";

const BACKEND_BASE_URL = "https://nutrivision-cvm8.onrender.com"; // Backend URL for LLM and webhooks

// Tavus CVI API integration (loads API key from environment variable)
const TAVUS_API_KEY = "4936acadd8e94b459eb8e3ec80573497";

const TAVUS_BASE_URL = "https://tavusapi.com/v2"; // Correct Tavus API base URL

// Keep track of active conversations
let activeConversation = null;

const tavus = axios.create({
	baseURL: TAVUS_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		"x-api-key": TAVUS_API_KEY,
	},
	timeout: 10000,
	validateStatus: (status) => status < 500,
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
			system_prompt:
				"You are a friendly nutritionist providing health advice, recipes, and meal prep guidance.",
			persona_name: "NutritionistAI",
			context:
				"Use Gemini API for responses. Integrate with Google Maps, Calendar, and Search.",
			layers: {
				llm: {
					model: "gemini-1.5-flash",
					base_url: backendLLMUrl,
					api_key: "AIzaSyA2qukNrTJotAh30BPrVkBqtloRSZbKJcA",
				},
				tts: { tts_engine: "cartesia" },
				perception: { perception_model: "raven-0" },
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

// List all active conversations
export const listActiveConversations = async () => {
	try {
		const response = await tavus.get("/conversations?status=active");
		return response.data?.conversations || [];
	} catch (error) {
		console.error(
			"Error listing active conversations:",
			error.response?.data || error.message
		);
		return [];
	}
};

// End a specific conversation
export const endConversation = async (conversationId) => {
	try {
		await tavus.post(`/conversations/${conversationId}/end`);
	} catch (error) {
		// Ignore errors
	}
};

// End all active conversations
export const endAllConversations = async () => {
	const activeConvos = await listActiveConversations();
	await Promise.all(
		activeConvos.map((c) => endConversation(c.conversation_id))
	);
};

// Start a Tavus conversation with the Nutritionist persona
export const startNutritionistConversation = async (
	personaId,
	webhookUrl = BACKEND_BASE_URL + "/webhook"
) => {
	try {
		// End all active conversations before starting a new one
		await endAllConversations();
		const response = await tavus.post("/conversations", {
			persona_id: personaId,
			replica_id: "r9fa0878977a", // Use the free replica
			conversation_name: "Nutritionist Consult",
			callback_url: webhookUrl,
		});
		activeConversation = {
			id: response.data.conversation_id,
			url: response.data.conversation_url,
		};
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
		// Validate conversation exists and is active
		if (!activeConversation || activeConversation.id !== conversationId) {
			throw new Error("Invalid or inactive conversation");
		}

		const response = await tavus.post(
			`/conversations/${conversationId}/messages`,
			{
				type: "text",
				content: text,
				role: "user",
			}
		);

		return response.data;
	} catch (error) {
		if (error.code === "ECONNABORTED") {
			throw new Error(
				"Connection timeout while sending message. Please check your internet connection."
			);
		}
		console.error("Error sending echo:", error.response?.data || error.message);
		if (error.response?.status === 404) {
			activeConversation = null;
			throw new Error("Conversation not found or has ended");
		}
		throw error;
	}
};

// List all personas from Tavus
export const listPersonas = async () => {
	try {
		const response = await tavus.get("/personas");
		// Try both possible keys, fallback to []
		return response.data?.personas || response.data?.data || [];
	} catch (error) {
		if (error.code === "ECONNABORTED") {
			console.error(
				"Connection timeout while listing personas. Please check your internet connection."
			);
		} else {
			console.error(
				"Error listing personas:",
				error.response?.data || error.message
			);
		}
		return [];
	}
};

// Fetch the full conversation transcript (chat history) from Tavus
export const getConversationTranscript = async (conversationId) => {
	try {
		const response = await tavus.get(
			`/conversations/${conversationId}?verbose=true`
		);
		return response.data; // Contains transcript and other verbose info
	} catch (error) {
		console.error(
			"Error fetching conversation transcript:",
			error.response?.data || error.message
		);
		throw error;
	}
};
