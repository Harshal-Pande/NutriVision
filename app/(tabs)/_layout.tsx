import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: Platform.select({
					ios: {
						// Use a transparent background on iOS to show the blur effect
						position: "absolute",
					},
					default: {},
				}),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="house.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="nutritionist"
				options={{
					title: "Nutritionist",
					tabBarIcon: ({ color }) => (
						<IconSymbol
							size={28}
							name="person.crop.circle.fill"
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="scan"
				options={{
					title: "Scan",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="barcode.viewfinder" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="recommend"
				options={{
					title: "Recommend",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="star.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="forum"
				options={{
					title: "Forum",
					tabBarIcon: ({ color }) => (
						<IconSymbol
							size={28}
							name="bubble.left.and.bubble.right.fill"
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="maps"
				options={{
					title: "Maps",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="map.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="calendar"
				options={{
					title: "Calendar",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="calendar" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: "Search",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="magnifyingglass" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="recipes"
				options={{
					title: "Recipes",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="book.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="mealprep"
				options={{
					title: "Meal Prep",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="fork.knife" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="health"
				options={{
					title: "Health",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="heart.fill" color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
