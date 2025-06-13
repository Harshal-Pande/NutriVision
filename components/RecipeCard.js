import React from "react";
import { View, Text, Button } from "react-native";

const RecipeCard = ({ onGenerate }) => {
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Recipe Generation (Gemini)</Text>
			<Button title="Generate Recipe" onPress={onGenerate} />
		</View>
	);
};

export default RecipeCard;
