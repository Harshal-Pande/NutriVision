import React from "react";
import { View, Text, Button } from "react-native";

const ReminderSetup = ({ onSetReminder }) => {
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Personalized Reminders (Expo Notifications)</Text>
			<Button title="Set Reminder" onPress={onSetReminder} />
		</View>
	);
};

export default ReminderSetup;
