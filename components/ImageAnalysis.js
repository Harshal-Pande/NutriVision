import React from "react";
import { View, Text, Button } from "react-native";

const ImageAnalysis = ({ onUpload }) => {
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
			<Text>Image Analysis</Text>
			<Text>Upload a product photo to analyze nutrition data.</Text>
			<Button title="Upload Image" onPress={onUpload} />
		</View>
	);
};

export default ImageAnalysis;
