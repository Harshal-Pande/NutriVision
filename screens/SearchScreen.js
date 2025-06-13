import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SearchResults from "../components/SearchResults";

export default function SearchScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.header}>Health & Product Search</Text>
			<Text style={styles.desc}>
				Search for health news, nutrition info, and products using Google Search and Gemini.
			</Text>
			<View style={styles.searchContainer}>
				<SearchResults onSearch={() => {}} />
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
	searchContainer: {
		width: "100%",
		alignItems: "center",
	},
});
