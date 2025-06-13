import * as Battery from "expo-battery";
import * as Brightness from "expo-brightness";
import * as Notifications from "expo-notifications";

// Get device battery level as a percentage
export const getBatteryLevel = async () => {
	try {
		const level = await Battery.getBatteryLevelAsync();
		return Math.round(level * 100);
	} catch (error) {
		console.error("Error getting battery level:", error);
		throw error;
	}
};

// Set the screen brightness (0 to 1)
export const setScreenBrightness = async (value) => {
	try {
		await Brightness.setBrightnessAsync(value);
		return true;
	} catch (error) {
		console.error("Error setting brightness:", error);
		throw error;
	}
};

// Schedule a reminder notification
export const scheduleReminder = async (message, seconds) => {
	try {
		await Notifications.scheduleNotificationAsync({
			content: { title: "Nutrition Reminder", body: message },
			trigger: { seconds },
		});
		return true;
	} catch (error) {
		console.error("Error scheduling reminder:", error);
		throw error;
	}
};
