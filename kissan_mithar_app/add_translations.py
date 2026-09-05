import json

files = {
    'lib/l10n/app_en.arb': {
        "farmLandSize": "1. Farm Land Size",
        "lessThan1Acre": "< 1 Acre",
        "oneToThreeAcres": "1 - 3 Acres",
        "threeToFiveAcres": "3 - 5 Acres",
        "above5Acres": "Above 5 Acres",
        "waterAvailability": "2. Water Availability",
        "borewell": "Borewell",
        "canal": "Canal",
        "drip": "Drip",
        "rainFed": "Rain-fed",
        "soilTypeSection": "3. Soil Type",
        "redSoil": "Red Soil",
        "blackSoil": "Black Soil",
        "sandySoil": "Sandy Soil",
        "forestSoil": "Forest Soil",
        "lateriteSoil": "Laterite Soil",
        "alluvialSoil": "Alluvial Soil",
        "salineSoil": "Saline Soil",
        "voiceNoteForExpert": "4. Voice Note for Expert (Optional)",
        "recordingTapStop": "Recording... Tap stop when finished",
        "tapMicToSpeak": "Tap mic to speak your questions or specific requests in your language."
    },
    'lib/l10n/app_hi.arb': {
        "farmLandSize": "1. खेत का आकार",
        "lessThan1Acre": "< 1 एकड़",
        "oneToThreeAcres": "1 - 3 एकड़",
        "threeToFiveAcres": "3 - 5 एकड़",
        "above5Acres": "5 एकड़ से अधिक",
        "waterAvailability": "2. पानी की उपलब्धता",
        "borewell": "बोरवेल",
        "canal": "नहर",
        "drip": "ड्रिप",
        "rainFed": "वर्षा आधारित",
        "soilTypeSection": "3. मिट्टी का प्रकार",
        "redSoil": "लाल मिट्टी",
        "blackSoil": "काली मिट्टी",
        "sandySoil": "बलुई मिट्टी",
        "forestSoil": "जंगली मिट्टी",
        "lateriteSoil": "लेटराइट मिट्टी",
        "alluvialSoil": "जलोढ़ मिट्टी",
        "salineSoil": "खारी मिट्टी",
        "voiceNoteForExpert": "4. विशेषज्ञ के लिए वॉइस नोट (वैकल्पिक)",
        "recordingTapStop": "रिकॉर्डिंग हो रही है... पूरा होने पर स्टॉप टैप करें",
        "tapMicToSpeak": "अपनी भाषा में अपने प्रश्न या विशिष्ट अनुरोध बोलने के लिए माइक पर टैप करें।"
    },
    'lib/l10n/app_te.arb': {
        "farmLandSize": "1. పొలం విస్తీర్ణం",
        "lessThan1Acre": "< 1 ఎకరం",
        "oneToThreeAcres": "1 - 3 ఎకరాలు",
        "threeToFiveAcres": "3 - 5 ఎకరాలు",
        "above5Acres": "5 ఎకరాలకు పైగా",
        "waterAvailability": "2. నీటి లభ్యత",
        "borewell": "బోరుబావి",
        "canal": "కాలువ",
        "drip": "డ్రిప్",
        "rainFed": "వర్షాధారం",
        "soilTypeSection": "3. నేల రకం",
        "redSoil": "ఎర్ర నేల",
        "blackSoil": "నల్ల రేగడి నేల",
        "sandySoil": "ఇసుక నేల",
        "forestSoil": "అటవీ నేల",
        "lateriteSoil": "ల్యాటరైట్ నేల",
        "alluvialSoil": "ఒండ్రు నేల",
        "salineSoil": "చౌడు నేల",
        "voiceNoteForExpert": "4. నిపుణుల కోసం వాయిస్ నోట్ (ఐచ్ఛికం)",
        "recordingTapStop": "రికార్డింగ్ అవుతోంది... పూర్తయిన తర్వాత ఆపడానికి నొక్కండి",
        "tapMicToSpeak": "మీ ప్రశ్నలు లేదా నిర్దిష్ట అభ్యర్థనలను మీ భాషలో చెప్పడానికి మైక్‌ను నొక్కండి."
    },
    'lib/l10n/app_kn.arb': {
        "farmLandSize": "1. ಕೃಷಿ ಭೂಮಿಯ ಗಾತ್ರ",
        "lessThan1Acre": "< 1 ಎಕರೆ",
        "oneToThreeAcres": "1 - 3 ಎಕರೆ",
        "threeToFiveAcres": "3 - 5 ಎಕರೆ",
        "above5Acres": "5 ಎಕರೆಗಿಂತ ಹೆಚ್ಚು",
        "waterAvailability": "2. ನೀರಿನ ಲಭ್ಯತೆ",
        "borewell": "ಬೋರ್‌ವೆಲ್",
        "canal": "ಕಾಲುವೆ",
        "drip": "ಹನಿ ನೀರಾವರಿ",
        "rainFed": "ಮಳೆಯಾಶ್ರಿತ",
        "soilTypeSection": "3. ಮಣ್ಣಿನ ಪ್ರಕಾರ",
        "redSoil": "ಕೆಂಪು ಮಣ್ಣು",
        "blackSoil": "ಕಪ್ಪು ಮಣ್ಣು",
        "sandySoil": "ಮರಳು ಮಣ್ಣು",
        "forestSoil": "ಅರಣ್ಯ ಮಣ್ಣು",
        "lateriteSoil": "ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು",
        "alluvialSoil": "ಮೆಕ್ಕಲು ಮಣ್ಣು",
        "salineSoil": "ಉಪ್ಪು ಮಣ್ಣು",
        "voiceNoteForExpert": "4. ತಜ್ಞರಿಗಾಗಿ ಧ್ವನಿ ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ)",
        "recordingTapStop": "ರೆಕಾರ್ಡಿಂಗ್ ಆಗುತ್ತಿದೆ... ಮುಗಿದ ನಂತರ ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
        "tapMicToSpeak": "ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳು ಅಥವಾ ನಿರ್ದಿಷ್ಟ ವಿನಂತಿಗಳನ್ನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಲು ಮೈಕ್ ಟ್ಯಾಪ್ ಮಾಡಿ."
    }
}

for file_path, translations in files.items():
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    data.update(translations)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Translations added successfully.")
