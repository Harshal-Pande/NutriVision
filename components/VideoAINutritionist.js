import * as DailyIframe from "@daily-co/daily-js";
import axios from "axios";
import { Camera } from "expo-camera";
import * as Linking from "expo-linking";
import React, { useEffect, useRef, useState } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
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
	const [hasCameraPermission, setHasCameraPermission] = useState(null);
	const [hasAudioPermission, setHasAudioPermission] = useState(null);
	const [permissionError, setPermissionError] = useState(null);

	// Request permissions on mount
	useEffect(() => {
		const requestPermissions = async () => {
			try {
				const { status: cameraStatus } =
					await Camera.requestCameraPermissionsAsync();
				const { status: audioStatus } =
					await Camera.requestMicrophonePermissionsAsync();
				setHasCameraPermission(cameraStatus === "granted");
				setHasAudioPermission(audioStatus === "granted");
				if (cameraStatus !== "granted" || audioStatus !== "granted") {
					setPermissionError(
						"Camera and microphone permissions are required for video calls."
					);
				}
			} catch (err) {
				setPermissionError("Failed to request camera/microphone permissions.");
			}
		};
		requestPermissions();
	}, []);

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
				let conversation_url, conversation_id;
				try {
					const convo = await startNutritionistConversation(
						currentPersonaId,
						WEBHOOK_URL
					);
					conversation_url = convo.conversation_url;
					conversation_id = convo.conversation_id;
					setConversationUrl(conversation_url);
					setConversationId(conversation_id);
					console.log(
						"Started Tavus conversation:",
						conversation_id,
						conversation_url
					);
				} catch (err) {
					console.error("Error starting Tavus conversation:", err);
					// Enhanced error handling for Tavus conversation limits
					if (
						err?.response?.data?.message?.includes(
							"maximum concurrent conversations"
						)
					) {
						setError(
							"You have reached the maximum number of Tavus video sessions allowed. Please end previous sessions or try again later."
						);
					} else {
						setError(
							"Failed to start Tavus conversation: " + (err.message || err)
						);
					}
					return;
				}

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
						// Only send echo if conversation_id is valid and no error
						if (!conversation_id || error) {
							console.warn(
								"No valid conversation_id or error present, not sending echo!"
							);
							return;
						}
						try {
							await sendEcho(conversation_id, response);
						} catch (err) {
							console.error(
								"Error sending echo:",
								err,
								"conversation_id:",
								conversation_id,
								"response:",
								response
							);
						}
					}
				};

				// Initial greeting
				if (!error) handleVoiceInput("Greet the user as a nutritionist.");

				return () => clearInterval(interval);
			} catch (err) {
				setError("Failed to start video call: " + err.message);
			}
		};

		// Only start Tavus conversation if permissions are granted
		if (hasCameraPermission && hasAudioPermission) {
			initVideoCall();
		} else if (hasCameraPermission === false || hasAudioPermission === false) {
			setError(
				"Camera and microphone permissions are required to start the video call."
			);
		}

		return () => {
			if (callRef.current && Platform.OS === "web") {
				callRef.current.leave();
				callRef.current.destroy();
			}
		};
	}, [hasCameraPermission, hasAudioPermission, isTextMode, personaId]);

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
			// Only send echo if conversationId is valid and no error
			if (!conversationId || error) {
				console.warn(
					"No valid conversationId or error present, not sending echo!"
				);
				return;
			}
			try {
				await sendEcho(conversationId, response);
			} catch (err) {
				console.error(
					"Error sending echo:",
					err,
					"conversationId:",
					conversationId,
					"response:",
					response
				);
			}
		}
	};

	if (permissionError) {
		return (
			<View style={styles.container}>
				<Text style={styles.error}>{permissionError}</Text>
				<Button title="Open Settings" onPress={() => Linking.openSettings()} />
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{error && <Text style={styles.error}>{error}</Text>}
			{/* Video Call Section */}
			{!isTextMode &&
				(Platform.OS === "web" ? (
					<View
						ref={containerRef}
						style={styles.videoContainer}
						{...(Platform.OS !== "web" ? { nativeID: "video-container" } : {})}
					/>
				) : conversationUrl ? (
					<WebView
						source={{ uri: conversationUrl }}
						style={styles.videoContainer}
						allowsInlineMediaPlayback
						mediaPlaybackRequiresUserAction={false}
					/>
				) : (
					<Text style={styles.noVideo}>Video call not available.</Text>
				))}
			{isTextMode && (
				<View>
					<Text style={styles.response}>{responseText}</Text>
				</View>
			)}

			{/* Chat History Section */}
			<View style={styles.chatHistoryContainer}>
				<Text style={styles.chatHistoryTitle}>Chat History</Text>
				{Array.isArray(transcript) && transcript.length > 0 ? (
					transcript.map((msg, idx) => (
						<View key={idx} style={styles.chatMessage}>
							<Text style={styles.chatRole}>{msg.role}:</Text>
							<Text style={styles.chatContent}>{msg.content}</Text>
						</View>
					))
				) : (
					<Text style={styles.noChat}>No chat history yet.</Text>
				)}
			</View>

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
	chatHistoryContainer: {
		marginTop: 24,
		backgroundColor: "#f5f5f5",
		borderRadius: 8,
		padding: 12,
	},
	chatHistoryTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
	chatMessage: { flexDirection: "row", marginBottom: 6 },
	chatRole: { fontWeight: "bold", marginRight: 6 },
	chatContent: { flex: 1, flexWrap: "wrap" },
	noChat: { color: "#888", fontStyle: "italic" },
	noVideo: {
		color: "#888",
		fontStyle: "italic",
		textAlign: "center",
		marginVertical: 20,
	},
});

export default VideoAINutritionist;
