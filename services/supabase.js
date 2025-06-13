import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase project URL and anon key
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Insert Scan
export const saveScan = async (
	userId,
	barcode,
	nutritionalData,
	ingredients,
	grade
) => {
	try {
		const { data, error } = await supabase.from("scans").insert({
			user_id: userId,
			barcode,
			nutritional_data: nutritionalData,
			ingredients,
			grade,
		});
		// Response: { data: [ ... ], error: null }
		if (error) throw error;
		return data;
	} catch (error) {
		console.error("Error saving scan:", error);
		throw error;
	}
};
