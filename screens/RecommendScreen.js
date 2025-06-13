import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import RecommendationForm from "../components/RecommendationForm";

export default function RecommendScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.header}>Product Recommendations</Text>
			<Text style={styles.desc}>
				Get personalized nutrition and product recommendations powered by AI.
			</Text>
			<View style={styles.formContainer}>
				<RecommendationForm onSubmit={() => {}} />
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
	formContainer: {
		width: "100%",
		alignItems: "center",
		...(Platform.OS === "web"
			? { boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }
			: {
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.1,
					shadowRadius: 4,
					elevation: 2,
			  }),
	},
});
