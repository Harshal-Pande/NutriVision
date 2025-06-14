import * as DailyIframe from "@daily-co/daily-js";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";
import { callFunction, generateText } from "../services/gemini";
import {
	createNutritionistPersona,
	sendEcho,
	startNutritionistConversation,
} from "../services/tavus";
import {
	getBatteryLevel,
	scheduleReminder,
	setScreenBrightness,
} from "../utils/mobileEvents";

// Function calling declarations for Gemini
const functionDeclarations = [
	{
		function_declarations: [
			{
				name: "getBatteryLevel",
				description: "Gets the device battery level as a percentage.",
				parameters: { type: "object", properties: {} },
			},
			{
				name: "setScreenBrightness",
				description: "Sets the screen brightness (0 to 1).",
				parameters: {
					type: "object",
					properties: {
						brightness: { type: "number", minimum: 0, maximum: 1 },
					},
					required: ["brightness"],
				},
			},
			{
				name: "scheduleReminder",
				description: "Schedules a reminder notification.",
				parameters: {
					type: "object",
					properties: {
						message: { type: "string" },
						seconds: { type: "number" },
					},
					required: ["message", "seconds"],
				},
			},
			{
				name: "findStore",
				description: "Finds nearby health food stores using Google Maps.",
				parameters: {
					type: "object",
					properties: { query: { type: "string" } },
					required: ["query"],
				},
			},
		],
	},
];

// Render Backend URL (replace with your actual Render URL)
const RENDER_BACKEND_URL = "https://nutrivision-cvm8.onrender.com";

const WEBHOOK_URL = `${RENDER_BACKEND_URL}/webhook`;
const CALLBACKS_URL = `${RENDER_BACKEND_URL}/callbacks`;

const VideoAINutritionist = () => {
	const callRef = useRef(null);
	const containerRef = useRef(null);
	const [conversationUrl, setConversationUrl] = useState(null);
	const [conversationId, setConversationId] = useState(null);
	const [isTextMode, setIsTextMode] = useState(false);
	const [responseText, setResponseText] = useState("");
	const [transcript, setTranscript] = useState([]);
	const [error, setError] = useState(null);
	const [personaId, setPersonaId] = useState(null);

	useEffect(() => {
		const initVideoCall = async () => {
			try {
				// Create Tavus persona with Gemini integration if not already created
				let currentPersonaId = personaId;
				if (!currentPersonaId) {
					const personaData = await createNutritionistPersona(
						RENDER_BACKEND_URL + "/chat/completions"
					);
					currentPersonaId = personaData.persona_id;
					setPersonaId(currentPersonaId);
					console.log(
						"Nutritionist Persona Created/Retrieved:",
						currentPersonaId
					);
				}

				// Start Tavus conversation with webhook
				const { conversation_url, conversation_id } =
					await startNutritionistConversation(currentPersonaId, WEBHOOK_URL);
				setConversationUrl(conversation_url);
				setConversationId(conversation_id);

				// Initialize Daily WebRTC frame (web only)
				if (Platform.OS === "web") {
					callRef.current = DailyIframe.createFrame({
						iframeStyle: { width: "100%", height: 500, border: "0" },
					});
					if (containerRef.current) {
						containerRef.current.appendChild(callRef.current.iframe());
					}
					callRef.current.join({ url: conversation_url });
				}

				// Poll webhook endpoint for callbacks (transcripts, etc.)
				const pollCallbacks = async () => {
					try {
						const response = await axios.get(CALLBACKS_URL);
						if (response.data && response.data.length > 0) {
							// Find the latest transcript
							const lastTranscript = response.data
								.map((cb) => cb.transcript || cb)
								.filter(Boolean)
								.pop();
							if (lastTranscript) setTranscript(lastTranscript);
						}
					} catch (err) {
						// Ignore polling errors
					}
				};
				const interval = setInterval(pollCallbacks, 5000);

				// Process voice input (simulated; Tavus Sparrow-0 handles speech-to-text)
				const handleVoiceInput = async (inputText) => {
					const response = await processInput(inputText);
					setResponseText(response);
					if (!isTextMode) {
						await sendEcho(conversation_id, response);
					}
				};

				// Initial greeting
				handleVoiceInput("Greet the user as a nutritionist.");

				return () => clearInterval(interval);
			} catch (err) {
				setError("Failed to start video call: " + err.message);
			}
		};

		initVideoCall();

		return () => {
			if (callRef.current && Platform.OS === "web") {
				callRef.current.leave();
				callRef.current.destroy();
			}
		};
	}, [isTextMode, personaId]);

	// Handles Gemini function calling and text generation
	const processInput = async (input) => {
		try {
			const parts = await callFunction(input, functionDeclarations);
			for (const part of parts) {
				if (part.functionCall) {
					const { name, args } = part.functionCall;
					switch (name) {
						case "getBatteryLevel":
							const level = await getBatteryLevel();
							return `Battery level is ${level}%.`;
						case "setScreenBrightness":
							await setScreenBrightness(args.brightness);
							return `Screen brightness set to ${args.brightness * 100}%.`;
						case "scheduleReminder":
							await scheduleReminder(args.message, args.seconds);
							return `Reminder scheduled: ${args.message} in ${args.seconds} seconds.`;
						case "findStore":
							// Placeholder for Google Maps API (implement in googleMaps.js)
							return `Searching for ${args.query}... (Maps integration pending)`;
						default:
							return "Unknown function.";
					}
				} else {
					return await generateText(input);
				}
			}
			return "No response generated.";
		} catch (err) {
			return "Error processing input: " + err.message;
		}
	};

	// Simulate voice input (replace with actual Tavus Sparrow-0 input in production)
	const handleVoiceInput = async () => {
		const input = "Generate a low-carb vegan recipe.";
		const response = await processInput(input);
		setResponseText(response);
		if (!isTextMode) {
			await sendEcho(conversationId, response);
		}
	};

	return (
		<View style={styles.container}>
			{error && <Text style={styles.error}>{error}</Text>}
			{!isTextMode && (
				<View
					ref={containerRef}
					style={styles.videoContainer}
					{...(Platform.OS !== "web" ? { nativeID: "video-container" } : {})}
				/>
			)}
			{isTextMode && (
				<View>
					<Text style={styles.response}>{responseText}</Text>
					<Text style={styles.transcript}>
						Transcript: {JSON.stringify(transcript, null, 2)}
					</Text>
				</View>
			)}
			<Button
				title={isTextMode ? "Switch to Video" : "Switch to Text"}
				onPress={() => setIsTextMode(!isTextMode)}
			/>
			<Button title="Test Voice Input" onPress={handleVoiceInput} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	videoContainer: { width: "100%", height: 500, marginBottom: 16 },
	response: { fontSize: 16, marginVertical: 10 },
	transcript: { fontSize: 14, color: "#666" },
	error: { color: "red", marginBottom: 10 },
});

export default VideoAINutritionist;
