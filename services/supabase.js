import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jsymhgcoihgfduhhzuhh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeW1oZ2NvaWhnZmR1aGh6dWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NjEyODcsImV4cCI6MjA2NjIzNzI4N30.tV8-htXHdYCw0Pk2uCp4sZ_y9YFjYoMWDgpCKUVoA64";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const testConnection = async () => {
  const { data, error } = await supabase.from('scans').select('*');
  if (error) console.log('Error:', error.message);
  else console.log('Scans:', data);
};

// Insert Scan
export const saveScan = async (
  userId,
  barcode,
  nutritionalData,
  ingredients,
  grade
) => {
  try {
    const { data, error } = await supabase.from("scans").insert([
      {
        user_id: userId,
        barcode,
        nutritional_data: nutritionalData,
        ingredients,
        grade,
      },
    ]);

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return;
    }

    console.log("✅ Supabase insert success:", data);
    return data;
  } catch (error) {
    console.error("❌ Unexpected error saving scan:", error.message);
  }
};

