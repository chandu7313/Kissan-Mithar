from typing import Dict, Any

class SoilClassificationModel:
    """
    Multi-Class Soil Classifier & Physical Properties Engine.
    Maps soil chemistry & texture to agronomic classification.
    """

    @classmethod
    def classify(
        cls,
        ph: float,
        organic_carbon_percent: float,
        clay_percent: float = 40.0,
        sand_percent: float = 30.0,
        color: str = "Deep Black"
    ) -> Dict[str, Any]:
        color_lower = (color or "").lower()
        if "black" in color_lower or (clay_percent >= 40 and ph >= 7.2):
            soil_name = "Black Cotton Soil (Vertisol / Regur)"
            retention = "Very High (Retains moisture up to 35-45% by volume)"
            aeration = "Moderate to Low (Requires proper drainage during heavy monsoon)"
            crops = ["Cotton", "Chilli", "Paddy", "Soybean", "Bengal Gram", "Maize"]
            reclamation = "Add Gypsum @ 1.5 tonnes/acre if exchangeable sodium percentage exceeds 15%. Incorporate organic compost annually."
        elif "red" in color_lower or (sand_percent >= 50 and ph <= 6.8):
            soil_name = "Red Sandy Loam (Alfisol)"
            retention = "Moderate to Low (Quick drainage; requires frequent light irrigation)"
            aeration = "High (Excellent root aeration and tuber development)"
            crops = ["Groundnut", "Pigeonpeas", "Ragi / Millets", "Castor", "Tomato"]
            reclamation = "Apply Agricultural Lime @ 500 kg/acre if pH is below 6.0. Add green manure crops (Dhaincha/Sunn hemp)."
        else:
            soil_name = "Alluvial Loam Soil"
            retention = "Optimal (Balanced water holding and capillary movement)"
            aeration = "Good"
            crops = ["Paddy", "Wheat", "Sugarcane", "Mustard", "Vegetables"]
            reclamation = "Maintain balanced NPK fertilizer usage and incorporate bio-fertilizers."

        return {
            "soil_type": soil_name,
            "water_retention_capacity": retention,
            "aeration": aeration,
            "suitable_crops": crops,
            "reclamation_advisory": reclamation
        }
