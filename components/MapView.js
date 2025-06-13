import React from "react";
import { View, Text, Button } from "react-native";

const MapView = ({ onFindStores }) => {
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Nearby Stores & Gyms (Google Maps)</Text>
			<Button title="Find Nearby Places" onPress={onFindStores} />
		</View>
	);
};

export default MapView;
