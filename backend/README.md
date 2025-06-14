# NutriVision Backend

This backend server handles Tavus API webhooks, OpenAI-compatible chat completions (proxying to Gemini), and serves callback data for the NutriVision app.

## Features

- Receives Tavus webhook callbacks (video/conversation events)
- Exposes `/callbacks` endpoint for frontend polling
- Implements `/chat/completions` endpoint (OpenAI-compatible, proxies to Gemini LLM)
- Health check endpoint at `/` for Render
- Robust error logging for all endpoints

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```
2. **Configure environment variables:**
   - Create a `.env` file in the backend folder:
     ```env
     GEMINI_API_KEY=AIzaSyA2qukNrTJotAh30BPrVkBqtloRSZbKJcA
     PORT=3001
     ```
3. **Run the server locally:**
   ```bash
   npm start
   ```

## Deployment (Render)

You can deploy this backend to [Render](https://render.com):

1. Push the `backend` folder to your GitHub repository.
2. Create a new **Web Service** on Render, connect your repo, and set the root directory to `backend`.
3. Set the build and start commands:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add your environment variables (`GEMINI_API_KEY`, `PORT`) in the Render dashboard.
5. Deploy!

## Endpoints

- `POST /webhook` — Tavus webhook callback receiver
- `GET /callbacks` — Returns all received callbacks
- `POST /chat/completions` — OpenAI-compatible endpoint for Tavus, proxies to Gemini
- `GET /` — Health check endpoint for Render

## Frontend Integration

- Set your frontend and Tavus persona config to use the deployed backend URLs.
- Example Persona LLM config:
  ```json
  {
  	"model": "custom_model_here",
  	"base_url": "https://<your-render-url>/chat/completions",
  	"speculative_inference": true
  }
  ```
- Use the `/callbacks` endpoint in your app to poll for Tavus events.

## Error Logging

- All endpoints log errors to the console and return clear error messages for debugging.

## Notes

- Make sure your Render service is public and accessible to Tavus and your frontend.
- Update your frontend and Tavus persona config to use the deployed backend URLs.
