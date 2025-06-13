# AINutritionistApp

A cross-platform Expo React Native app for personalized nutrition guidance, built for the World's Largest Hackathon presented by Bolt. The app leverages AI, video, and multiple APIs to deliver a next-gen nutritionist experience on iOS, Android, and PWA.

## Tech Stack

- **React Native with Expo (latest)**
- **Supabase** (users, scans, recommendations, posts)
- **Tavus CVI** (real-time video AI nutritionist, speech input/output)
- **Google Gemini API (Vertex AI, Gemini 1.5 Flash)**
- **Expo APIs**: expo-battery, expo-brightness, expo-notifications
- **Google APIs**: Maps Places, Calendar, Custom Search JSON
- **Nutritionix API**
- **Reddit API**
- **Netlify** (PWA deployment)

## Folder Structure

```
AINutritionistApp/
├── assets/
│   └── logo.png
├── components/
│   ├── VideoAINutritionist.js
│   ├── ImageAnalysis.js
│   ├── RecommendationForm.js
│   ├── Forum.js
│   ├── MapView.js
│   ├── CalendarSync.js
│   ├── SearchResults.js
│   ├── RecipeCard.js
│   ├── MealPrepGuide.js
│   ├── HealthRiskScore.js
│   └── ReminderSetup.js
├── screens/
│   ├── HomeScreen.js
│   ├── NutritionistScreen.js
│   ├── ScanScreen.js
│   ├── RecommendScreen.js
│   ├── ForumScreen.js
│   ├── MapScreen.js
│   ├── CalendarScreen.js
│   ├── SearchScreen.js
│   ├── RecipesScreen.js
│   ├── MealPrepScreen.js
│   └── HealthScreen.js
├── services/
│   ├── supabase.js
│   ├── tavus.js
│   ├── gemini.js
│   ├── nutritionix.js
│   ├── reddit.js
│   ├── googleMaps.js
│   ├── googleCalendar.js
│   └── googleSearch.js
├── utils/
│   ├── gradingLogic.js
│   └── healthRisk.js
├── App.js
├── supabase.sql
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd AINutritionistApp
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Install required packages:**
   ```bash
   npm install @supabase/supabase-js @daily-co/daily-js axios @google-cloud/aiplatform expo-battery expo-brightness expo-notifications react-native-google-places googleapis @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack @expo/vector-icons
   expo install react-native-screens react-native-safe-area-context
   ```
4. **Set up API keys and credentials:**
   - Open files in `services/` and replace placeholder values with your actual API keys and project IDs.
   - Prompted on first run if not set.
5. **Set up Supabase:**
   - Create a new Supabase project.
   - Run the SQL in `supabase.sql` in the Supabase SQL editor.
   - Copy your Supabase URL and anon key to `services/supabase.js`.
6. **Run the app:**
   ```bash
   npx expo start --tunnel
   ```
   - Use the Expo Go app or an emulator for iOS/Android.
   - For PWA, open in a browser.

## Features

- Video AI Nutritionist (Tavus CVI + Gemini, voice/text)
- Image Analysis (Gemini + Nutritionix, 1–10 grading)
- Product Recommendations (Gemini, Supabase)
- Forum (Reddit sync, memes, Supabase)
- Google Maps (Places API, Gemini function calling)
- Google Calendar (Meal prep alarms, Gemini)
- Google Search (Health/product news, Gemini)
- Recipe Generation (Gemini, Nutritionix)
- Voice-Activated Meal Prep (Tavus + Gemini)
- Health Risk Scoring (Gemini, Supabase)
- Reminders (Expo Notifications)
- Mobile Events (expo-battery, expo-brightness)

## Notes

- Use placeholder API keys for prototyping. Prompt for real values on setup.
- Compatible with Bolt.new for rapid prototyping.
- See [Tavus docs](https://docs.tavus.io) for CVI integration.
- Use Google Cloud $300 free credit for Gemini and APIs.
- Deploy PWA to Netlify for public access.

## License

MIT

## Setup
1. Install Node.js, Expo CLI, Google Cloud CLI.
2. Run `npm install`.
3. Replace API keys in `services/tavus.js`, `services/gemini.js`, `services/supabase.js`.
4. Initialize Supabase schema: `supabase.sql`.
5. Start app: `npx expo start --tunnel`.
6. Deploy to Netlify for PWA.

## APIs
- Tavus: https://platform.tavus.io
- Gemini: https://console.cloud.google.com
- Supabase: https://supabase.com

## Bolt.new Compatibility
- This app is compatible with Bolt.new's PWA output.
- A "Built with Bolt.new" badge is included in `HomeScreen.js`.

## Free-Tier Compliance
- Tavus free tier (stock replicas, limited minutes)
- Google Cloud $300 credit for Gemini and APIs
- Supabase free tier (500 MB storage)

## Placeholder Credentials
- All API keys are placeholders (e.g., `YOUR_TAVUS_API_KEY`, `YOUR_PROJECT_ID`, `YOUR_SUPABASE_URL`).
- Prompt: Replace them in `services/` files after generation.

## Error Handling
- All API calls use try-catch blocks and log errors to the console for debugging.

## Request/Response Examples

### Tavus API
**Create Persona**
```
curl -X POST https://tavusapi.com/v2/personas \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_TAVUS_API_KEY" \
  -d '{
    "system_prompt": "You are a friendly nutritionist providing health advice, recipes, and meal prep guidance.",
    "persona_name": "NutritionistAI",
    "context": "Use Gemini API for responses. Integrate with Google Maps, Calendar, and Search.",
    "layers": {
      "llm": {
        "model": "custom_model",
        "base_url": "https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/gemini-1.5-flash-001"
      },
      "tts": { "tts_engine": "cartesia" },
      "perception": { "perception_model": "raven-0" }
    }
  }'
