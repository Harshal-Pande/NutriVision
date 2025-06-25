import axios from "axios";

// NOTE: This file only calls the backend, not Google APIs directly.
// The Gemini API key should NOT be exposed in frontend code for security reasons.
// If you want to test direct calls (not recommended for production), you can add the key below.

const BACKEND_CHAT_COMPLETIONS_URL =
	"https://nutrivision-cvm8.onrender.com/chat/completions";

// Generate Text using Gemini via backend
export const generateText = async (prompt) => {
	try {
		const response = await axios.post(BACKEND_CHAT_COMPLETIONS_URL, {
			messages: [{ role: "user", content: prompt }],
			model: "gemini-1.5-flash",
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
			model: "gemini-1.5-flash",
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
