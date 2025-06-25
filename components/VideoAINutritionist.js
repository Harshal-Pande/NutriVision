import axios from "axios";
import { Audio } from "expo-av";
import { Camera } from "expo-camera";
import * as Linking from "expo-linking";
import React, { useEffect, useRef, useState } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import {
	createNutritionistPersona,
	endConversation,
	listConversations,
	sendEcho,
	startNutritionistConversation,
} from "../services/tavus";

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
	const [endSessionMessage, setEndSessionMessage] = useState("");
	const [isStartingConversation, setIsStartingConversation] = useState(false);
	const [callbackEvents, setCallbackEvents] = useState([]);
	const [webViewError, setWebViewError] = useState(null);

	// Log when component unmounts
	useEffect(() => {
		return () => {
			console.log("[VideoAINutritionist] Component unmounted");
		};
	}, []);

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
			if (isStartingConversation) return;
			setIsStartingConversation(true);
			try {
				console.log(
					"[VideoAINutritionist] Starting cleanup of previous conversations..."
				);
				// Always end all previous conversations before starting a new one
				setEndSessionMessage("Cleaning up previous sessions. Please wait...");
				try {
					const allConvos = await listConversations();
					console.log(
						"[VideoAINutritionist] Conversations to end:",
						allConvos.map((c) => c.conversation_id || c.id)
					);
					for (const convo of allConvos) {
						if (convo.conversation_id || convo.id) {
							await endConversation(convo.conversation_id || convo.id);
							console.log(
								`[VideoAINutritionist] Ended conversation: ${
									convo.conversation_id || convo.id
								}`
							);
						}
					}
					setEndSessionMessage("");
				} catch (cleanupErr) {
					console.error("[VideoAINutritionist] Cleanup error:", cleanupErr);
					setEndSessionMessage(
						"Could not clean up previous sessions: " +
							(cleanupErr.message || cleanupErr)
					);
					setIsStartingConversation(false);
					return;
				}
				// Create Tavus persona with Gemini integration if not already created
				let currentPersonaId = personaId;
				if (!currentPersonaId) {
					const personaData = await createNutritionistPersona(
						RENDER_BACKEND_URL + "/chat/completions"
					);
					currentPersonaId =
						personaData.persona_id || personaData.id || personaData._id;
					setPersonaId(currentPersonaId);
					console.log(
						"[VideoAINutritionist] Created persona:",
						currentPersonaId
					);
				}
				// Start Tavus conversation with webhook
				let conversation_url, conversation_id;
				try {
					console.log(
						"[VideoAINutritionist] Starting new conversation for persona:",
						currentPersonaId
					);
					const convo = await startNutritionistConversation(
						currentPersonaId,
						WEBHOOK_URL
					);
					conversation_url = convo.conversation_url || convo.url;
					conversation_id = convo.conversation_id || convo.id;
					setConversationUrl(conversation_url);
					setConversationId(conversation_id);
					console.log(
						"[VideoAINutritionist] Started conversation:",
						conversation_id,
						conversation_url
					);
				} catch (err) {
					console.error(
						"[VideoAINutritionist] Error starting conversation:",
						err
					);
					setError(
						"Failed to start Tavus conversation: " + (err.message || err)
					);
					setIsStartingConversation(false);
					return;
				}
				// Poll webhook endpoint for callbacks (transcripts, etc.)
				const pollCallbacks = async () => {
					try {
						const response = await axios.get(CALLBACKS_URL);
						if (response.data && response.data.length > 0) {
							setCallbackEvents(response.data);
							// Find the latest transcript
							const lastTranscript = response.data
								.map((cb) => cb.transcript || cb)
								.filter(Boolean)
								.pop();
							if (lastTranscript) setTranscript(lastTranscript);
							// Log and highlight Tavus events
							response.data.forEach((event) => {
								if (event.event_type === "conversation.utterance") {
									console.log("[Tavus Event] Utterance:", event);
								} else if (event.event_type === "conversation.echo") {
									console.log("[Tavus Event] Echo:", event);
									if (event.properties && event.properties.audio) {
										console.log("[Tavus Event] Echo has audio (base64)");
									}
								} else if (event.event_type === "conversation.respond") {
									console.log("[Tavus Event] Respond:", event);
								}
							});
						}
					} catch (err) {
						// Ignore polling errors
					}
				};
				const interval = setInterval(pollCallbacks, 5000);
				setIsStartingConversation(false);
				return () => clearInterval(interval);
			} catch (err) {
				console.error(
					"[VideoAINutritionist] Fatal error in initVideoCall:",
					err
				);
				setError("Failed to start video call: " + err.message);
				setIsStartingConversation(false);
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

	// Simulate voice input (replace with actual Tavus Sparrow-0 input in production)
	const handleVoiceInput = async () => {
		if (!conversationId) {
			setResponseText("No active conversation. Please start a session.");
			console.warn(
				"[VideoAINutritionist] No active conversationId when trying to send echo."
			);
			return;
		}
		const input = "Hello";
		setResponseText(input);
		if (!isTextMode) {
			try {
				console.log(
					"[VideoAINutritionist] Sending echo. conversationId:",
					conversationId,
					"input:",
					input
				);
				await sendEcho(conversationId, input);
				console.log("[VideoAINutritionist] Echo sent successfully.");
			} catch (err) {
				console.error(
					"[VideoAINutritionist] Error sending echo:",
					err,
					"conversationId:",
					conversationId,
					"input:",
					input
				);
			}
		}
	};

	const handleEndConversation = async () => {
		if (!conversationId) return;
		try {
			await endConversation(conversationId);
			setConversationId(null);
			setConversationUrl(null);
			setEndSessionMessage("Previous session ended. You can start a new one.");
		} catch (err) {
			setEndSessionMessage(
				"Failed to end previous session: " + (err.message || err)
			);
		}
	};

	// Play base64 audio (PCM or WAV) using Expo AV
	const playBase64Audio = async (base64Audio) => {
		try {
			// Convert base64 to URI for Expo AV
			const uri = `data:audio/wav;base64,${base64Audio}`;
			const { sound } = await Audio.Sound.createAsync({ uri });
			await sound.playAsync();
		} catch (err) {
			console.error("[VideoAINutritionist] Error playing audio:", err);
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
			{endSessionMessage ? (
				<Text style={styles.response}>{endSessionMessage}</Text>
			) : null}
			{/* Video Call Section */}
			{!isTextMode &&
				(conversationUrl ? (
					<>
						{console.log(
							"[VideoAINutritionist] Rendering WebView with conversationUrl:",
							conversationUrl
						)}
						<WebView
							source={{ uri: conversationUrl }}
							style={styles.videoContainer}
							allowsInlineMediaPlayback
							mediaPlaybackRequiresUserAction={false}
							onError={(e) => {
								console.error(
									"[VideoAINutritionist] WebView onError:",
									e.nativeEvent
								);
								setWebViewError(e.nativeEvent);
							}}
							onLoad={(e) => {
								console.log(
									"[VideoAINutritionist] WebView onLoad:",
									e.nativeEvent
								);
							}}
							onLoadEnd={(e) => {
								console.log(
									"[VideoAINutritionist] WebView onLoadEnd:",
									e.nativeEvent
								);
							}}
						/>
						{webViewError && (
							<Text style={{ color: "red", fontSize: 12 }}>
								WebView Error:{" "}
								{webViewError.description || JSON.stringify(webViewError)}
							</Text>
						)}
					</>
				) : (
					<Text style={styles.noVideo}>
						Video call not available. (conversationUrl:{" "}
						{String(conversationUrl)})
					</Text>
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

			{/* Tavus Callback Events Debug Section */}
			<View style={{ marginVertical: 10 }}>
				<Text style={{ fontWeight: "bold", fontSize: 16 }}>
					Tavus Callback Events (Debug)
				</Text>
				{callbackEvents.length === 0 ? (
					<Text style={{ color: "#888", fontStyle: "italic" }}>
						No events yet.
					</Text>
				) : (
					callbackEvents.slice(-5).map((event, idx) => (
						<View key={idx} style={{ marginBottom: 4 }}>
							<Text style={{ fontSize: 12 }}>
								[{event.event_type}]{" "}
								{event.properties?.text ||
									event.properties?.speech ||
									JSON.stringify(event.properties)}
							</Text>
							{event.event_type === "conversation.echo" &&
								event.properties?.audio && (
									<>
										<Text style={{ fontSize: 10, color: "#007AFF" }}>
											[Echo has audio]
										</Text>
										<Button
											title="Play Audio"
											onPress={() => playBase64Audio(event.properties.audio)}
										/>
									</>
								)}
						</View>
					))
				)}
			</View>

			<Button
				title={isTextMode ? "Switch to Video" : "Switch to Text"}
				onPress={() => setIsTextMode(!isTextMode)}
			/>
			<Button title="Test Voice Input" onPress={handleVoiceInput} />
			{conversationId && (
				<Button
					title="End Current Session"
					onPress={handleEndConversation}
					color="#d9534f"
				/>
			)}
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