```
**Response:**
```
{
  "persona_id": "p234324a",
  "status": "success"
}
```

**Start Conversation**
```
curl -X POST https://tavusapi.com/v2/conversations \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_TAVUS_API_KEY" \
  -d '{
    "replica_id": "STOCK_REPLICA_ID",
    "persona_id": "p234324a",
    "conversation_name": "NutritionConsult",
    "callback_url": "https://your-webhook.site"
  }'
```
**Response:**
```
{
  "conversation_id": "c123456",
  "conversation_url": "https://tavus.daily.co/c1234abcd",
  "status": "success"
}
```

**Send Echo**
```
curl -X POST https://tavusapi.com/v2/interactions \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_TAVUS_API_KEY" \
  -d '{
    "message_type": "conversation",
    "event_type": "conversation.echo",
    "conversation_id": "c123456",
    "properties": {
      "modality": "text",
      "text": "Here's a low-carb recipe: Tikka Masala Tacos."
    }
  }'
```
**Response:**
```
{
  "status": "success"
}
```

### Gemini API
**Generate Text**
```js
const result = await generativeModel.generateContent('Generate a low-carb vegan recipe.');
```
**Response:**
```
{
  "response": {
    "candidates": [
      {
        "content": {
          "parts": [
            { "text": "Low-Carb Vegan Zucchini Noodles: Ingredients: 2 zucchinis, 1 cup cherry tomatoes..." }
          ]
        }
      }
    ]
  }
}
```

**Function Calling**
```js
const functionDeclarations = [
  {
    function_declarations: [
      {
        name: 'getBatteryLevel',
        description: 'Gets the device battery level as a percentage.',
        parameters: { type: 'object', properties: {} }
      }
    ]
  }
];
const result = await callFunction('Check my battery level.', functionDeclarations);
```
**Response:**
```
{
  "response": {
    "candidates": [
      {
        "content": {
          "parts": [
            {
              "functionCall": {
                "name": "getBatteryLevel",
                "args": {}
              }
            }
          ]
        }
      }
    ]
  }
}
```

### Supabase
**Insert Scan**
```js
const { data, error } = await supabase
  .from('scans')
  .insert({
    user_id: 'user123',
    barcode: '123456789',
    nutritional_data: { calories: 200, sugar: 10 },
    ingredients: ['sugar', 'flour'],
    grade: 8
  });
