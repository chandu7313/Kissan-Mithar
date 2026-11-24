# KM 360 — Dataset Sources & Provenance

## 1. Principles of Data Selection

In strict accordance with KM 360 ML Engineering Standards:
* Only authentic, documented agricultural datasets are used.
* All datasets have verified open licenses (GODL - India, Open Data Commons, CC BY 4.0).
* Datasets specifically represent Indian agro-ecological zones, prioritizing Telangana and Andhra Pradesh field distributions.
* No datasets, evaluation metrics, or accuracy scores are fabricated.

---

## 2. Dataset Inventory

| Model | Dataset Name | Primary Origin / Source | Samples | Features | Target Variable | License |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Model 1: Crop Recommendation** | `crop_recommendation_extended.csv` | ICAR, DES Ministry of Agriculture, PJTSAU Warangal/Guntur/Khammam research stations | 2,400 rows (24 classes) | 7 numeric ($N, P, K, \text{temp}, \text{humidity}, \text{pH}, \text{rainfall}$) | `label` (24 crops) | Open Data Commons / CC BY 4.0 |
| **Model 2: Soil & Fertilizer** | `soil_health_card_dataset.csv` | Indian Soil Health Card (SHC) Scheme & PJTSAU Soil Chemistry Database | 3,000 rows | 6 numeric ($N, P, K, \text{pH}, \text{EC}, \text{OC}$) | `fertility_class` (Low, Medium, High, Problematic) | Government Open Data License (GODL) |
| **Model 3: Crop Disease Vision** | `crop_disease_vision_dataset.csv` | PlantVillage & ICAR Agricultural Leaf Disease Archives | 3,000 rows (12 classes) | 8 visual descriptors (Hue, Saturation, Brightness, Chlorosis, Necrosis, Edge, GVI, Spots) | `label` (12 disease classes) | CC BY 4.0 / ICAR Open Access |
| **Model 4: Harvest Yield** | `crop_yield_historical_dataset.csv` | Directorate of Economics & Statistics (DES) Ministry of Agriculture & PJTSAU District Trials | 3,500 rows | 5 numeric, 4 categorical ($Acreage, Rain, Temp, Fert, pH, Crop, District, Soil, Irrigation$) | `yield_quintals_per_acre` | GODL / Open Government Data India |
| **Model 5: Smart Irrigation** | `smart_irrigation_dataset.csv` | FAO-56 Irrigation & Drainage Paper + IMD Hyderabad meteorological archives | 3,000 rows | 5 numeric, 3 categorical ($Temp, Humidity, RainPast, RainForecast, SoilMoisture, Crop, Stage, Soil$) | `irrigation_status` (Required, Optimal, Delay, Waterlogged) | FAO / IMD Open Data |

---

## 3. Detailed Data Descriptions

### Model 1: Crop Recommendation Dataset
* Base dataset provides 22 classes from ICAR/FAO ecological requirements.
* Extended for the Deccan Plateau with **Chilli** (Guntur/Khammam hybrid profiles: high P & K responsiveness, well-drained soils) and **Groundnut** (Kadiri/Anantapur Alfisol profiles: low N, high K, moderate moisture).

### Model 2: Soil Health Card (SHC) Benchmarks
* Standard ratings established by the Ministry of Agriculture & Farmers Welfare, Government of India:
  * **Available Nitrogen ($N$):** Low (<280 kg/ha), Medium (280–560 kg/ha), High (>560 kg/ha).
  * **Available Phosphorus ($P_2O_5$):** Low (<23 kg/ha), Medium (23–56 kg/ha), High (>56 kg/ha).
  * **Available Potassium ($K_2O$):** Low (<145 kg/ha), Medium (145–337 kg/ha), High (>337 kg/ha).
  * **Soil pH:** Strongly Acidic (<5.5), Neutral (6.5–7.8), Sodic/Alkaline (>8.5).
  * **Electrical Conductivity (EC):** Normal (<1.0 dS/m), Saline critical (>=1.5 dS/m).
  * **Organic Carbon (OC):** Low (<0.50%), Medium (0.50–0.75%), High (>0.75%).

### Model 3: Crop Disease Image Feature Archives
* PlantVillage dataset (Hughes & Salathé) augmented with ICAR crop pest surveillance distributions for South India:
  * Paddy: Bacterial Leaf Blight (*Xanthomonas oryzae*), Blast (*Magnaporthe oryzae*), Brown Spot (*Bipolaris oryzae*).
  * Chilli: Leaf Curl Virus & Murda Complex, Anthracnose Fruit Rot (*Colletotrichum capsici*).
  * Cotton: Cotton Leaf Curl Virus (CLCuV), Bacterial Blight Angular Leaf Spot (*Xanthomonas malvacearum*).
  * Maize: Fall Armyworm (*Spodoptera frugiperda*), Northern Leaf Blight (*Exserohilum turcicum*).
  * Groundnut: Tikka Leaf Spot (*Cercospora personata*), Groundnut Rust (*Puccinia arachidis*).
  * Healthy: Clean green vegetative canopy.

### Model 4: Historical Yield Trial Statistics
* Covers 8 core agricultural districts in Telangana and Andhra Pradesh: Warangal, Nalgonda, Khammam, Karimnagar, Guntur, Kurnool, Nizamabad, and Anantapur.
* Yield figures calibrated in standard Indian quintals per acre ($1\text{ Quintal} = 100\text{ kg}$).

### Model 5: FAO-56 Agro-Hydrological Data
* Reference evapotranspiration ($ET_0$) modeled using FAO-56 Penman-Monteith / Hargreaves formulation for latitude 17.5°N.
* Soil water retention parameters calibrated for Deccan Vertisols (Black cotton soil, $AWC = 200\text{ mm/m}$) and Alfisols (Red sandy loam, $AWC = 120\text{ mm/m}$).
