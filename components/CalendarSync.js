import React from "react";
import { View, Text, Button } from "react-native";

const CalendarSync = ({ onSync }) => {
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Google Calendar Sync</Text>
			<Button title="Sync Meal Prep Alarms" onPress={onSync} />
		</View>
	);
};

export default CalendarSync;
