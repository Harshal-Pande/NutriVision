import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.header}>AINutritionistApp</Text>
			<Text style={styles.badge}>Built with Bolt.new 🚀</Text>
			<Text style={styles.desc}>
				Your AI-powered nutritionist for personalized health, meal prep, and
				more. Use the menu on the left to explore all features.
			</Text>
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
	header: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 8,
		color: "#0a7ea4",
	},
	badge: {
		fontSize: 16,
		color: "#fff",
		backgroundColor: "#0a7ea4",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 4,
		marginBottom: 16,
	},
	desc: {
		fontSize: 18,
		color: "#333",
		textAlign: "center",
		marginBottom: 24,
	},
});
