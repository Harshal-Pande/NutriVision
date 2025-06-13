import React from "react";
import { View, Text, Button } from "react-native";

const MealPrepGuide = ({ onStart }) => {
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Voice-Activated Meal Prep (Tavus + Gemini)</Text>
			<Button title="Start Meal Prep" onPress={onStart} />
		</View>
	);
};

export default MealPrepGuide;
