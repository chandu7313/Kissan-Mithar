# KM 360 — Model Limitations, Safety Guardrails & Human-in-the-Loop Escalation

## 1. Ethical & Responsible AI in Agriculture

Machine learning predictions in agriculture impact farmer livelihoods, input investments, and crop survival. KM 360 enforces strict safety boundaries and never presents statistical probabilities as infallible guarantees.

---

## 2. Agronomic Limitations by Model

### 1. Crop Recommendation Model
* **Limitation:** Recommending a crop based solely on topsoil chemical characteristics ($N, P, K, \text{pH}$) does not guarantee economic success. Market price volatility, access to certified seed varieties, and subsoil hardpans affect viability.
* **Guardrails:**
  * **Chilling Hours Enforced:** Blocks temperate crops (Apple) in tropical regions (Telangana/AP) regardless of soil chemistry.
  * **Altitude Constraints:** Restricts shade coffee to elevation $>900\text{m}$ MSL (e.g. Araku Valley).
  * **Rainfall Thresholds:** Flags Rice/Paddy if seasonal rainfall is below $205\text{mm}$, warning that assured tube-well/canal irrigation is mandatory.

### 2. Soil & Fertilizer Intelligence Model
* **Limitation:** Laboratory soil test results can vary with sampling depth (e.g., top 15cm vs subsoil) and time since last crop residue incorporation.
* **Guardrails & Escalation Criteria:**
  * **Extreme Reaction:** If soil pH is $< 5.0$ (severe aluminium toxicity) or $> 8.8$ (strong sodicity), the engine sets `expert_review_required = True` and mandates agricultural lime or gypsum reclamation before high-value cropping.
  * **Salinity Hazard:** If electrical conductivity $EC \ge 2.0\text{ dS/m}$, the engine warns against salt-sensitive pulses and requires drainage.
  * **Dosage Safety:** Fertilizer prescriptions strictly follow ICAR/PJTSAU STCR calibration equations and never exceed maximum permissible split-dressing guidelines.

### 3. Crop Disease Detection Vision Model
* **Limitation:** A 2D smartphone photograph cannot conclusively differentiate between fungal infection and physiological nutrient deficiency (e.g., nitrogen chlorosis vs viral chlorosis, or potassium deficiency marginal scorch vs bacterial blight).
* **Guardrails & Escalation Criteria:**
  * **Blur & Focus Filter:** If Laplacian variance $< 35.0$, the image is flagged as blurry, `expert_escalation_status` is set to `True`, and the farmer is asked to re-take the photo in bright daylight.
  * **Statutory Compliance (Insecticides Act 1968):** Pesticide recommendations provide CIBRC-registered active technical names with standard dilution rates, coupled with non-chemical cultural and bio-agent remedies.
  * **Mandatory Physical Verification:** Advises physical tests (e.g. bacterial ooze test in clear water, leaf underside loupe inspection) before purchasing chemical sprays.

### 4. Harvest Yield Prediction Model
* **Limitation:** Harvest yield is subject to catastrophic non-linear risks, such as hailstorms, cyclonic lodging during maturity, unseasonal monsoon breaks, or sudden migratory pest invasions (e.g. Fall Armyworm swarms).
* **Guardrails:**
  * Outputs **90% prediction intervals** (e.g., "23.3 to 27.7 Quintals/Acre") rather than a single deterministic number.
  * Explicitly displays the disclaimer: *"Estimated yield is a statistical model projection based on historical agronomic statistics and normal pest management. It does NOT constitute a guaranteed production volume."*

### 5. Smart Irrigation Recommendation Model
* **Limitation:** Calculates crop water balance using standardized FAO-56 crop coefficients ($K_c$). Mulching, canopy shading, and uneven soil slope can alter actual field infiltration rates.
* **Guardrails:**
  * **Rain Imminent Lockout:** If weather forecast shows $\ge 20\text{mm}$ precipitation expected within 48 hours, irrigation recommendations are suppressed (`irrigation_needed = False`) to prevent waterlogging and nitrogen leaching.
  * **Evaporative Loss Advisory:** Warns against daytime spraying between 11:00 AM and 3:30 PM, advising application during early morning (6:00–8:30 AM) or evening hours.

---

## 3. Human-in-the-Loop & Expert Escalation Workflow

When `expert_review_required: true` or `expert_escalation_status: true` is returned:
1. The AI Agent Orchestrator highlights the condition to the farmer in chat.
2. An automatic consultation ticket is generated in the Kissan Mithar Expert Portal.
3. The assigned agronomist or local Agricultural Extension Officer (AEO) reviews the soil test card or crop photograph and confirms or adjusts the treatment plan.
