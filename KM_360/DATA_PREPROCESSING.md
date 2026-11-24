# KM 360 — Data Preprocessing & Feature Engineering

## 1. Data Cleaning & Validation Standards

Every model in KM 360 executes physical and biological sanity checks on incoming inputs before feature engineering:

1. **Physical Boundary Checks:**
   * Nutrient values ($N, P, K$) cannot be negative.
   * pH must fall within the chemically arable range ($3.5 \le \text{pH} \le 10.5$).
   * Relative humidity must be bounded ($0\% \le H \le 100\%$).
   * Cultivated land area must be strictly positive ($> 0\text{ acres}$).
2. **Missing Input Hydration:**
   * When optional inputs (such as electrical conductivity, organic carbon, or measured soil moisture) are omitted by the farmer, the system hydrates realistic regional baseline priors matching the farmer's registered district and soil type.
3. **Data Leakage Prevention:**
   * All feature normalization parameters (mean and standard deviation for `StandardScaler`, category registries for `OneHotEncoder`) are fit strictly on the **training fold** and only applied (transformed) on validation and test folds.

---

## 2. Feature Engineering by Model

### Model 1: Crop Recommendation
* Input Features: $N, P, K, \text{temperature}, \text{humidity}, \text{pH}, \text{rainfall}$.
* Transformations: Leakage-free `StandardScaler` followed by Random Forest feature weighting.
* Feature Importance Breakdown:
  * Rainfall: 21.55%
  * Humidity: 20.50%
  * Potassium ($K$): 19.32%
  * Phosphorus ($P$): 16.14%
  * Nitrogen ($N$): 10.79%
  * Temperature: 6.61%
  * Soil pH: 5.09%

### Model 2: Soil & Fertilizer Intelligence
* Input Features: Available $N, P, K$ (kg/ha), Soil pH, Electrical Conductivity ($EC$ in dS/m), Organic Carbon ($OC$ in %).
* Transformations:
  * Chemical rating discretizer (Low / Medium / High) based on Indian Soil Health Card criteria.
  * Acidity / Sodicity / Salinity hazard classification.
  * ICAR/PJTSAU STCR calibration:
    $$\text{Dose}_{\text{adj}} = \text{GRD} \times \begin{cases} 1.25 & \text{if Low} \\ 1.00 & \text{if Medium} \\ 0.75 & \text{if High} \end{cases}$$
  * Fertilizer active ingredient decomposition:
    * All $P_2O_5$ satisfied via DAP (18% N, 46% $P_2O_5$).
    * Balance $N$ satisfied via Neem Coated Urea (46% N).
    * $K_2O$ satisfied via MOP (60% $K_2O$).

### Model 3: Crop Disease Computer Vision
* Input: Raw image bytes (JPEG / PNG).
* Quality Preprocessing:
  1. Dimension check: minimum $64\times 64$ pixels. Resized to standard $224\times 224$ RGB.
  2. **Laplacian Blur Detection:** Grayscale conversion followed by $3\times 3$ Laplacian kernel convolution. Variance of the Laplacian response is computed; if $\text{Var} < 35.0$, the photograph is flagged as out-of-focus.
  3. RGB to HSV color space transformation:
     * Mean Hue (0–180 scale), Saturation (0–255), Value (0–255).
     * **Chlorosis Ratio:** Pixel fraction in yellow band ($15 \le H \le 35, S > 40$).
     * **Necrotic Ratio:** Pixel fraction in dark brown/black band ($H < 18 \lor H > 165, V < 100$).
     * **Green Vegetation Index (GVI):** Healthy green canopy fraction ($36 \le H \le 80, S \ge 40$).
     * **Edge Gradient Density:** Structural lesion contour complexity.

### Model 4: Harvest Yield Prediction
* Numerical Features: $LandAcres, SeasonalRainfall, Temperature, FertilizerApplied, SoilpH$.
* Categorical Features: $Crop, District, SoilType, IrrigationType$.
* Transformations:
  * `ColumnTransformer` applying `StandardScaler` to numerical features and `OneHotEncoder(handle_unknown='ignore')` to categorical features.
  * Mitscherlich-Baule diminishing return modeling for nutrient inputs.
  * Irrigation efficiency weighting (Drip: 1.22x, Canal/Borewell: 1.04x, Rainfed: 0.78x).

### Model 5: Smart Irrigation Recommendation
* Meteorological & Soil Features: $Temperature, Humidity, PastRainfall48h, ForecastRain48h, SoilMoisture, Crop, Stage, SoilType$.
* FAO-56 Calculations:
  * Hargreaves-Samani Reference Evapotranspiration ($ET_0$):
    $$ET_0 = 0.0023 \times R_a \times (T_{\text{mean}} + 17.8) \times (\Delta T)^{0.5}$$
  * Crop Evapotranspiration ($ET_c = K_c \times ET_0$).
  * Effective precipitation calculation ($P_{\text{eff}} = \max(0, \text{Rain}_{\text{forecast}} \times 0.70 - 4.0)$).
  * Net and Gross irrigation requirements adjusted for system efficiency (Drip 90%, Sprinkler 75%, Flood 55%).
  * Litre volume conversion: $1\text{ mm depth on 1 acre} = 4,047\text{ Litres}$.
