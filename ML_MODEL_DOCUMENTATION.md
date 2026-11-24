# Kissan Mithar Machine Learning Architecture & Model Specifications
## Edge & Cloud Microservice Architecture (Python FastAPI)

---

### 1. Machine Learning Overview

To empower farmers with data-driven agronomic intelligence, Kissan Mithar integrates **five dedicated machine learning models** deployed via a high-performance Python FastAPI microservice:

```
                            +---------------------------------------+
                            |     FASTAPI INFERENCE MICROSERVICE    |
                            |   (Uvicorn ASGI / Python 3.11 / EC2)  |
                            +-------------------+-------------------+
                                                |
        +-------------------+-------------------+-------------------+-------------------+
        |                   |                   |                   |                   |
        v                   v                   v                   v                   v
+---------------+   +---------------+   +---------------+   +---------------+   +---------------+
|    MODEL 1    |   |    MODEL 2    |   |    MODEL 3    |   |    MODEL 4    |   |    MODEL 5    |
|     CROP      |   |  FERTILIZER   |   | PLANT DISEASE |   |     YIELD     |   |     SOIL      |
| RECOMMENDATION|   | RECOMMENDATION|   | DETECTION CNN |   |  PREDICTION   |   | CLASSIFIER    |
+---------------+   +---------------+   +---------------+   +---------------+   +---------------+
| XGBoost / RF  |   | Rule-Based ML |   | MobileNetV2   |   | Gradient Boost|   | Multi-class   |
| 22 Crop Types |   | NPK Balancing |   | 38 Classes    |   | Quintal/Acre  |   | Random Forest |
+---------------+   +---------------+   +---------------+   +---------------+   +---------------+
```

---

### 2. Model 1: Crop Recommendation Engine

* **Algorithm:** Extreme Gradient Boosting (`XGBoostClassifier`)
* **Objective:** Predicts the most suitable crop given soil chemical composition and regional climate.
* **Input Features:**
  * `N` (Nitrogen ratio in soil, kg/ha)
  * `P` (Phosphorus ratio in soil, kg/ha)
  * `K` (Potassium ratio in soil, kg/ha)
  * `temperature` (Celsius, from OpenWeather API)
  * `humidity` (Relative %, from OpenWeather API)
  * `ph` (Soil pH, 0 - 14)
  * `rainfall` (Seasonal rainfall in mm)
* **Output:** Ranked probabilities across 22 major Indian crops (Rice, Maize, Chickpea, Kidney Beans, Pigeonpeas, Mothbeans, Mungbean, Blackgram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee).
* **Benchmark Accuracy:** 97.4% on 5-fold cross-validation.
* **Endpoint:** `POST /api/v1/ml/crop-recommendation`

---

### 3. Model 2: Fertilizer Recommendation & NPK Balancing

* **Algorithm:** Hybrid Expert Rule Network & Linear Optimization
* **Objective:** Computes exact fertilizer deficits and formulates stage-wise commercial brand applications.
* **Input Features:**
  * `cropType` (Target crop)
  * `soilType` (Black, Red, Alluvial, Sandy, Clayey)
  * `landAcres` (Field area)
  * `measuredN`, `measuredP`, `measuredK`
  * `cropGrowthStage` (Basal, Vegetative, Flowering, Fruiting)
* **Output:**
  * Total elemental deficit in kg/acre
  * Commercial product recommendations: e.g., Bags of Urea (46% N), DAP (18% N, 46% P₂O₅), MOP (60% K₂O), or 19:19:19 water-soluble foliar spray.
  * Application schedule with method: broadcasting vs. drip fertigation.
* **Endpoint:** `POST /api/v1/ml/fertilizer-recommendation`

---

### 4. Model 3: Crop Disease & Pest Vision Classifier

* **Algorithm:** MobileNetV2 Deep Convolutional Neural Network (Transfer Learning)
* **Objective:** Real-time leaf lesion diagnosis from smartphone photos.
* **Input:** RGB image (224x224x3), JPEG/PNG.
* **Supported Diseases (38 categories across Indian staple crops):**
  * **Rice/Paddy:** Bacterial leaf blight, Brown spot, Leaf smut
  * **Cotton:** Bacterial blight, Curl virus, Grey mildew, Insect mite damage
  * **Chilli / Tomato:** Early blight, Late blight, Leaf curl, Septoria leaf spot, Spider mites
  * **Apple / Mango:** Scab, Black rot, Anthracnose, Powdery mildew
* **Inference Pipeline:**
  1. Image preprocessing: Normalization using ImageNet mean `[0.485, 0.456, 0.406]` and std `[0.229, 0.224, 0.225]`.
  2. Softmax classification with top-3 probability distribution.
  3. **Confidence Safeguard:** If `top1_confidence < 0.70`, the system returns `"Uncertain diagnosis"` and prompts for a clearer close-up or automatically assigns a human agronomist.
* **Latency:** ~45ms on CPU, ~12ms with TensorRT/CUDA.
* **Endpoint:** `POST /api/v1/ml/disease-detection`

---

### 5. Model 4: Yield Prediction Engine

* **Algorithm:** Random Forest Regressor & Gradient Boosting
* **Objective:** Forecasts harvest volume in quintals/acre for farmer financial planning and Agri-Bazaar forward contracts.
* **Input Features:**
  * `cropType`
  * `landAcres`
  * `irrigationType` (Drip / Canal / Rainfed)
  * `fertilizerIndex` (Sum of applied NPK)
  * `historicDistrictYield`
  * `seasonalRainfallVariance`
* **Output:** Estimated yield (mean + 90% confidence interval: e.g. `24.5 ± 2.1 Quintals/Acre`).
* **Endpoint:** `POST /api/v1/ml/yield-prediction`

---

### 6. Model 5: Soil Type Classifier

* **Algorithm:** Multi-Class Random Forest & Colorimetric Texture Mapper
* **Objective:** Infers soil classification from lab report values or color attributes when a formal soil health card is unavailable.
* **Classes:** Black Cotton Soil (Regur), Red Soil, Alluvial Soil, Laterite Soil, Sandy Loam.
* **Output:** Soil classification, water retention capacity, aeration index, and CEC (Cation Exchange Capacity).
* **Endpoint:** `POST /api/v1/ml/soil-classification`
