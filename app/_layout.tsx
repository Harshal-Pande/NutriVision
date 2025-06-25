import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";

import VoiceAssistantScreen from "../components/VoiceAssistantScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ForumScreen from "../screens/ForumScreen";
import HealthScreen from "../screens/HealthScreen";
import HomeScreen from "../screens/HomeScreen";
import MapScreen from "../screens/MapScreen";
import MealPrepScreen from "../screens/MealPrepScreen";
import NutritionistScreen from "../screens/NutritionistScreen";
import RecipesScreen from "../screens/RecipesScreen";
import RecommendScreen from "../screens/RecommendScreen";
import ScanScreen from "../screens/ScanScreen";
import SearchScreen from "../screens/SearchScreen";

const Drawer = createDrawerNavigator();

export default function AppLayout() {
	return (
		<Drawer.Navigator
			initialRouteName="Home"
			screenOptions={{
				headerStyle: { backgroundColor: "#0a7ea4" },
				headerTintColor: "#fff",
				drawerActiveTintColor: "#0a7ea4",
				drawerLabelStyle: { fontSize: 18 },
			}}
		>
			<Drawer.Screen
				name="Home"
				component={HomeScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="home" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Nutritionist"
				component={NutritionistScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="person" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Scan"
				component={ScanScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="barcode" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Recommend"
				component={RecommendScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="star" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Forum"
				component={ForumScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="chatbubbles" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Maps"
				component={MapScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="map" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Calendar"
				component={CalendarScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="calendar" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Search"
				component={SearchScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="search" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Recipes"
				component={RecipesScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="book" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Meal Prep"
				component={MealPrepScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="restaurant" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Health"
				component={HealthScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="heart" color={color} size={size} />
					),
				}}
			/>
			<Drawer.Screen
				name="Voice Assistant"
				component={VoiceAssistantScreen}
				options={{
					drawerIcon: ({ color, size }) => (
						<Ionicons name="mic" color={color} size={size} />
					),
				}}
			/>
		</Drawer.Navigator>
	);
}
