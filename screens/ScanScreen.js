import React from "react";
import {
	Platform,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function ScanScreen() {
	const handleScan = () => {
		// TODO: Implement scan logic
		alert("Start scanning (to be implemented)");
	};
	return (
		<View style={styles.container}>
			<Text style={styles.header}>Scan Product</Text>
			<Text style={styles.desc}>
				Scan a product barcode or upload a photo to analyze nutrition data using
				AI.
			</Text>
			<TouchableOpacity style={styles.button} onPress={handleScan}>
				<Text style={styles.buttonText}>Start Scan</Text>
			</TouchableOpacity>
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
	button: {
		backgroundColor: "#0a7ea4",
		paddingVertical: 14,
		paddingHorizontal: 32,
		borderRadius: 10,
		marginBottom: 24,
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
	buttonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
});
