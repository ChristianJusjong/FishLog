# FishLog AI Service - Groq Integration Guide

## Overview

The FishLog AI Service provides intelligent fishing recommendations using **Groq's high-performance LLM inference**. It analyzes environmental conditions, location, time, and species to provide:

- Catch success probability
- Recommended baits and lures
- Optimal fishing techniques
- Weather impact analysis
- Seasonal insights
- Nearby successful fishing spots
- **Species Identification** via Vision models

## Architecture

```
┌──────────────┐      HTTP/REST      ┌──────────────┐      Groq API       ┌──────────┐
│   Mobile     │ ────────────────────> │   Node.js    │ ────────────────────> │   Groq   │
│   Frontend   │                       │   Backend    │                       │ Cloud AI │
│  (React      │ <──────────────────── │  (Fastify)   │ <──────────────────── │  (LLM)   │
│   Native)    │      JSON Response    │              │      AI Predictions   │          │
└──────────────┘                       └──────────────┘                       └──────────┘
```

## Configuration

### 1. Get Groq API Key
1. Sign up at [console.groq.com](https://console.groq.com)
2. Create a new API Key

### 2. Configure Backend
Add your Groq API key to `apps/backend/.env`:

```env
GROQ_API_KEY=gsk_...
```

The backend uses the `groq-sdk` to communicate directly with Groq's models (e.g., `llama-3.3-70b-versatile`).

## API Endpoints

### Health Check
```http
GET /ai/health
Authorization: Bearer <token>

Response:
{
  "status": "healthy",
  "ai_service": "Groq",
  "model": "llama-3.3-70b-versatile"
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
  "imageUrl": "https://example.com/fish-photo.jpg"
}
```

## Troubleshooting

### "Groq API key not configured"
- Ensure `GROQ_API_KEY` is set in your `.env` file or Railway environment variables.
- Restart the backend server.

### "Groq unreachable"
- Check your internet connection.
- Verify Groq system status.
- Check if your API key is valid and has quota remaining.

## Future Enhancements
- **Caching**: Redis cache for common requests to save API tokens.
- **Fine-tuning**: Fine-tune a Llama model on specific fishing data if needed.
