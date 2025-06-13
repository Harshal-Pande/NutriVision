import React from "react";
import { StyleSheet, Text, View } from "react-native";
import HealthRiskScore from "../components/HealthRiskScore";
import ReminderSetup from "../components/ReminderSetup";

export default function HealthScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.header}>Health Scoring & Reminders</Text>
			<Text style={styles.desc}>
				Analyze your health risk and set personalized reminders using AI and
				Expo Notifications.
			</Text>
			<View style={styles.section}>
				<HealthRiskScore onAnalyze={() => {}} />
			</View>
			<View style={styles.section}>
				<ReminderSetup onSetReminder={() => {}} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 24,
		backgroundColor: "#f8fafc",
	},
	header: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 8,
		color: "#0a7ea4",
	},
	desc: {
		fontSize: 18,
		color: "#333",
		textAlign: "center",
		marginBottom: 24,
	},
	section: {
		width: "100%",
		alignItems: "center",
		marginBottom: 16,
	},
});
