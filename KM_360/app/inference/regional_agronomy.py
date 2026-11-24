"""
Regional & Seasonal Agronomic Validation Guardrails for KM 360.
Encapsulates authentic ICAR, PJTSAU (Telangana), and ANGRAU (Andhra Pradesh) agronomic rules.
"""

from typing import Dict, Any, List, Optional, Tuple

TELANGANA_DISTRICTS = {
    "adilabad", "nirmal", "mancherial", "komaram bheem asifabad",
    "karimnagar", "jagtial", "peddapalli", "rajanna sircilla",
    "nizamabad", "kamareddy", "warangal", "hanumakonda", "hanamkonda",
    "jangaon", "mahabubabad", "jayashankar bhupalpally", "mulugu",
    "khammam", "bhadradri kothagudem", "nalgonda", "suryapet",
    "yadadri bhuvanagiri", "mahabubnagar", "nagarkurnool", "wanaparthy",
    "jogulamba gadwal", "narayanpet", "rangareddy", "vicarabad", "vikarabad",
    "medchal-malkajgiri", "medchal", "hyderabad", "siddipet", "medak", "sangareddy"
}

AP_DISTRICTS = {
    "srikakulam", "vizianagaram", "visakhapatnam", "anakapalli", "alluri sitharama raju",
    "kakinada", "east godavari", "konaseema", "west godavari", "eluru",
    "krishna", "ntr", "guntur", "bapatla", "palnadu", "prakasam",
    "spsr nellore", "nellore", "kurnool", "nandyal", "anantapur",
    "sri sathya sai", "ysr kadapa", "kadapa", "annamaya", "chittoor", "tirupati"
}

# Temperate or high-altitude crops unviable in tropical / semi-arid plains
TEMPERATE_RESTRICTED_CROPS = {"apple"}
HIGH_ALTITUDE_RESTRICTED_CROPS = {"coffee"} # Viable only in Araku/hills

# Seasonal Crop Suitability Map
SEASONAL_CROPS = {
    "kharif": {
        "optimal": {"rice", "cotton", "chilli", "maize", "pigeonpeas", "groundnut", "mungbean", "blackgram", "jute", "banana", "papaya", "mango"},
        "warning_crops": {"chickpea", "lentil", "apple"}
    },
    "rabi": {
        "optimal": {"chickpea", "maize", "groundnut", "blackgram", "lentil", "mustard", "wheat"},
        "irrigation_dependent": {"rice", "cotton", "chilli"},
        "warning_crops": {"jute", "apple"}
    },
    "zaid": {
        "optimal": {"watermelon", "muskmelon", "mungbean", "cucumber", "vegetables"},
        "warning_crops": {"apple", "chickpea", "lentil", "rice"}
    }
}

# Soil Suitability Map
SOIL_SUITABILITY = {
    "black": {
        "preferred": {"cotton", "chilli", "chickpea", "pigeonpeas", "maize", "rice", "groundnut"},
        "discouraged": {"apple", "coconut"}
    },
    "red": {
        "preferred": {"groundnut", "maize", "pigeonpeas", "mungbean", "mango", "papaya", "castor", "chilli"},
        "discouraged": {"apple", "jute"}
    },
    "alluvial": {
        "preferred": {"rice", "banana", "coconut", "maize", "jute", "cotton"},
        "discouraged": {"apple"}
    },
    "laterite": {
        "preferred": {"coffee", "coconut", "banana", "cashew"},
        "discouraged": {"cotton", "chickpea", "apple"}
    },
    "sandy": {
        "preferred": {"watermelon", "muskmelon", "groundnut"},
        "discouraged": {"rice", "cotton", "jute", "apple"}
    }
}

