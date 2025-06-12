# NutriVision

A cross-platform mobile app built with **Bolt.new** and **React Native** for personalized nutrition guidance, leveraging advanced AI to empower users with healthier eating habits. Developed for the **World’s Largest Hackathon presented by Bolt**, Nazar Scan AI offers a Video AI nutritionist, image-based product analysis, personalized recommendations, and a community forum, with novel features like predictive health scoring and voice-activated meal prep guidance.

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

Nazar Scan AI distinguishes itself with novel features like custom video-based AI with lip-sync, predictive health risk scoring, and seamless Google integrations (Maps, Calendar, Search
