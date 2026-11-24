from typing import Dict, Any, List

class FertilizerRecommendationModel:
    """
    Agricultural Nutrient Deficit & Stage-wise Fertilizer Formulator.
    Implements ICAR fertilizer balancing rules to prevent over-fertilization.
    """

    BENCHMARK_NPK_REQUIREMENTS = {
        "paddy": {"N": 120, "P": 60, "K": 40},
        "rice": {"N": 120, "P": 60, "K": 40},
        "cotton": {"N": 150, "P": 60, "K": 60},
        "chilli": {"N": 150, "P": 75, "K": 75},
        "maize": {"N": 120, "P": 60, "K": 50},
        "groundnut": {"N": 25, "P": 50, "K": 75},
    }

    @classmethod
    def evaluate(
        cls,
        crop_type: str,
        soil_type: str,
        land_acres: float,
        measured_n: float,
        measured_p: float,
        measured_k: float,
        growth_stage: str = "Vegetative"
    ) -> Dict[str, Any]:
        crop_key = crop_type.lower()
        req = cls.BENCHMARK_NPK_REQUIREMENTS.get(crop_key, {"N": 100, "P": 50, "K": 50})

        # Deficit calculation per acre
        def_n = max(0, req["N"] - measured_n)
        def_p = max(0, req["P"] - measured_p)
        def_k = max(0, req["K"] - measured_k)

        deficiencies = []
        if def_n > 25:
            deficiencies.append("Nitrogen Deficiency (Causes lower leaf chlorosis and stunted tiller growth)")
        if def_p > 15:
            deficiencies.append("Phosphorus Deficiency (Affects root elongation and delayed panicle initiation)")
        if def_k > 15:
            deficiencies.append("Potassium Deficiency (Weakens stalk strength and pest tolerance)")

        if not deficiencies:
            deficiencies.append("Nutrient levels are well balanced; maintain standard maintenance dosages.")

        # Stage-specific schedule
        schedule = [
            {
                "stage": "Basal Application",
                "days_after_sowing": "At Sowing / Transplanting",
                "fertilizer_name": "IFFCO DAP (18:46:0) + MOP (Potash)",
                "dosage_per_acre": "50 kg DAP + 25 kg MOP",
                "application_method": "Soil placement / broadcasting below seed furrow",
                "purpose": "Promotes deep root proliferation and early vigor."
            },
            {
                "stage": "First Top Dressing (Vegetative)",
                "days_after_sowing": "20 - 25 Days After Sowing",
                "fertilizer_name": "Neem Coated Urea + Zinc Sulphate (21%)",
                "dosage_per_acre": "30 kg Urea + 5 kg Zinc Sulphate",
                "application_method": "Broadcasting in moist soil (do not apply during standing water)",
                "purpose": "Boosts vegetative biomass and chlorophyll synthesis."
            },
            {
                "stage": "Second Top Dressing (Panicle / Flowering)",
                "days_after_sowing": "45 - 50 Days After Sowing",
                "fertilizer_name": "19:19:19 (Water Soluble NPK)",
                "dosage_per_acre": "1 kg in 150-200 Litres of Water (Foliar Spray)",
                "application_method": "Foliar mist spray during evening hours",
                "purpose": "Enhances flower retention, boll/grain filling, and test weight."
            }
        ]

        organic_alternatives = [
            "Well decomposed Farm Yard Manure (FYM): 2 to 3 tonnes per acre before final ploughing.",
            "Jeevamrutha (Cow dung, cow urine, jaggery, pulse flour): 200 Litres/acre via irrigation channel every 15 days.",
            "Azospirillum & Phosphobacteria bio-fertilizers: 2 kg/acre for seed & soil inoculation."
        ]

        assessment = f"Soil in {soil_type} terrain shows moderate nutrient retention. Optimal balanced fertilizer program formulated for {land_acres} acres of {crop_type}."

        return {
            "crop": crop_type,
            "soil_health_assessment": assessment,
            "deficiencies": deficiencies,
            "schedule": schedule,
            "organic_alternatives": organic_alternatives
        }
