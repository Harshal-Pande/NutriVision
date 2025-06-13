import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView from "../components/MapView";

export default function MapScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.header}>Nearby Stores & Gyms</Text>
			<Text style={styles.desc}>
				Find healthy food stores, gyms, and more using Google Maps integration.
			</Text>
			<View style={styles.mapContainer}>
				<MapView onFindStores={() => {}} />
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
	mapContainer: {
		width: "100%",
		alignItems: "center",
	},
});
