# Kissan Mithar Service Booking via Conversational Assistant
## Direct Conversational Execution of Machinery, Labour, Expert & Procurement

---

### 1. Vision: Zero-Navigation Farm Operations

Instead of forcing farmers through rigid web/mobile forms, the conversational assistant maps natural language intents directly to existing backend services.

```
                              +---------------------------------------+
                              |         CONVERSATIONAL ROUTER         |
                              +-------------------+-------------------+
                                                  |
           +--------------------+-----------------+--------------------+--------------------+
           |                    |                                      |                    |
           v                    v                                      v                    v
+--------------------+ +--------------------+                 +--------------------+ +--------------------+
| MACHINERY BOOKING  | |   LABOUR BOOKING   |                 |   EXPERT BOOKING   | | AGRI-BAZAAR SOURCING|
+--------------------+ +--------------------+                 +--------------------+ +--------------------+
| "Repu 5 acres lo   | | "Maa village lo 10 |                 | "Agronomist tho     | | "Naaku 50 bags   |
| ploughing ki       | | mandi harvesting   |                 | video call          | | paddy ammadaniki |
| tractor kavali"    | | labour kavali"     |                 | matladali"         | | buyers unnara?"  |
+--------------------+ +--------------------+                 +--------------------+ +--------------------+
           |                    |                                      |                    |
           v                    v                                      v                    v
`createMachineryReq`   `createLabourRequest`                 `scheduleConsultation` `createAgriListing`
```

---

### 2. Service 1: Machinery Booking

* **Trigger Utterances:**
  * Telugu: *"Repu tractor available unda?"*, *"Drone spraying machine rent ki kavali."*
  * Hindi: *"Khet me juttai ke liye tractor chahiye."*
  * English: *"I need a drone sprayer for 4 acres of cotton tomorrow."*
* **Required Parameters:** `equipmentType`, `acreage`, `preferredDate`, `location`
* **Underlying Service:** Reuses GPS coordinates from `Farmer` profile; queries local operators; creates reservation in database.
* **Confirmation Card:** Displays operator photo, tractor HP/drone model, hourly rate, and driver contact button.

---

### 3. Service 2: Agricultural Labour Allocation

* **Trigger Utterances:**
  * Telugu: *"Paddy transplanting ki 10 mandi coolilu kavali."*
  * Hindi: *"Dhhan ropai ke liye 8 majdoor chahiye."*
* **Required Parameters:** `taskType` (TRANSPLANTING, WEEDING, HARVESTING, SPRAYING), `labourersRequired`, `preferredStartDate`, `durationDays`, `dailyWage`
* **Underlying Service:** Calls `LabourService.createRequest()` directly, automatically setting `urgency` based on farmer conversational context.
* **Real-time Staff Broadcast:** Instantly broadcasts the request over Socket.IO to the staff admin dashboard (`room:staff`).

---

### 4. Service 3: Certified Agronomist Consultations

* **Trigger Utterances:**
  * Telugu: *"Agronomist doctor tho call matladali."*
  * Hindi: *"Fasal doctor se baat karni hai."*
* **Required Parameters:** `category`, `mode` (VOICE, VIDEO, CHAT), `preferredTimeSlot`, `farmerLanguage`
* **Underlying Service:** Calls `ConsultationService.create()` with matching expert availability.

---

### 5. Service 4: Doorstep Soil Sample Collection

* **Trigger Utterances:**
  * Telugu: *"Maa bhoomi soil test cheyinchali."*
  * Hindi: *"Mitti ki jaanch karwani hai."*
* **Execution:**
  1. Assistant asks: *"How many sample points across your farm would you like tested?"*
  2. Field executive pickup request is generated with the farmer's GPS pin.
  3. Status tracking card appears in the chat.
