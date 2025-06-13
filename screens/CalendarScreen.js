import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CalendarSync from "../components/CalendarSync";

export default function CalendarScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.header}>Calendar Sync</Text>
			<Text style={styles.desc}>
				Sync your meal prep and health reminders with Google Calendar.
			</Text>
			<View style={styles.calendarContainer}>
				<CalendarSync onSync={() => {}} />
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
	calendarContainer: {
		width: "100%",
		alignItems: "center",
	},
});
