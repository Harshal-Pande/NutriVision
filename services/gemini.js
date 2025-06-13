import { VertexAI } from "@google-cloud/aiplatform";

const projectId = "YOUR_PROJECT_ID";
const location = "us-central1";
const model = "gemini-1.5-flash-001";

const vertexAI = new VertexAI({ project: projectId, location });
const generativeModel = vertexAI.getGenerativeModel({ model });

// Generate Text
export const generateText = async (prompt) => {
	try {
		const result = await generativeModel.generateContent(prompt);
		// Response: { response: { candidates: [ { content: { parts: [ { text: ... } ] } } ] } }
		return result.response.candidates[0].content.parts[0].text;
	} catch (error) {
		console.error("Error generating text:", error);
		throw error;
	}
};

// Function Calling
export const callFunction = async (prompt, functionDeclarations) => {
	try {
		const chat = generativeModel.startChat({ tools: functionDeclarations });
		const result = await chat.sendMessage(prompt);
		// Response: { response: { candidates: [ { content: { parts: [ { functionCall: { name, args } } ] } } ] } }
		return result.response.candidates[0].content.parts;
	} catch (error) {
		console.error("Error calling function:", error);
		throw error;
	}
};
