from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import predictions
from app.services.predictor import predictor
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="FishLog AI Service",
    description="AI-powered fishing predictions and recommendations",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predictions.router)


@app.on_event("startup")
async def startup_event():
    """Load ML models on startup."""
    logger.info("🚀 Starting FishLog AI Service...")
    predictor.load_models()
    logger.info("✅ AI Service ready!")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "FishLog AI Service",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/v1/health",
            "predict": "/api/v1/predict (POST)",
            "docs": "/docs",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
