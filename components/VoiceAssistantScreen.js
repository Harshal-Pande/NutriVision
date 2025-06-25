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
import Voice from "react-native-voice";

const BACKEND_URL = "http://localhost:3001"; // Change to your backend URL

export default function VoiceAssistantScreen() {
	const [input, setInput] = useState("");
	const [history, setHistory] = useState([]);
	const [recording, setRecording] = useState(false);
	const [error, setError] = useState("");
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
		Voice.onSpeechResults = (e) => {
			if (e.value && e.value.length > 0) setInput(e.value[0]);
		};
		Voice.onSpeechError = (e) => {
			setError(
				"Speech recognition error: " + (e.error?.message || JSON.stringify(e))
			);
			setRecording(false);
		};
		return () => {
			Voice.destroy().then(Voice.removeAllListeners);
		};
	}, []);

	// Send message to backend
	const sendMessage = async () => {
		setError("");
		if (!input.trim()) return;
		try {
			const res = await fetch(`${BACKEND_URL}/voice-assistant/message`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ user: "user1", message: input }),
			});
			if (!res.ok) {
				const errData = await res.json();
				setError("Backend error: " + (errData.error || res.statusText));
				return;
			}
			const data = await res.json();
			setHistory(data.history || []);
			setInput("");
			// Play last AI audio
			const last = data.history && data.history[data.history.length - 1];
			if (last && last.role === "ai" && last.audio) playAudio(last.audio);
			// Fetch latest history (in case of concurrent updates)
			fetchHistory();
		} catch (err) {
			setError("Failed to send message: " + err.message);
		}
	};

	// Real voice input using react-native-voice
	const handleRecord = async () => {
		setError("");
		if (!recording) {
			setRecording(true);
			try {
				await Voice.start("en-US");
			} catch (err) {
				setError("Could not start voice recognition: " + err.message);
				setRecording(false);
			}
		} else {
			setRecording(false);
			try {
				await Voice.stop();
				// Optionally auto-send after stop
				if (input.trim()) sendMessage();
			} catch (err) {
				setError("Could not stop voice recognition: " + err.message);
			}
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
				title={recording ? "Stop Recording & Send" : "Start Voice Input"}
				onPress={handleRecord}
			/>
			<Button title="Send" onPress={sendMessage} />
		</View>
	);
}
