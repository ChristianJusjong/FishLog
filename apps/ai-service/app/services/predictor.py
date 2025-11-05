import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import joblib
from pathlib import Path
import logging

from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from xgboost import XGBClassifier, XGBRegressor

from app.models.schemas import (
    PredictionRequest,
    PredictionResponse,
    BaitRecommendation,
    LureRecommendation,
    RigRecommendation,
    TechniqueRecommendation,
    SpotRecommendation,
    BottomType,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FishingPredictor:
    """AI-powered fishing recommendation system using ML models."""

    def __init__(self):
        self.models_dir = Path(__file__).parent.parent / "trained_models"
        self.models_dir.mkdir(exist_ok=True)

        # Models (will be trained or loaded)
        self.success_model = None  # Predicts catch success probability
        self.weight_model = None  # Predicts expected fish weight
        self.model_type = "xgboost"  # or "random_forest"

        # Knowledge base for recommendations
        self.species_knowledge = self._initialize_species_knowledge()
        self.seasonal_patterns = self._initialize_seasonal_patterns()

    def _initialize_species_knowledge(self) -> Dict:
        """Initialize species-specific fishing knowledge."""
        return {
            "Gedde": {
                "optimal_temp": (10, 20),
                "optimal_depth": (1, 5),
                "active_times": ["early_morning", "evening"],
                "preferred_bottom": ["vegetation", "mixed"],
                "baits": [
                    {"name": "Levende ørred", "type": "live", "confidence": 0.9},
                    {"name": "Død fisk", "type": "natural", "confidence": 0.85},
                    {"name": "Store orm", "type": "natural", "confidence": 0.7},
                ],
                "lures": [
                    {
                        "name": "Stor spinner",
                        "type": "spinner",
                        "color": "silver/rød",
                        "size": "4-5",
                        "confidence": 0.9,
                    },
                    {
                        "name": "Jerkbait",
                        "type": "jerkbait",
                        "color": "naturlig/grøn",
                        "size": "12-15cm",
                        "confidence": 0.85,
                    },
                    {
                        "name": "Softbait",
                        "type": "soft_plastic",
                        "color": "hvid/chartreuse",
                        "size": "10-15cm",
                        "confidence": 0.8,
                    },
                ],
                "rigs": ["Carolina rig", "Texas rig", "Drop shot"],
                "techniques": ["Cast & retrieve", "Jigging", "Trolling"],
            },
            "Aborre": {
                "optimal_temp": (12, 22),
                "optimal_depth": (2, 6),
                "active_times": ["morning", "afternoon"],
                "preferred_bottom": ["rock", "gravel"],
                "baits": [
                    {"name": "Orme", "type": "live", "confidence": 0.9},
                    {"name": "Små fisk", "type": "live", "confidence": 0.85},
                    {"name": "Rejer", "type": "natural", "confidence": 0.75},
                ],
                "lures": [
                    {
                        "name": "Spinners",
                        "type": "spinner",
                        "color": "guld/sølv",
                        "size": "1-3",
                        "confidence": 0.9,
                    },
                    {
                        "name": "Små crankbaits",
                        "type": "crankbait",
                        "color": "perch/naturlig",
                        "size": "3-5cm",
                        "confidence": 0.85,
                    },
                    {
                        "name": "Jigs",
                        "type": "jig",
                        "color": "orange/rød",
                        "size": "2-5g",
                        "confidence": 0.8,
                    },
                ],
                "rigs": ["Drop shot", "Split shot", "Basic float"],
                "techniques": ["Vertical jigging", "Cast & retrieve", "Bottom bouncing"],
            },
            "Sandart": {
                "optimal_temp": (8, 18),
                "optimal_depth": (3, 10),
                "active_times": ["night", "early_morning", "evening"],
                "preferred_bottom": ["sand", "gravel"],
                "baits": [
                    {"name": "Levende fisk", "type": "live", "confidence": 0.95},
                    {"name": "Død fisk stykker", "type": "natural", "confidence": 0.8},
                    {"name": "Store orme", "type": "natural", "confidence": 0.7},
                ],
                "lures": [
                    {
                        "name": "Gummifisk",
                        "type": "soft_plastic",
                        "color": "hvid/perlemor",
                        "size": "8-12cm",
                        "confidence": 0.95,
                    },
                    {
                        "name": "Jigs",
                        "type": "jig",
                        "color": "hvid/chartreuse",
                        "size": "10-20g",
                        "confidence": 0.9,
                    },
                    {
                        "name": "Crankbait",
                        "type": "crankbait",
                        "color": "sølv/blå",
                        "size": "8-12cm",
                        "confidence": 0.8,
                    },
                ],
                "rigs": ["Jig head", "Carolina rig", "Drop shot"],
                "techniques": ["Jigging", "Trolling", "Bottom fishing"],
            },
            "Ørred": {
                "optimal_temp": (10, 16),
                "optimal_depth": (1, 4),
                "active_times": ["early_morning", "evening"],
                "preferred_bottom": ["gravel", "rock"],
                "baits": [
                    {"name": "Fluer", "type": "artificial", "confidence": 0.9},
                    {"name": "Orme", "type": "live", "confidence": 0.85},
                    {"name": "Maddiker", "type": "live", "confidence": 0.8},
                ],
                "lures": [
                    {
                        "name": "Spinners",
                        "type": "spinner",
                        "color": "guld/sølv",
                        "size": "1-2",
                        "confidence": 0.85,
                    },
                    {
                        "name": "Små wobblers",
                        "type": "crankbait",
                        "color": "naturlig",
                        "size": "3-5cm",
                        "confidence": 0.8,
                    },
                    {
                        "name": "Spoons",
                        "type": "spoon",
                        "color": "sølv/rød",
                        "size": "2-4cm",
                        "confidence": 0.75,
                    },
                ],
                "rigs": ["Fly fishing setup", "Float rig", "Spinning rig"],
                "techniques": ["Fly fishing", "Spinning", "Float fishing"],
            },
            "Karpe": {
                "optimal_temp": (15, 25),
                "optimal_depth": (1, 3),
                "active_times": ["morning", "evening"],
                "preferred_bottom": ["mud", "vegetation"],
                "baits": [
                    {"name": "Boilies", "type": "artificial", "confidence": 0.95},
                    {"name": "Mais", "type": "natural", "confidence": 0.9},
                    {"name": "Brød", "type": "natural", "confidence": 0.85},
                ],
                "lures": [
                    {
                        "name": "Method feeder",
                        "type": "feeder",
                        "color": "N/A",
                        "size": "medium",
                        "confidence": 0.8,
                    }
                ],
                "rigs": ["Hair rig", "Method feeder", "Float rig"],
                "techniques": ["Bottom fishing", "Method feeder", "Float fishing"],
            },
        }

    def _initialize_seasonal_patterns(self) -> Dict:
        """Initialize seasonal fishing patterns."""
        return {
            "spring": {
                "notes": "Fisk er aktive efter vinterperioden. Søg mod fladere vand.",
                "temp_adjustment": 1.0,
            },
            "summer": {
                "notes": "Højsæson! Fisk tidligt om morgenen eller sent om aftenen.",
                "temp_adjustment": 1.2,
            },
            "fall": {
                "notes": "Fisk spiser meget før vinteren. God fangst periode.",
                "temp_adjustment": 1.1,
            },
            "winter": {
                "notes": "Langsom aktivitet. Fisk dybere og langsomt.",
                "temp_adjustment": 0.7,
            },
        }

    def _get_season(self, timestamp: datetime) -> str:
        """Determine season from timestamp."""
        month = timestamp.month
        if month in [3, 4, 5]:
            return "spring"
        elif month in [6, 7, 8]:
            return "summer"
        elif month in [9, 10, 11]:
            return "fall"
        else:
            return "winter"

    def _get_time_of_day(self, timestamp: datetime) -> str:
        """Determine time of day from timestamp."""
        hour = timestamp.hour
        if 5 <= hour < 8:
            return "early_morning"
        elif 8 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "night"

    def _extract_features(self, request: PredictionRequest) -> np.ndarray:
        """Extract features from prediction request."""
        season = self._get_season(request.timestamp)
        time_of_day = self._get_time_of_day(request.timestamp)

        features = [
            request.latitude,
            request.longitude,
            request.timestamp.month,
            request.timestamp.hour,
            request.timestamp.weekday(),
            1 if season == "spring" else 0,
            1 if season == "summer" else 0,
            1 if season == "fall" else 0,
            1 if season == "winter" else 0,
            1 if time_of_day == "early_morning" else 0,
            1 if time_of_day == "morning" else 0,
            1 if time_of_day == "afternoon" else 0,
            1 if time_of_day == "evening" else 0,
            1 if time_of_day == "night" else 0,
            request.water_temp if request.water_temp else 15.0,
            request.wind_speed if request.wind_speed else 5.0,
            request.depth if request.depth else 3.0,
            request.air_temp if request.air_temp else 18.0,
            request.cloud_cover if request.cloud_cover else 50.0,
            request.precipitation if request.precipitation else 0.0,
            request.pressure if request.pressure else 1013.0,
        ]

        # Encode bottom type
        bottom_types = ["sand", "mud", "rock", "gravel", "vegetation", "mixed"]
        for bt in bottom_types:
            features.append(1 if request.bottom_type == bt else 0)

        return np.array(features).reshape(1, -1)

    def _calculate_success_probability(
        self, request: PredictionRequest
    ) -> Tuple[float, str]:
        """Calculate catch success probability using ML model or heuristics."""
        species = request.species
        season = self._get_season(request.timestamp)
        time_of_day = self._get_time_of_day(request.timestamp)

        # If model exists, use it
        if self.success_model is not None:
            try:
                features = self._extract_features(request)
                probability = float(self.success_model.predict_proba(features)[0][1])
                return probability, self.model_type
            except Exception as e:
                logger.warning(f"Model prediction failed: {e}, using heuristics")

        # Fallback to knowledge-based heuristics
        base_prob = 0.5

        if species in self.species_knowledge:
            knowledge = self.species_knowledge[species]

            # Time of day adjustment
            if time_of_day in knowledge["active_times"]:
                base_prob += 0.15

            # Temperature adjustment
            if request.water_temp:
                optimal_temp = knowledge["optimal_temp"]
                if optimal_temp[0] <= request.water_temp <= optimal_temp[1]:
                    base_prob += 0.15
                elif abs(request.water_temp - sum(optimal_temp) / 2) > 10:
                    base_prob -= 0.2

            # Depth adjustment
            if request.depth:
                optimal_depth = knowledge["optimal_depth"]
                if optimal_depth[0] <= request.depth <= optimal_depth[1]:
                    base_prob += 0.1

            # Bottom type adjustment
            if request.bottom_type and request.bottom_type in knowledge["preferred_bottom"]:
                base_prob += 0.1

            # Weather adjustments
            if request.wind_speed and request.wind_speed > 10:
                base_prob -= 0.1

            # Seasonal adjustment
            seasonal_factor = self.seasonal_patterns[season]["temp_adjustment"]
            base_prob *= seasonal_factor

        return max(0.1, min(0.95, base_prob)), "heuristic"

    def _get_bait_recommendations(
        self, request: PredictionRequest
    ) -> List[BaitRecommendation]:
        """Get bait recommendations for the species."""
        species = request.species
        if species not in self.species_knowledge:
            return []

        baits = []
        for bait_info in self.species_knowledge[species]["baits"][:3]:
            reason = f"Effektivt for {species} under disse forhold"
            if request.water_temp:
                reason += f" ved {request.water_temp:.1f}°C"

            baits.append(
                BaitRecommendation(
                    name=bait_info["name"],
                    type=bait_info["type"],
                    confidence=bait_info["confidence"],
                    reason=reason,
                )
            )
        return baits

    def _get_lure_recommendations(
        self, request: PredictionRequest
    ) -> List[LureRecommendation]:
        """Get lure recommendations for the species."""
        species = request.species
        if species not in self.species_knowledge:
            return []

        lures = []
        time_of_day = self._get_time_of_day(request.timestamp)

        for lure_info in self.species_knowledge[species]["lures"][:3]:
            reason = f"Godt valg til {species}"
            if time_of_day in ["early_morning", "evening", "night"]:
                reason += " i svagt lys"
            elif time_of_day in ["morning", "afternoon"]:
                reason += " i godt lys"

            lures.append(
                LureRecommendation(
                    name=lure_info["name"],
                    type=lure_info["type"],
                    color=lure_info["color"],
                    size=lure_info["size"],
                    confidence=lure_info["confidence"],
                    reason=reason,
                )
            )
        return lures

    def _get_rig_recommendations(
        self, request: PredictionRequest
    ) -> List[RigRecommendation]:
        """Get rig recommendations for the species."""
        species = request.species
        if species not in self.species_knowledge:
            return []

        rigs = []
        for rig_name in self.species_knowledge[species]["rigs"][:3]:
            description = f"Anbefalet setup til {species} fiskeri"
            confidence = 0.8

            if request.depth:
                if request.depth < 2 and "float" in rig_name.lower():
                    confidence += 0.1
                elif request.depth > 5 and "drop" in rig_name.lower():
                    confidence += 0.1

            rigs.append(
                RigRecommendation(
                    name=rig_name,
                    description=description,
                    confidence=min(0.95, confidence),
                )
            )
        return rigs

    def _get_technique_recommendations(
        self, request: PredictionRequest
    ) -> List[TechniqueRecommendation]:
        """Get technique recommendations for the species."""
        species = request.species
        if species not in self.species_knowledge:
            return []

        techniques = []
        for tech_name in self.species_knowledge[species]["techniques"][:3]:
            tips = [
                f"Vær tålmodig og variér hastigheden",
                f"Let være lydhør overfor vejret",
                f"Eksperimenter med forskellige dybder",
            ]

            if "jigging" in tech_name.lower():
                tips.append("Brug korte, skarpe ryk med pauser")
            elif "trolling" in tech_name.lower():
                tips.append("Hold konstant hastighed omkring 2-4 km/t")
            elif "bottom" in tech_name.lower():
                tips.append("Hold linen stram og føl bundkontakt")

            techniques.append(
                TechniqueRecommendation(
                    name=tech_name,
                    description=f"Effektiv teknik til {species}",
                    confidence=0.8,
                    tips=tips[:3],
                )
            )
        return techniques

    def _get_nearby_spot_recommendations(
        self, request: PredictionRequest
    ) -> List[SpotRecommendation]:
        """Get nearby fishing spot recommendations (mock data for now)."""
        # In production, this would query actual historical catch data
        spots = []

        # Generate some sample nearby spots
        for i in range(3):
            offset_lat = np.random.uniform(-0.05, 0.05)
            offset_lon = np.random.uniform(-0.05, 0.05)
            distance = np.sqrt(offset_lat**2 + offset_lon**2) * 111  # rough km conversion

            spots.append(
                SpotRecommendation(
                    latitude=request.latitude + offset_lat,
                    longitude=request.longitude + offset_lon,
                    distance_km=round(distance, 1),
                    success_rate=np.random.uniform(0.6, 0.9),
                    recent_catches=np.random.randint(5, 25),
                    reason=f"Populært sted for {request.species}",
                )
            )

        return sorted(spots, key=lambda x: x.distance_km)

    def _get_weather_impact(self, request: PredictionRequest) -> str:
        """Analyze weather impact on fishing success."""
        impacts = []

        if request.water_temp:
            if request.water_temp < 8:
                impacts.append("Koldt vand - langsom aktivitet")
            elif 12 <= request.water_temp <= 20:
                impacts.append("Optimal vandtemperatur")
            elif request.water_temp > 25:
                impacts.append("Varmt vand - reduceret iltindhold")

        if request.wind_speed:
            if request.wind_speed < 3:
                impacts.append("Stille vejr - brug naturlige agn")
            elif 3 <= request.wind_speed <= 8:
                impacts.append("Moderat vind - gode forhold")
            elif request.wind_speed > 12:
                impacts.append("Kraftig vind - vanskelige forhold")

        if request.pressure:
            if request.pressure < 1000:
                impacts.append("Lavt tryk - fisk er aktive før storm")
            elif request.pressure > 1025:
                impacts.append("Højt tryk - stabile forhold")

        if request.cloud_cover:
            if request.cloud_cover > 70:
                impacts.append("Overskyet - brug synlige/lette farver")
            elif request.cloud_cover < 30:
                impacts.append("Solrigt - brug naturlige farver")

        return " • ".join(impacts) if impacts else "Generelt acceptable vejrforhold"

    def _get_best_time(self, request: PredictionRequest) -> str:
        """Get best time of day for fishing."""
        species = request.species
        if species not in self.species_knowledge:
            return "Tidlig morgen eller sen eftermiddag"

        active_times = self.species_knowledge[species]["active_times"]
        time_map = {
            "early_morning": "Tidlig morgen (5-8)",
            "morning": "Morgen (8-12)",
            "afternoon": "Eftermiddag (12-17)",
            "evening": "Aften (17-21)",
            "night": "Nat (21-5)",
        }

        return ", ".join([time_map.get(t, t) for t in active_times])

    async def predict(self, request: PredictionRequest) -> PredictionResponse:
        """Generate fishing predictions and recommendations."""
        logger.info(
            f"Generating predictions for {request.species} at ({request.latitude}, {request.longitude})"
        )

        # Calculate success probability
        success_prob, model_used = self._calculate_success_probability(request)

        # Get recommendations
        baits = self._get_bait_recommendations(request)
        lures = self._get_lure_recommendations(request)
        rigs = self._get_rig_recommendations(request)
        techniques = self._get_technique_recommendations(request)
        nearby_spots = self._get_nearby_spot_recommendations(request)

        # Get insights
        weather_impact = self._get_weather_impact(request)
        season = self._get_season(request.timestamp)
        seasonal_notes = self.seasonal_patterns[season]["notes"]
        best_time = self._get_best_time(request)

        # Calculate overall confidence
        confidence = success_prob * 0.5 + (
            0.5 if request.species in self.species_knowledge else 0.2
        )

        return PredictionResponse(
            species=request.species,
            success_probability=round(success_prob, 2),
            best_time=best_time,
            baits=baits,
            lures=lures,
            rigs=rigs,
            techniques=techniques,
            nearby_spots=nearby_spots,
            weather_impact=weather_impact,
            seasonal_notes=seasonal_notes,
            confidence_score=round(confidence, 2),
            model_used=model_used,
        )

    def load_models(self):
        """Load pre-trained models if they exist."""
        try:
            success_model_path = self.models_dir / "success_model.joblib"
            if success_model_path.exists():
                self.success_model = joblib.load(success_model_path)
                logger.info("Loaded success prediction model")
        except Exception as e:
            logger.warning(f"Could not load models: {e}")


# Global predictor instance
predictor = FishingPredictor()
