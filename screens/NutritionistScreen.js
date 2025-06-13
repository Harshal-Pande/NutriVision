import React from "react";
import { StyleSheet, View } from "react-native";
import VideoAINutritionist from "../components/VideoAINutritionist";

const NutritionistScreen = () => {
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
