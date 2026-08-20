# FishLog AI Service - Google Gemini Integration Guide

## Overview

The FishLog AI Service provides intelligent fishing recommendations using **Google Gemini AI**. It analyzes environmental conditions, location, time, and species to provide:

- Catch success probability
- Recommended baits and lures
- Optimal fishing techniques
- Weather impact analysis
- Seasonal insights
- Nearby successful fishing spots
- **Species Identification** via Gemini Multimodal Vision models

## Architecture

```
┌──────────────┐      HTTP/REST      ┌──────────────┐      Gemini API     ┌──────────┐
│   Mobile     │ ────────────────────> │   Node.js    │ ────────────────────> │  Google  │
│   Frontend   │                       │   Backend    │                       │  Gemini  │
│  (React      │ <──────────────────── │  (Fastify)   │ <──────────────────── │ Cloud AI │
│   Native)    │      JSON Response    │              │      AI Predictions   │  (Flash) │
└──────────────┘                       └──────────────┘                       └──────────┘
```

## Configuration

### 1. Get Google Gemini API Key
1. Sign up at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a new API Key in Google AI Studio

### 2. Configure Backend
Add your Gemini API key to `apps/backend/.env`:

```env
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
```

The backend uses `@google/generative-ai` to communicate directly with Google's Gemini models (`gemini-2.5-flash` / `gemini-2.0-flash`).

## API Endpoints

### Health Check
```http
GET /ai/health
Authorization: Bearer <token>

Response:
{
  "status": "healthy",
  "ai_service": "Google Gemini",
  "model": "gemini-2.5-flash"
}
```

### Get Recommendations
```http
POST /ai/recommendations
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "species": "Gedde",
  "latitude": 56.26,
  "longitude": 9.5,
  "water_temp": 15.5,
  "wind_speed": 5.0,
  "depth": 3.0,
  "bottom_type": "vegetation"
}
```

### Identify Species (Vision)
```http
POST /ai/identify-species
Content-Type: application/json
Authorization: Bearer <token>

Request Body:
{
  "imageUrl": "data:image/jpeg;base64,... or https://example.com/fish-photo.jpg"
}
```

## Troubleshooting

### "Google Gemini API key is required"
- Ensure `GEMINI_API_KEY` is set in your `.env` file or cloud deployment environment variables.
- Or provide your personal Gemini key in Profile / Settings in the mobile app.

### Offline & Fallback Mode
- If no Gemini API key is present or the device is offline, the backend automatically uses the built-in comprehensive Danish fishing rules engine to provide instant advice without failing.
