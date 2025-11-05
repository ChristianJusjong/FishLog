"""
Training script for fishing prediction models.
Generates synthetic training data and trains XGBoost and RandomForest models.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report
from xgboost import XGBClassifier, XGBRegressor
import joblib
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelTrainer:
    """Train ML models for fishing predictions."""

    def __init__(self):
        self.models_dir = Path(__file__).parent.parent / "trained_models"
        self.models_dir.mkdir(exist_ok=True)

    def generate_training_data(self, n_samples: int = 10000) -> pd.DataFrame:
        """
        Generate synthetic training data based on fishing domain knowledge.
        In production, this would use real historical catch data.
        """
        logger.info(f"Generating {n_samples} training samples...")

        data = []
        species_list = ["Gedde", "Aborre", "Sandart", "Ørred", "Karpe"]

        # Species-specific patterns
        species_patterns = {
            "Gedde": {"temp": (10, 20), "depth": (1, 5), "success_base": 0.6},
            "Aborre": {"temp": (12, 22), "depth": (2, 6), "success_base": 0.65},
            "Sandart": {"temp": (8, 18), "depth": (3, 10), "success_base": 0.55},
            "Ørred": {"temp": (10, 16), "depth": (1, 4), "success_base": 0.6},
            "Karpe": {"temp": (15, 25), "depth": (1, 3), "success_base": 0.7},
        }

        for i in range(n_samples):
            species = np.random.choice(species_list)
            pattern = species_patterns[species]

            # Location (Denmark)
            latitude = np.random.uniform(54.5, 57.8)
            longitude = np.random.uniform(8.0, 12.7)

            # Time
            days_offset = np.random.randint(0, 365 * 3)  # 3 years of data
            base_date = datetime.now() - timedelta(days=days_offset)
            month = base_date.month
            hour = np.random.randint(0, 24)
            weekday = base_date.weekday()

            # Season
            if month in [3, 4, 5]:
                season = "spring"
            elif month in [6, 7, 8]:
                season = "summer"
            elif month in [9, 10, 11]:
                season = "fall"
            else:
                season = "winter"

            # Time of day
            if 5 <= hour < 8:
                time_of_day = "early_morning"
            elif 8 <= hour < 12:
                time_of_day = "morning"
            elif 12 <= hour < 17:
                time_of_day = "afternoon"
            elif 17 <= hour < 21:
                time_of_day = "evening"
            else:
                time_of_day = "night"

            # Environmental conditions
            water_temp = np.random.normal(
                sum(pattern["temp"]) / 2, 5
            )  # Around optimal temp
            wind_speed = np.abs(np.random.normal(6, 4))
            depth = np.random.uniform(pattern["depth"][0], pattern["depth"][1] + 2)
            air_temp = water_temp + np.random.normal(2, 3)
            cloud_cover = np.random.uniform(0, 100)
            precipitation = np.abs(np.random.normal(0, 3))
            pressure = np.random.normal(1013, 15)

            bottom_type = np.random.choice(
                ["sand", "mud", "rock", "gravel", "vegetation", "mixed"]
            )

            # Calculate success probability based on conditions
            success_prob = pattern["success_base"]

            # Temperature factor
            temp_optimal = sum(pattern["temp"]) / 2
            temp_diff = abs(water_temp - temp_optimal)
            if temp_diff < 3:
                success_prob += 0.2
            elif temp_diff > 10:
                success_prob -= 0.3

            # Time of day factors (varies by species)
            if species in ["Gedde", "Sandart", "Ørred"] and time_of_day in [
                "early_morning",
                "evening",
            ]:
                success_prob += 0.15
            elif species == "Aborre" and time_of_day in ["morning", "afternoon"]:
                success_prob += 0.15
            elif species == "Karpe" and time_of_day in ["morning", "evening"]:
                success_prob += 0.1

            # Depth factor
            depth_optimal = sum(pattern["depth"]) / 2
            if abs(depth - depth_optimal) < 1:
                success_prob += 0.1

            # Weather factors
            if wind_speed > 12:
                success_prob -= 0.15
            if precipitation > 5:
                success_prob -= 0.1
            if cloud_cover < 30:  # sunny
                success_prob += 0.05

            # Seasonal factors
            if season == "summer":
                success_prob += 0.1
            elif season == "winter":
                success_prob -= 0.15

            # Ensure valid probability
            success_prob = max(0.05, min(0.95, success_prob))

            # Determine actual success (binary outcome)
            success = 1 if np.random.random() < success_prob else 0

            # Weight (if caught)
            if success:
                if species == "Gedde":
                    weight = np.random.gamma(3, 800)  # Pike can be large
                elif species == "Aborre":
                    weight = np.random.gamma(2, 150)  # Perch are smaller
                elif species == "Sandart":
                    weight = np.random.gamma(2.5, 600)  # Zander medium-large
                elif species == "Ørred":
                    weight = np.random.gamma(2, 400)  # Trout medium
                elif species == "Karpe":
                    weight = np.random.gamma(4, 1000)  # Carp can be very large
            else:
                weight = 0

            # Build feature vector
            row = {
                "species": species,
                "latitude": latitude,
                "longitude": longitude,
                "month": month,
                "hour": hour,
                "weekday": weekday,
                "season_spring": 1 if season == "spring" else 0,
                "season_summer": 1 if season == "summer" else 0,
                "season_fall": 1 if season == "fall" else 0,
                "season_winter": 1 if season == "winter" else 0,
                "time_early_morning": 1 if time_of_day == "early_morning" else 0,
                "time_morning": 1 if time_of_day == "morning" else 0,
                "time_afternoon": 1 if time_of_day == "afternoon" else 0,
                "time_evening": 1 if time_of_day == "evening" else 0,
                "time_night": 1 if time_of_day == "night" else 0,
                "water_temp": water_temp,
                "wind_speed": wind_speed,
                "depth": depth,
                "air_temp": air_temp,
                "cloud_cover": cloud_cover,
                "precipitation": precipitation,
                "pressure": pressure,
                "bottom_sand": 1 if bottom_type == "sand" else 0,
                "bottom_mud": 1 if bottom_type == "mud" else 0,
                "bottom_rock": 1 if bottom_type == "rock" else 0,
                "bottom_gravel": 1 if bottom_type == "gravel" else 0,
                "bottom_vegetation": 1 if bottom_type == "vegetation" else 0,
                "bottom_mixed": 1 if bottom_type == "mixed" else 0,
                "success": success,
                "weight": weight,
            }

            data.append(row)

        df = pd.DataFrame(data)
        logger.info(f"Generated data shape: {df.shape}")
        logger.info(f"Success rate: {df['success'].mean():.2%}")
        return df

    def train_success_model(
        self, df: pd.DataFrame, model_type: str = "xgboost"
    ) -> tuple:
        """Train model to predict catch success probability."""
        logger.info(f"Training {model_type} success prediction model...")

        # Prepare features and target
        feature_cols = [
            col for col in df.columns if col not in ["species", "success", "weight"]
        ]
        X = df[feature_cols]
        y = df["success"]

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Train model
        if model_type == "xgboost":
            model = XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                eval_metric="logloss",
            )
        else:  # random_forest
            model = RandomForestClassifier(
                n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
            )

        model.fit(X_train, y_train)

        # Evaluate
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1]

        accuracy = accuracy_score(y_test, y_pred)
        logger.info(f"Success model accuracy: {accuracy:.3f}")
        logger.info("\nClassification Report:")
        logger.info(classification_report(y_test, y_pred))

        # Feature importance
        feature_importance = pd.DataFrame(
            {"feature": feature_cols, "importance": model.feature_importances_}
        ).sort_values("importance", ascending=False)
        logger.info("\nTop 10 Important Features:")
        logger.info(feature_importance.head(10))

        return model, accuracy

    def train_weight_model(self, df: pd.DataFrame, model_type: str = "xgboost") -> tuple:
        """Train model to predict fish weight (only for successful catches)."""
        logger.info(f"Training {model_type} weight prediction model...")

        # Only use successful catches
        df_success = df[df["success"] == 1].copy()

        feature_cols = [
            col
            for col in df_success.columns
            if col not in ["species", "success", "weight"]
        ]
        X = df_success[feature_cols]
        y = df_success["weight"]

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Train model
        if model_type == "xgboost":
            model = XGBRegressor(
                n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42
            )
        else:  # random_forest
            model = RandomForestRegressor(
                n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
            )

        model.fit(X_train, y_train)

        # Evaluate
        y_pred = model.predict(X_test)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)

        logger.info(f"Weight model RMSE: {rmse:.2f}g")
        logger.info(f"Mean actual weight: {y_test.mean():.2f}g")

        return model, rmse

    def train_and_save_models(self, model_type: str = "xgboost"):
        """Generate data, train models, and save them."""
        logger.info(f"Starting model training pipeline with {model_type}...")

        # Generate training data
        df = self.generate_training_data(n_samples=10000)

        # Train success model
        success_model, success_accuracy = self.train_success_model(df, model_type)

        # Save success model
        success_model_path = self.models_dir / "success_model.joblib"
        joblib.dump(success_model, success_model_path)
        logger.info(f"Saved success model to {success_model_path}")

        # Train weight model
        weight_model, weight_rmse = self.train_weight_model(df, model_type)

        # Save weight model
        weight_model_path = self.models_dir / "weight_model.joblib"
        joblib.dump(weight_model, weight_model_path)
        logger.info(f"Saved weight model to {weight_model_path}")

        logger.info("✅ Model training complete!")
        logger.info(f"Success model accuracy: {success_accuracy:.3f}")
        logger.info(f"Weight model RMSE: {weight_rmse:.2f}g")


if __name__ == "__main__":
    trainer = ModelTrainer()

    # Train both XGBoost and RandomForest for comparison
    logger.info("=" * 50)
    logger.info("Training XGBoost models...")
    logger.info("=" * 50)
    trainer.train_and_save_models(model_type="xgboost")

    # Uncomment to also train RandomForest
    # logger.info("\n" + "="*50)
    # logger.info("Training RandomForest models...")
    # logger.info("="*50)
    # trainer.train_and_save_models(model_type="random_forest")
