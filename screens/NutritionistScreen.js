import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import VideoAINutritionist from "../components/VideoAINutritionist";

const NutritionistScreen = () => {
	useEffect(() => {
		console.log("[NutritionistScreen] Mounted");
		return () => {
			console.log("[NutritionistScreen] Unmounted");
		};
	}, []);
	console.log("[NutritionistScreen] Rendered");

	return (
		<View style={styles.container}>
			<VideoAINutritionist />
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
});

export default NutritionistScreen;
