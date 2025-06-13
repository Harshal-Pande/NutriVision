import React from "react";
import { View, Text, Button } from "react-native";

const Forum = ({ onSync }) => {
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Community Forum (Reddit Synced)</Text>
			<Text>AI-generated memes and discussions.</Text>
			<Button title="Sync with Reddit" onPress={onSync} />
		</View>
	);
};

export default Forum;
