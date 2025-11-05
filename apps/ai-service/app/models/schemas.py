from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class Season(str, Enum):
    spring = "spring"
    summer = "summer"
    fall = "fall"
    winter = "winter"


class TimeOfDay(str, Enum):
    early_morning = "early_morning"  # 5-8
    morning = "morning"  # 8-12
    afternoon = "afternoon"  # 12-17
    evening = "evening"  # 17-21
    night = "night"  # 21-5


class BottomType(str, Enum):
    sand = "sand"
    mud = "mud"
    rock = "rock"
    gravel = "gravel"
    vegetation = "vegetation"
    mixed = "mixed"


class PredictionRequest(BaseModel):
    species: str = Field(..., description="Target fish species (e.g., Gedde, Aborre)")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)

    # Environmental data
    water_temp: Optional[float] = Field(None, ge=-5, le=35, description="Water temperature in Celsius")
    wind_speed: Optional[float] = Field(None, ge=0, le=50, description="Wind speed in m/s")
    depth: Optional[float] = Field(None, ge=0, le=100, description="Water depth in meters")
    bottom_type: Optional[BottomType] = None

    # Optional weather data
    air_temp: Optional[float] = Field(None, ge=-30, le=45)
    cloud_cover: Optional[float] = Field(None, ge=0, le=100, description="Cloud cover percentage")
    precipitation: Optional[float] = Field(None, ge=0, description="Precipitation in mm")
    pressure: Optional[float] = Field(None, ge=950, le=1050, description="Air pressure in hPa")


class BaitRecommendation(BaseModel):
    name: str
    type: str  # live, artificial, natural
    confidence: float = Field(..., ge=0, le=1)
    reason: str


class LureRecommendation(BaseModel):
    name: str
    type: str  # spinner, spoon, jig, crankbait, soft_plastic
    color: str
    size: str
    confidence: float = Field(..., ge=0, le=1)
    reason: str


class RigRecommendation(BaseModel):
    name: str
    description: str
    confidence: float = Field(..., ge=0, le=1)


class TechniqueRecommendation(BaseModel):
    name: str
    description: str
    confidence: float = Field(..., ge=0, le=1)
    tips: List[str]


class SpotRecommendation(BaseModel):
    latitude: float
    longitude: float
    distance_km: float
    success_rate: float
    recent_catches: int
    reason: str


class PredictionResponse(BaseModel):
    species: str
    success_probability: float = Field(..., ge=0, le=1, description="Predicted catch probability")
    best_time: str

    # Recommendations
    baits: List[BaitRecommendation]
    lures: List[LureRecommendation]
    rigs: List[RigRecommendation]
    techniques: List[TechniqueRecommendation]
    nearby_spots: List[SpotRecommendation]

    # Additional insights
    weather_impact: str
    seasonal_notes: str
    confidence_score: float = Field(..., ge=0, le=1)

    # Model info
    model_used: str
    prediction_timestamp: datetime = Field(default_factory=datetime.now)


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    timestamp: datetime = Field(default_factory=datetime.now)
