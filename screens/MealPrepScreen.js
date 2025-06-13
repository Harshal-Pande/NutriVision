import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MealPrepGuide from "../components/MealPrepGuide";

export default function MealPrepScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.header}>Meal Prep Guide</Text>
			<Text style={styles.desc}>
				Get step-by-step, voice-activated meal prep instructions powered by
				Tavus and Gemini.
			</Text>
			<View style={styles.guideContainer}>
				<MealPrepGuide onStart={() => {}} />
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
	guideContainer: {
		width: "100%",
		alignItems: "center",
	},
});
