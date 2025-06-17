import axios from "axios";

const BACKEND_CHAT_COMPLETIONS_URL =
	"https://nutrivision-cvm8.onrender.com/chat/completions";

// Generate Text using Gemini via backend
export const generateText = async (prompt) => {
	try {
		const response = await axios.post(BACKEND_CHAT_COMPLETIONS_URL, {
			messages: [{ role: "user", content: prompt }],
			model: "custom_model_here",
		});
		return response.data.choices[0].message.content;
	} catch (error) {
		console.error(
			"Error generating text via backend:",
			error.response?.data || error.message
		);
		throw error;
	}
};

// Function Calling (tools)
export const callFunction = async (prompt, functionDeclarations) => {
	try {
		const response = await axios.post(BACKEND_CHAT_COMPLETIONS_URL, {
			messages: [{ role: "user", content: prompt }],
			model: "custom_model_here",
			tools: functionDeclarations,
		});
		// Return the parts array (OpenAI-compatible)
		return response.data.choices[0].message.parts || [];
	} catch (error) {
		console.error(
			"Error calling function via backend:",
			error.response?.data || error.message
		);
		throw error;
	}
};
