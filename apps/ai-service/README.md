# FishLog AI Service

AI-powered fishing predictions and recommendations using machine learning.

## Features

- **Success Probability Prediction**: ML models predict catch success based on environmental conditions
- **Intelligent Recommendations**:
  - Best baits for current conditions
  - Optimal lures (type, color, size)
  - Recommended rigs and setups
  - Effective fishing techniques with tips
  - Nearby successful fishing spots
- **Weather Analysis**: Impact assessment of current weather on fishing
- **Seasonal Insights**: Season-specific fishing patterns and tips
- **ML Models**: XGBoost and RandomForest for predictions

## Setup

### 1. Install Python Dependencies

```bash
cd apps/ai-service
pip install -r requirements.txt
```

### 2. Train Models (Optional)

Generate synthetic training data and train models:

```bash
python -m app.services.train_models
```

This will create trained models in `app/trained_models/`.

### 3. Start the Service

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or use Python directly:

```bash
python -m app.main
```

## API Endpoints

### Health Check
```
GET /api/v1/health
```

### Get Predictions
```
POST /api/v1/predict
Content-Type: application/json

{
  "species": "Gedde",
  "latitude": 56.26,
  "longitude": 9.5,
  "timestamp": "2025-01-15T10:30:00",
  "water_temp": 15.5,
  "wind_speed": 5.0,
  "depth": 3.0,
  "bottom_type": "vegetation"
}
```

### Interactive API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Supported Fish Species

- Gedde (Pike)
- Aborre (Perch)
- Sandart (Zander)
- Ørred (Trout)
- Karpe (Carp)

## ML Features

The models use 27 features including:
- Location (latitude, longitude)
- Time (month, hour, day of week, season, time of day)
- Environmental conditions (water temp, wind, depth, air temp, cloud cover, precipitation, pressure)
- Bottom type (sand, mud, rock, gravel, vegetation, mixed)

## Architecture

```
app/
├── main.py                 # FastAPI application
├── models/
│   └── schemas.py         # Pydantic data models
├── routes/
│   └── predictions.py     # API endpoints
├── services/
│   ├── predictor.py       # ML prediction service
│   └── train_models.py    # Model training
└── trained_models/        # Saved ML models
```

## Integration with FishLog Backend

The Node.js backend calls this AI service to get recommendations:

```javascript
const response = await fetch('http://localhost:8000/api/v1/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```
