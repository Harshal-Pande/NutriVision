import React from "react";
import { View, Text, Button } from "react-native";

const HealthRiskScore = ({ onAnalyze }) => {
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Health Risk Scoring (Gemini)</Text>
			<Button title="Analyze Health Risk" onPress={onAnalyze} />
		</View>
	);
};

export default HealthRiskScore;
