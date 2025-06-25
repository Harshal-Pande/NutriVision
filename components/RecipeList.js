// Usage Example:
// <RecipeList cuisine="Indian" />

import axios from "axios";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

const SPOONACULAR_API_KEY = "f45238d9-b37c-47b7-ba7f-afc54761bda5";

const RecipeList = ({ cuisine }) => {
	const [recipes, setRecipes] = useState([]);

	useEffect(() => {
		axios
			.get("https://api.spoonacular.com/recipes/complexSearch", {
				params: {
					apiKey: SPOONACULAR_API_KEY,
					number: 10,
					cuisine: cuisine, // e.g., 'Indian', 'Italian', 'Chinese'
				},
			})
			.then((res) => setRecipes(res.data.results))
			.catch((err) => console.log(err));
	}, [cuisine]);

	return (
		<FlatList
			data={recipes}
			keyExtractor={(item) => item.id.toString()}
			renderItem={({ item }) => (
				<View style={styles.card}>
					<Image source={{ uri: item.image }} style={styles.image} />
					<Text style={styles.title}>{item.title}</Text>
				</View>
			)}
		/>
	);
};

const styles = StyleSheet.create({
	card: {
		margin: 10,
		backgroundColor: "#fff",
		borderRadius: 10,
		overflow: "hidden",
		elevation: 3,
	},
	image: { width: "100%", height: 150 },
	title: { padding: 10, fontSize: 16, fontWeight: "bold" },
});

export default RecipeList;
