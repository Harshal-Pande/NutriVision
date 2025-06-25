import React from "react";
import { SafeAreaView, Text } from "react-native";
import RecipeList from "../components/RecipeList";

export default function RecipesScreen() {
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<Text style={{ fontSize: 24, textAlign: "center", marginTop: 20 }}>
				Italian Recipes
			</Text>
			<RecipeList cuisine="Italian" />
		</SafeAreaView>
	);
}
