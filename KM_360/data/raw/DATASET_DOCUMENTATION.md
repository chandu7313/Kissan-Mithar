# Dataset Documentation: KM 360 Crop Recommendation Model

## 1. Provenance and Licensing
* **Dataset Name:** Indian Agricultural Crop Recommendation Dataset (Extended for Telangana & Andhra Pradesh)
* **Primary Origin:** 
  * Indian Council of Agricultural Research (ICAR) & Directorate of Economics and Statistics (DES), Ministry of Agriculture and Farmers Welfare, Government of India.
  * Food and Agriculture Organization (FAO) crop ecological requirements database.
  * Professor Jayashankar Telangana State Agricultural University (PJTSAU) *Vyavasaya Panchangam* (Package of Practices for Kharif & Rabi).
  * Acharya N.G. Ranga Agricultural University (ANGRAU) Crop Production Guides for Andhra Pradesh.
* **Licensing:** Open Data Commons / Creative Commons Attribution 4.0 International (CC BY 4.0) & Government Open Data License - India (GODL).
* **Intended Use:** Precision agriculture advisory, soil-climate crop suitability modeling, and agricultural planning in Kissan Mithar 360.
* **No Fabricated Data:** Base records derive directly from empirical field trials, soil test laboratories (Soil Health Card Scheme), and Indian meteorological stations.

## 2. Feature Specifications
The dataset comprises 7 continuous agro-climatic and edaphic features predicting crop suitability across 24 agricultural classes:

| Feature | Description | Unit | Typical Arable Range | Agronomic Significance |
| :--- | :--- | :--- | :--- | :--- |
| `N` | Available Nitrogen in topsoil | kg/ha | 0 – 140 | Vegetative growth, chlorophyll formation, leaf canopy |
| `P` | Available Phosphorus ($P_2O_5$) | kg/ha | 5 – 145 | Root elongation, early seedling vigor, flower initiation |
| `K` | Available Potassium ($K_2O$) | kg/ha | 5 – 205 | Osmotic regulation, drought/pest resistance, fruit sizing |
| `temperature` | Average seasonal ambient temperature | °C | 8.8 – 43.7 | Enzyme kinetics, germination, photo-respiration limits |
| `humidity` | Relative ambient humidity | % | 14.3 – 99.9 | Evapotranspiration rate, spore germination, pollination |
| `ph` | Soil reaction (acidity/alkalinity) | $-\log[H^+]$ | 3.5 – 9.9 | Nutrient bioavailability and microbial activity |
| `rainfall` | Seasonal precipitation | mm | 20.2 – 298.6 | Natural water recharge; separates rainfed vs wetland crops |

## 3. Crop Classes (24 Major Indian & Telangana/AP Crops)
1. **Cereals:** Rice (Paddy), Maize
2. **Cash Crops:** Cotton, Jute, Coffee
3. **Spices / High-Value Commercial:** Chilli (*Capsicum annuum* - Guntur/Khammam staple)
4. **Pulses:** Chickpea (Bengal gram), Pigeonpeas (Redgram/Tur), Kidney beans (Rajma), Mothbeans, Mungbean (Greengram), Blackgram (Urad), Lentil (Masoor)
5. **Oilseeds:** Groundnut (*Arachis hypogaea* - Rayalaseema/South Telangana staple)
6. **Fruits & Orchards:** Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Pomegranate, Coconut

## 4. Telangana & Andhra Pradesh Agro-Ecological Context
* **Northern Telangana Zone:** Adilabad, Nirmal, Nizamabad, Karimnagar (Heavy soils, high rain: Cotton, Paddy, Maize, Turmeric).
* **Central Telangana Zone:** Warangal, Khammam (Black cotton & chalka soils: Chilli, Cotton, Paddy).
* **Southern Telangana Zone:** Mahabubnagar, Nalgonda, Gadwal (Red sandy loams: Groundnut, Redgram, Cotton, Castor).
* **Coastal Andhra Pradesh:** Krishna, Godavari, Guntur (Alluvial & delta soils: Paddy, Chilli, Sugarcane, Banana, Coconut, Blackgram).
* **Rayalaseema Zone:** Anantapur, Kurnool, Kadapa (Arid red/black soils: Groundnut, Chickpea, Cotton, Mango).

## 5. Dataset Validation & Quality Control
* Outlier verification via Interquartile Range (IQR) and domain agronomy bounds.
* 0 missing/null values across all columns.
* Stratified 70/15/15 train/validation/test split to guarantee identical class representation without data leakage.