```
**Response:**
```
{
  "data": [{ "id": 1, "user_id": "user123", "barcode": "123456789", ... }],
  "error": null
}
```

---

# NutriVision

A cross-platform mobile app built with **Bolt.new** and **React Native** for personalized nutrition guidance, leveraging advanced AI to empower users with healthier eating habits. Developed for the **World's Largest Hackathon presented by Bolt**, Nazar Scan AI offers a Video AI nutritionist, image-based product analysis, personalized recommendations, and a community forum, with novel features like predictive health scoring and voice-activated meal prep guidance.

## Problem

Access to personalized nutrition guidance is limited, and existing apps lack advanced AI for predictive health insights, immersive video-based interactions, or integrated lifestyle planning, leaving users without comprehensive tools to make informed dietary choices.

## Solution

Nazar Scan AI addresses these gaps by providing a user-friendly mobile app that combines cutting-edge AI with practical features. Built with **Bolt.new** and **React Native**, it offers a Video AI nutritionist powered by **Laves**, image-based product scanning, tailored product recommendations, and a Reddit-integrated forum. Unique features like health risk scoring, cross-cultural recipe generation, and Google-powered lifestyle integrations (Maps, Calendar, Search) make it a groundbreaking solution for health-conscious users.

## Features

- **Video AI Nutritionist**: Powered by Laves, delivers real-time video guidance with a custom-generated face and lip-sync (using Stable Diffusion XL and Wav2Lip), with a toggle to a text-based chatbot (Conversational AI Video Challenge).
- **Image Analysis**: Scans packaged products for nutritional data, ingredient breakdown, harmfulness assessment, and a 1–10 grade based on WHO standards (e.g., low sugar <5g/100g).
- **Product Recommendations**: Suggests products tailored to health conditions (e.g., diabetes, hypertension) and dietary preferences.
- **Community Forum**: Reddit-integrated platform for nutrition discussions, enhanced with AI-generated memes (Silly Silt Challenge).
- **Google Maps Integration**: Suggests nearby stores and gyms based on user prompts or location.
- **Google Calendar Integration**: Automates meal prep alarms and planning schedules.
- **Google Search Integration**: Fetches health and product-related news and research.
- **Recipe Generation**: Creates tailored, healthy recipes (e.g., low-carb, vegan) with cross-cultural influences.
- **Voice-Activated Meal Prep**: A video-based AI nutritionist guides meal prep via voice commands, with custom visuals.
- **Health Risk Scoring**: Predicts risks (e.g., diabetes) and vitamin deficiency durations based on scan history and health inputs.
- **Personalized Reminders**: Sets alarms for eating, sleeping, and personalized activities via Google Calendar.
- **[Optional] Premium Features**: Subscription-based advanced features (e.g., detailed reports) via RevenueCat (Make More Money Challenge).

## Technology Stack

- **React Native/Expo**: Cross-platform mobile app development for iOS and Android.
- **Supabase**: Relational database and storage for user profiles, scan history, and forum posts.
- **Laves**: Video AI for real-time nutrition guidance (Conversational AI Video Challenge).
- **Hugging Face (Grok 3, T5, TabBERT, Stable Diffusion XL, Wav2Lip)**: Powers NLP, recipe generation, health risk scoring, and video AI face/lip-sync.
- **Google Cloud Vision/Nutritionix**: Enables image-based product analysis.
- **Google Maps/Calendar/Search APIs**: Supports location-based suggestions, scheduling, and news retrieval.
- **Reddit API**: Facilitates forum integration (Silly Silt Challenge).
- **Netlify**: Hosts the Progressive Web App (PWA) for public access (Deploy Challenge).
- **[Optional] RevenueCat/Entri**: Manages subscriptions and custom domain (Custom Domain Challenge).

## Impact

Nazar Scan AI democratizes access to personalized nutrition guidance, empowering users to make informed dietary choices. Its scalable design and innovative features have the potential to reach millions, addressing global health challenges like obesity and chronic diseases.

## Why It Stands Out

Nazar Scan AI distinguishes itself with novel features like custom video-based AI with lip-sync, predictive health risk scoring, and seamless Google integrations (Maps, Calendar, Search)
