import axios from "axios";

// Nutritionix API integration (placeholder)
// Replace 'YOUR_NUTRITIONIX_APP_ID' and 'YOUR_NUTRITIONIX_API_KEY' with your actual values
export const NUTRITIONIX_APP_ID = "YOUR_NUTRITIONIX_APP_ID";
export const NUTRITIONIX_API_KEY = "YOUR_NUTRITIONIX_API_KEY";

const NUTRITIONIX_BASE_URL = "https://trackapi.nutritionix.com/v2";
const BACKEND_BASE_URL = "https://nutrivision-cvm8.onrender.com"; // Backend URL for proxying if needed

export const fetchNutritionixData = async (query) => {
	try {
		// Option 1: Direct Nutritionix API call (for development)
		const response = await axios.get(`${NUTRITIONIX_BASE_URL}/search/instant`, {
			params: { query },
			headers: {
				"x-app-id": NUTRITIONIX_APP_ID,
				"x-app-key": NUTRITIONIX_API_KEY,
			},
		});
		return response.data;

		// Option 2: If you want to proxy through your backend for security, use:
		// const response = await axios.get(`${BACKEND_BASE_URL}/nutritionix/search`, { params: { query } });
		// return response.data;
	} catch (error) {
		console.error(
			"Error fetching Nutritionix data:",
			error.response?.data || error.message
		);
		throw error;
	}
};
