import React from "react";
import { View, Text, Button } from "react-native";

const SearchResults = ({ onSearch }) => {
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Health & Product News (Google Search)</Text>
			<Button title="Fetch News" onPress={onSearch} />
		</View>
	);
};

export default SearchResults;
