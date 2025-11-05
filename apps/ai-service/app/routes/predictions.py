from fastapi import APIRouter, HTTPException
from app.models.schemas import PredictionRequest, PredictionResponse, HealthResponse
from app.services.predictor import predictor
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["predictions"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=predictor.success_model is not None,
    )


@router.post("/predict", response_model=PredictionResponse)
async def get_predictions(request: PredictionRequest):
    """
    Get fishing predictions and recommendations.

    Returns AI-powered recommendations for:
    - Best baits and lures
    - Optimal rigs and techniques
    - Nearby fishing spots
    - Success probability
    - Weather impact analysis
    """
    try:
        logger.info(f"Received prediction request for species: {request.species}")
        response = await predictor.predict(request)
        return response
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
