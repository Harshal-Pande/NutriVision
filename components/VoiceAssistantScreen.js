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

const BACKEND_URL = "http://localhost:3001"; // Change to your backend URL

export default function VoiceAssistantScreen() {
	const [input, setInput] = useState("");
	const [history, setHistory] = useState([]);
	const [recording, setRecording] = useState(false);
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
			console.error("Error playing audio:", err);
		}
	};

	// Fetch chat history from backend
	const fetchHistory = async () => {
		const res = await fetch(`${BACKEND_URL}/voice-assistant/history`);
		const data = await res.json();
		setHistory(data.history || []);
	};

	useEffect(() => {
		fetchHistory();
	}, []);

	// Send message to backend
	const sendMessage = async () => {
		if (!input.trim()) return;
		const res = await fetch(`${BACKEND_URL}/voice-assistant/message`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ user: "user1", message: input }),
		});
		const data = await res.json();
		setHistory(data.history || []);
		setInput("");
		// Play last AI audio
		const last = data.history && data.history[data.history.length - 1];
		if (last && last.role === "ai" && last.audio) playAudio(last.audio);
		// Fetch latest history (in case of concurrent updates)
		fetchHistory();
	};

	// Placeholder for voice input (replace with real STT integration)
	const handleRecord = () => {
		setRecording(!recording);
		// TODO: Integrate Google STT and setInput(transcribedText)
		alert("Voice input not implemented. Type your message for now.");
	};

	return (
		<View style={{ flex: 1, padding: 16 }}>
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
				title={recording ? "Stop Recording" : "Start Voice Input"}
				onPress={handleRecord}
			/>
			<Button title="Send" onPress={sendMessage} />
		</View>
	);
}
