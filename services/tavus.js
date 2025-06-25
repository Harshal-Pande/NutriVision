import axios from "axios";

const BACKEND_BASE_URL = "https://nutrivision-cvm8.onrender.com"; // Backend URL for LLM and webhooks

// Tavus CVI API integration (loads API key from environment variable)
const TAVUS_API_KEY = "cb58eaf0fde84b718d04f0f2828f2e7e";

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
export const createNutritionistPersona = async () => {
	try {
		const response = await tavus.post("/personas", {
			system_prompt:
				"You are a friendly nutritionist providing health advice, recipes, and meal prep guidance.",
			persona_name: "NutritionistAI",
			context:
				"Use Tavus inbuilt LLM for responses. Integrate with Google Maps, Calendar, and Search.",
			layers: {
				// No llm layer means Tavus will use its own LLM
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

// Start a Tavus conversation with the Nutritionist persona
export const startNutritionistConversation = async (
	personaId,
	webhookUrl = BACKEND_BASE_URL + "/webhook"
) => {
	try {
		const response = await tavus.post("/conversations", {
			persona_id: personaId,
			replica_id: "r9fa0878977a",
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
		console.log(
			`[tavus.js] sendEcho: Sending to conversationId=${conversationId}, text=`,
			text
		);
		const response = await tavus.post(
			`/conversations/${conversationId}/messages`,
			{
				type: "text",
				content: text,
				role: "user",
			}
		);
		console.log(
			`[tavus.js] sendEcho: Response status=${response.status}, data=`,
			response.data
		);
		if (response.status !== 200 && response.status !== 201) {
			console.error(
				`[tavus.js] sendEcho: Unexpected status code:`,
				response.status,
				response.data
			);
			throw new Error(`Echo not accepted by Tavus: ${response.status}`);
		}
		if (response.data && response.data.error) {
			console.error(
				`[tavus.js] sendEcho: Error in response:`,
				response.data.error
			);
			throw new Error(`Echo error: ${response.data.error}`);
		}
		return response.data;
	} catch (error) {
		console.error(`[tavus.js] sendEcho: Error sending echo:`, error);
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

// End (delete) a Tavus conversation
export const endConversation = async (conversationId) => {
	try {
		const response = await tavus.delete(`/conversations/${conversationId}`);
		if (activeConversation && activeConversation.id === conversationId) {
			activeConversation = null;
		}
		return response.data;
	} catch (error) {
		console.error(
			"Error ending conversation:",
			error.response?.data || error.message
		);
		throw error;
	}
};

// List all conversations from Tavus
export const listConversations = async () => {
	try {
		const response = await tavus.get("/conversations");
		// Try both possible keys, fallback to []
		return response.data?.conversations || response.data?.data || [];
	} catch (error) {
		console.error(
			"Error listing conversations:",
			error.response?.data || error.message
		);
		return [];
	}
};
