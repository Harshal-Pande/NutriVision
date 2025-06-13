import React from "react";
import { View, Text, Button, TextInput } from "react-native";

const RecommendationForm = ({ onSubmit }) => {
	const [healthIssue, setHealthIssue] = React.useState("");
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Product Recommendations</Text>
			<TextInput
				placeholder="Enter health issue (e.g., diabetes)"
				value={healthIssue}
				onChangeText={setHealthIssue}
				style={{ borderWidth: 1, width: 200, margin: 10, padding: 5 }}
			/>
			<Button
				title="Get Recommendations"
				onPress={() => onSubmit(healthIssue)}
			/>
		</View>
	);
};

export default RecommendationForm;
