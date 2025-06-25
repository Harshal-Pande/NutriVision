import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
	Button,
	FlatList,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

const BACKEND_URL = "http://192.168.1.5:3001"; // Local network IP for backend

export default function VoiceAssistantScreen() {
	const [input, setInput] = useState("");
	const [history, setHistory] = useState([]);
	const [recording, setRecording] = useState(false);
	const [error, setError] = useState("");
	const [audioRecorder, setAudioRecorder] = useState(null);
	const soundRef = useRef(null);

	// Play base64 audio
	const playAudio = async (base64) => {
		try {
			if (soundRef.current) {
				await soundRef.current.unloadAsync();
			}
			const uri = `data:audio/mp3;base64,${base64}`;
			const { sound } = await Audio.Sound.createAsync({ uri });
			soundRef.current = sound;
			await sound.playAsync();
		} catch (err) {
			setError("Error playing audio: " + err.message);
		}
	};

	// Fetch chat history from backend
	const fetchHistory = async () => {
		try {
			const res = await fetch(`${BACKEND_URL}/voice-assistant/history`);
			const data = await res.json();
			setHistory(data.history || []);
		} catch (err) {
			setError("Failed to fetch chat history: " + err.message);
		}
	};

	useEffect(() => {
		fetchHistory();
		// Greet the user via AI on first load
		const greet = async () => {
			const greeting =
				"Hello! I'm your AI Nutritionist. How can I help you today?";
			console.log(
				"[VoiceAssistant] Sending initial greeting to backend:",
				greeting
			);
			try {
				const res = await fetch(`${BACKEND_URL}/voice-assistant/message`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ user: "user1", message: greeting }),
				});
				console.log(
					"[VoiceAssistant] Greeting request sent. Awaiting response..."
				);
				if (!res.ok) {
					const errData = await res.json();
					console.error("[VoiceAssistant] Backend error on greeting:", errData);
					setError("Backend error: " + (errData.error || res.statusText));
					return;
				}
				const data = await res.json();
				console.log("[VoiceAssistant] Received greeting response:", data);
				setHistory(data.history || []);
				// Play last AI audio
				const last = data.history && data.history[data.history.length - 1];
				if (last && last.role === "ai" && last.audio) playAudio(last.audio);
			} catch (err) {
				console.error("[VoiceAssistant] Failed to send greeting:", err);
				setError("Failed to send greeting: " + err.message);
			}
		};
		greet();
	}, []);

	// Send message to backend
	const sendMessage = async () => {
		setError("");
		if (!input.trim()) return;
		console.log("[VoiceAssistant] Sending message to backend:", input);
		try {
			const res = await fetch(`${BACKEND_URL}/voice-assistant/message`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user: "user1", message: input }),
			});
			console.log(
				"[VoiceAssistant] Message request sent. Awaiting response..."
			);
			if (!res.ok) {
				const errData = await res.json();
				console.error(
					"[VoiceAssistant] Backend error on sendMessage:",
					errData
				);
				setError("Backend error: " + (errData.error || res.statusText));
				return;
			}
			const data = await res.json();
			console.log("[VoiceAssistant] Received message response:", data);
			setHistory(data.history || []);
			setInput("");
			// Play last AI audio
			const last = data.history && data.history[data.history.length - 1];
			if (last && last.role === "ai" && last.audio) playAudio(last.audio);
			// Fetch latest history (in case of concurrent updates)
			fetchHistory();
		} catch (err) {
			console.error("[VoiceAssistant] Failed to send message:", err);
			setError("Failed to send message: " + err.message);
		}
	};

	// Remove the need for a second button press to stop/transcribe
	// When the user presses the voice button, start recording, and automatically stop after a max time (e.g., 5 seconds)
	// Then transcribe and send the message
	const MAX_RECORDING_TIME_MS = 5000; // 5 seconds

	const handleRecord = async () => {
		setError("");
		if (!recording) {
			setRecording(true);
			try {
				const { status } = await Audio.requestPermissionsAsync();
				if (status !== "granted") {
					setError("Microphone permission is required.");
					setRecording(false);
					return;
				}
				const rec = new Audio.Recording();
				await rec.prepareToRecordAsync(
					Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
				);
				await rec.startAsync();
				setAudioRecorder(rec);
				// Automatically stop after max time
				setTimeout(async () => {
					if (recording) {
						setRecording(false);
						try {
							await rec.stopAndUnloadAsync();
							const uri = rec.getURI();
							const file = await fetch(uri);
							const blob = await file.blob();
							// Convert blob to base64
							const reader = new FileReader();
							reader.onloadend = async () => {
								const base64 = reader.result.split(",")[1];
								// Send to backend for transcription
								try {
									const res = await fetch(
										`${BACKEND_URL}/voice-assistant/transcribe`,
										{
											method: "POST",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify({ audioBase64: base64 }),
										}
									);
									const data = await res.json();
									if (data.transcription) {
										setInput(data.transcription);
										// Show the transcribed text in chat immediately
										setHistory((prev) => [
											...prev,
											{ role: "user", text: data.transcription },
										]);
										// Auto-send after transcription
										if (data.transcription.trim())
											sendMessageWithText(data.transcription);
									} else {
										setError("No transcription result.");
									}
								} catch (err) {
									setError("Failed to transcribe audio: " + err.message);
								}
							};
							reader.readAsDataURL(blob);
						} catch (err) {
							setError("Could not stop recording: " + err.message);
						}
					}
				}, MAX_RECORDING_TIME_MS);
			} catch (err) {
				setError("Could not start recording: " + err.message);
				setRecording(false);
			}
		}
	};

	// Helper to send a specific text (used after transcription)
	const sendMessageWithText = async (text) => {
		setError("");
		if (!text.trim()) return;
		console.log("[VoiceAssistant] Sending transcribed text to backend:", text);
		try {
			const res = await fetch(`${BACKEND_URL}/voice-assistant/message`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user: "user1", message: text }),
			});
			console.log(
				"[VoiceAssistant] Transcribed text request sent. Awaiting response..."
			);
			if (!res.ok) {
				const errData = await res.json();
				console.error(
					"[VoiceAssistant] Backend error on sendMessageWithText:",
					errData
				);
				setError("Backend error: " + (errData.error || res.statusText));
				return;
			}
			const data = await res.json();
			console.log("[VoiceAssistant] Received transcribed text response:", data);
			setHistory(data.history || []);
			setInput("");
			// Play last AI audio
			const last = data.history && data.history[data.history.length - 1];
			if (last && last.role === "ai" && last.audio) playAudio(last.audio);
			// Fetch latest history (in case of concurrent updates)
			fetchHistory();
		} catch (err) {
			console.error("[VoiceAssistant] Failed to send transcribed text:", err);
			setError("Failed to send message: " + err.message);
		}
	};

	return (
		<View style={{ flex: 1, padding: 16 }}>
			{error ? (
				<Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
			) : null}
			<FlatList
				data={history}
				keyExtractor={(_, idx) => idx.toString()}
				renderItem={({ item }) => (
					<View style={{ marginVertical: 4 }}>
						<Text
							style={{ fontWeight: item.role === "user" ? "bold" : "normal" }}
						>
							{item.role === "user" ? "You" : "AI"}: {item.text}
						</Text>
						{item.role === "ai" && item.audio && (
							<TouchableOpacity onPress={() => playAudio(item.audio)}>
								<Text style={{ color: "#007AFF" }}>Play AI Audio</Text>
							</TouchableOpacity>
						)}
					</View>
				)}
			/>
			<TextInput
				value={input}
				onChangeText={setInput}
				placeholder="Type or use voice..."
				style={{
					borderWidth: 1,
					borderColor: "#ccc",
					borderRadius: 8,
					padding: 8,
					marginBottom: 8,
				}}
			/>
			<Button
				title={recording ? "Listening..." : "Start Voice Input"}
				onPress={handleRecord}
				disabled={recording}
			/>
			<Button title="Send" onPress={sendMessage} />
		</View>
	);
}