class RegionalAgronomyValidator:
    """
    Validates classifier crop predictions against physical agronomic boundaries,
    Telangana/AP regional climate restrictions, season, and soil types.
    """

    @classmethod
    def validate_inputs(
        cls, n: float, p: float, k: float, temp: float, humidity: float, ph: float, rain: float
    ) -> List[str]:
        warnings = []
        if n < 0 or n > 250:
            warnings.append(f"Nitrogen ({n} kg/ha) is outside standard arable range (0-200 kg/ha).")
        if p < 0 or p > 200:
            warnings.append(f"Phosphorus ({p} kg/ha) is outside standard arable range (5-150 kg/ha).")
        if k < 0 or k > 250:
            warnings.append(f"Potassium ({k} kg/ha) is outside standard arable range (5-200 kg/ha).")
        if temp < 5.0 or temp > 50.0:
            warnings.append(f"Temperature ({temp}°C) is outside viable biological limits (10-45°C).")
        if humidity < 10.0 or humidity > 100.0:
            warnings.append(f"Humidity ({humidity}%) must be between 10% and 100%.")
        if ph < 3.5 or ph > 10.0:
            warnings.append(f"Soil pH ({ph}) indicates extreme soil condition (arable range: 5.0-8.5).")
        elif ph < 5.5:
            warnings.append(f"Soil pH ({ph}) is acidic; lime or dolomite application recommended.")
        elif ph > 8.2:
            warnings.append(f"Soil pH ({ph}) is alkaline/calcareous; gypsum and organic compost recommended.")
        if rain < 0 or rain > 3500:
            warnings.append(f"Rainfall ({rain} mm) is outside realistic seasonal range (20-3000 mm).")
        return warnings

    @classmethod
    def evaluate_crop_suitability(
        cls,
        crop: str,
        probability: float,
        temp: float,
        rain: float,
        ph: float = 6.5,
        location: Optional[str] = None,
        season: Optional[str] = None,
        soil_type: Optional[str] = None
    ) -> Tuple[bool, float, List[str]]:
        """
        Adjusts prediction confidence and returns agronomic warnings based on agro-ecological fit.
        Returns: (is_viable, adjusted_confidence, crop_warnings)
        """
        crop_lower = crop.lower()
        warnings = []
        adjusted_prob = probability
        is_viable = True

        norm_loc = (location or "").strip().lower()
        norm_season = (season or "").strip().lower()
        norm_soil = (soil_type or "").strip().lower()

        is_telangana_or_ap = (
            "telangana" in norm_loc or "andhra" in norm_loc or
            norm_loc in TELANGANA_DISTRICTS or norm_loc in AP_DISTRICTS or
            any(d in norm_loc for d in TELANGANA_DISTRICTS) or
            any(d in norm_loc for d in AP_DISTRICTS)
        )

        # 1. Temperate Crop Restrictions in Deccan Plateau / Tropical Plains
        if crop_lower in TEMPERATE_RESTRICTED_CROPS:
            if is_telangana_or_ap or temp > 20.0:
                is_viable = False
                adjusted_prob = 0.01
                warnings.append(
                    f"{crop.capitalize()} requires 800-1000 winter chilling hours (<7°C) and is not commercially viable in tropical plains of Telangana/AP."
                )
                return is_viable, adjusted_prob, warnings

        # 2. Coffee altitude & soil restriction
        if crop_lower in HIGH_ALTITUDE_RESTRICTED_CROPS:
            # Coffee requires acidic soil (pH < 6.5), high rainfall (>1200 mm), and high elevation
            if is_telangana_or_ap and "araku" not in norm_loc and "visakhapatnam" not in norm_loc:
                is_viable = False
                adjusted_prob = 0.001
                warnings.append(
                    "Coffee requires high-altitude (>900m MSL) shade-grown plantation conditions (e.g. Araku Valley); unviable in plains."
                )
            elif ph > 7.0 or rain < 120.0 or "black" in norm_soil:
                is_viable = False
                adjusted_prob = 0.001
                warnings.append(
                    "Coffee requires acidic laterite soils (pH 5.0-6.5) and high humidity; unviable in alkaline or black soils."
                )
            else:
                adjusted_prob *= 0.20

        # 3. Water and Moisture Constraints
        if crop_lower == "rice" and rain < 205.0:
            warnings.append(
                "Rice has high water demand (>1200 mm seasonal requirement); assured canal/tank wetland irrigation is necessary."
            )
            adjusted_prob *= 0.92

        if crop_lower == "jute" and (rain < 120.0 or not is_telangana_or_ap):
            if "andhra" not in norm_loc and "godavari" not in norm_loc:
                warnings.append("Jute requires prolonged standing water and high relative humidity (>80%).")

        # 4. Seasonal Constraints
        if norm_season in SEASONAL_CROPS:
            rules = SEASONAL_CROPS[norm_season]
            if crop_lower in rules.get("warning_crops", set()):
                adjusted_prob *= 0.70
                warnings.append(
                    f"{crop.capitalize()} is off-season for {season.capitalize()} cultivation; yield may be severely impacted."
                )
            elif crop_lower in rules.get("irrigation_dependent", set()):
                warnings.append(
                    f"{crop.capitalize()} grown in {season.capitalize()} requires assured supplemental irrigation."
                )

        # 5. Soil Suitability Constraints
        matched_soil_key = None
        for key in SOIL_SUITABILITY:
            if key in norm_soil:
                matched_soil_key = key
                break

        if matched_soil_key:
            soil_rules = SOIL_SUITABILITY[matched_soil_key]
            if crop_lower in soil_rules.get("preferred", set()):
                adjusted_prob = min(0.99, adjusted_prob * 1.05)
            elif crop_lower in soil_rules.get("discouraged", set()):
                adjusted_prob *= 0.65
                warnings.append(
                    f"{crop.capitalize()} has poor performance in {soil_type} soil due to texture or drainage constraints."
                )

        return is_viable, round(float(adjusted_prob), 4), warnings
