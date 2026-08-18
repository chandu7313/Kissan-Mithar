import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../../core/localization/app_language.dart';

/// Singleton service that speaks step instructions aloud using TTS.
/// Each step of the orchard planning flow has a short, farmer-friendly
/// instruction in 4 languages.
class StepVoiceGuideService {
  static final StepVoiceGuideService _instance =
      StepVoiceGuideService._internal();
  factory StepVoiceGuideService() => _instance;

  late final FlutterTts _tts;
  bool _isInitialized = false;
  bool _isSpeaking = false;

  StepVoiceGuideService._internal() {
    _tts = FlutterTts();
  }

  Future<void> _ensureInitialized() async {
    if (_isInitialized) return;
    try {
      await _tts.setSpeechRate(
        0.45,
      ); // Adjusted speed (Slightly slower than default 0.5)
      await _tts.setVolume(1.0);
      await _tts.setPitch(1.0);

      _tts.setStartHandler(() {
        _isSpeaking = true;
      });
      _tts.setCompletionHandler(() {
        _isSpeaking = false;
      });
      _tts.setCancelHandler(() {
        _isSpeaking = false;
      });
      _tts.setErrorHandler((msg) {
        _isSpeaking = false;
        debugPrint('[TTS Error]: $msg');
      });

      _isInitialized = true;
    } catch (e) {
      debugPrint('[TTS] Failed to initialize: $e');
    }
  }

  /// Speaks the instruction for the given [stepIndex] in the given [language].
  Future<void> speakStepInstruction(int stepIndex, AppLanguage language) async {
    await _ensureInitialized();

    // Stop any current speech first
    await stop();

    final instruction = _getInstruction(stepIndex, language);
    if (instruction.isEmpty) return;

    final ttsLangCode = _getTtsLanguageCode(language);
    try {
      await _tts.setLanguage(ttsLangCode);
      await _tts.speak(instruction);
    } catch (e) {
      debugPrint('[TTS] Failed to speak: $e');
    }
  }

  /// Speaks the success confirmation message.
  Future<void> speakSuccess(AppLanguage language) async {
    await _ensureInitialized();
    await stop();

    final instructions = {
      'en': 'Farm Details Submitted! Our agronomy experts are reviewing your farm profile. We will notify you once your personalized orchard plan is ready.',
      'hi': 'खेत का विवरण जमा कर दिया गया है! हमारे कृषि विशेषज्ञ आपकी प्रोफाइल की जांच कर रहे हैं। आपकी व्यक्तिगत योजना तैयार होने पर हम आपको सूचित करेंगे।',
      'te': 'పొలం వివరాలు సమర్పించబడ్డాయి! మా వ్యవసాయ నిపుణులు మీ పొలం ప్రొఫైల్‌ను సమీక్షిస్తున్నారు. మీ పండ్ల తోట ప్రణాళిక సిద్ధమైన తర్వాత మేము మీకు తెలియజేస్తాము.',
      'kn': 'ಕೃಷಿ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸಲಾಗಿದೆ! ನಮ್ಮ ಕೃಷಿ ತಜ್ಞರು ನಿಮ್ಮ ಜಮೀನಿನ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ. ನಿಮ್ಮ ತೋಟದ ಯೋಜನೆ ಸಿದ್ಧವಾದಾಗ ನಾವು ನಿಮಗೆ ತಿಳಿಸುತ್ತೇವೆ.',
    };

    final text = instructions[language.code] ?? instructions['en'] ?? '';
    if (text.isEmpty) return;

    final ttsLangCode = _getTtsLanguageCode(language);
    try {
      await _tts.setLanguage(ttsLangCode);
      await _tts.speak(text);
    } catch (e) {
      debugPrint('[TTS] Failed to speak success: $e');
    }
  }

  /// Speaks the consultation booking success confirmation message.
  Future<void> speakConsultationSuccess(AppLanguage language) async {
    await _ensureInitialized();
    await stop();

    final instructions = {
      'en': 'Consultation Booked! An expert will contact you soon.',
      'hi': 'परामर्श बुक हो गया है! एक विशेषज्ञ जल्द ही आपसे संपर्क करेगा।',
      'te': 'సంప్రదింపులు బుక్ చేయబడ్డాయి! నిపుణులు త్వరలో మిమ్మల్ని సంప్రదిస్తారు.',
      'kn': 'ಸಮಾಲೋಚನೆ ಬುಕ್ ಆಗಿದೆ! ತಜ್ಞರು ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.',
    };

    final text = instructions[language.code] ?? instructions['en'] ?? '';
    if (text.isEmpty) return;

    final ttsLangCode = _getTtsLanguageCode(language);
    try {
      await _tts.setLanguage(ttsLangCode);
      await _tts.speak(text);
    } catch (e) {
      debugPrint('[TTS] Failed to speak consultation success: $e');
    }
  }

  /// Speaks arbitrary text.
  Future<void> speak(String text) async {
    await _ensureInitialized();
    await stop();
    try {
      await _tts.speak(text);
    } catch (e) {
      debugPrint('[TTS] Failed to speak: $e');
    }
  }

  /// Stops any currently playing speech.
  Future<void> stop() async {
    if (_isSpeaking) {
      await _tts.stop();
      _isSpeaking = false;
    }
  }

  bool get isSpeaking => _isSpeaking;

  /// Maps AppLanguage to a TTS-compatible language code.
  String _getTtsLanguageCode(AppLanguage language) {
    switch (language) {
      case AppLanguage.hindi:
        return 'hi-IN';
      case AppLanguage.telugu:
        return 'te-IN';
      case AppLanguage.kannada:
        return 'kn-IN';
      case AppLanguage.english:
      default:
        return 'en-IN';
    }
  }

  /// Returns the instruction text for a given step and language.
  String _getInstruction(int stepIndex, AppLanguage language) {
    final instructions = _stepInstructions[stepIndex];
    if (instructions == null) return '';
    return instructions[language.code] ?? instructions['en'] ?? '';
  }

  /// Step-wise instructions in 4 languages.
  /// Key = step index, Value = map of language code to instruction text.
  static final Map<int, Map<String, String>> _stepInstructions = {
    // Step 0: Upload Survey Map
    0: {
      'en':
          'Take Land Survey Map from Village Panchayath office. Upload that land survey map document. You can take a photo by click on camera option, upload a PDF, or select an image from your gallery.',
      'hi':
          'ग्राम पंचायत कार्यालय से भूमि सर्वेक्षण मानचित्र लें। उस भूमि सर्वेक्षण मानचित्र दस्तावेज़ को अपलोड करें। आप कैमरा विकल्प पर क्लिक करके फोटो ले सकते हैं, PDF अपलोड कर सकते हैं, या गैलरी से चित्र चुन सकते हैं।',
      'te':
          'గ్రామ పంచాయతీ కార్యాలయం నుండి భూమి సర్వే మ్యాప్‌ను తీసుకోండి. ఆ భూమి సర్వే మ్యాప్ పత్రాన్ని అప్‌లోడ్ చేయండి. మీరు కెమెరా ఎంపికపై క్లిక్ చేసి ఫోటో తీయవచ్చు, PDF అప్‌లోడ్ చేయవచ్చు లేదా మీ గ్యాలరీ నుండి చిత్రాన్ని ఎంచుకోవచ్చు.',
      'kn':
          'ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕಚೇರಿಯಿಂದ ಭೂಮಿ ಸರ್ವೆ ನಕ್ಷೆಯನ್ನು ಪಡೆಯಿರಿ. ಆ ಭೂಮಿ ಸರ್ವೆ ನಕ್ಷೆಯ ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ನೀವು ಕ್ಯಾಮೆರಾ ಆಯ್ಕೆಯನ್ನು ಕ್ಲಿಕ್ ಮಾಡುವ ಮೂಲಕ ಫೋಟೋವನ್ನು ತೆಗೆದುಕೊಳ್ಳಬಹುದು, PDF ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು ಅಥವಾ ನಿಮ್ಮ ಗ್ಯಾಲರಿಯಿಂದ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದು.',
    },
    // Step 1: Take Photos
    1: {
      'en':
          'Take photos of your farm from 4 directions — front, left, right, and back. This helps our experts assess your land.',
      'hi':
          'अपने खेत की 4 दिशाओं से फोटो लें — आगे, बाएं, दाएं और पीछे। इससे हमारे विशेषज्ञ आपकी ज़मीन का मूल्यांकन कर सकते हैं।',
      'te':
          'మీ పొలం యొక్క 4 దిశల నుండి ఫోటోలు తీయండి — ఎడమ, కుడి ,ముందు మరియు వెనుక. ఇది మా నిపుణులకు మీ భూమిని అంచనా వేయడంలో సహాయపడుతుంది.',
      'kn':
          'ನಿಮ್ಮ ಜಮೀನಿನ 4 ದಿಕ್ಕುಗಳಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ — ಮುಂದೆ, ಎಡ, ಬಲ ಮತ್ತು ಹಿಂದೆ. ಇದು ನಮ್ಮ ತಜ್ಞರಿಗೆ ನಿಮ್ಮ ಭೂಮಿಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    },
    // Step 2: Location
    2: {
      'en':
          'Confirm your farm location. Tap detect location to automatically find it, or enter your village and district manually.',
      'hi':
          'अपने खेत की लोकेशन की पुष्टि करें। अपने आप लोकेशन पता लगाने के लिए बटन दबाएं, या गांव और जिले का नाम खुद भरें।',
      'te':
          'మీ పొలం స్థానాన్ని ధృవీకరించండి. స్వయంచాలకంగా గుర్తించడానికి బటన్ నొక్కండి, లేదా మీ గ్రామం మరియు జిల్లాను మాన్యువల్‌గా నమోదు చేయండి.',
      'kn':
          'ನಿಮ್ಮ ಜಮೀನಿನ ಸ್ಥಳವನ್ನು ದೃಢೀಕರಿಸಿ. ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚಲು ಬಟನ್ ಒತ್ತಿ, ಅಥವಾ ನಿಮ್ಮ ಹಳ್ಳಿ ಮತ್ತು ಜಿಲ್ಲೆಯನ್ನು ಹಸ್ತಚಾಲಿತವಾಗಿ ನಮೂದಿಸಿ.',
    },
    // Step 3: Orchard Preference
    3: {
      'en':
          'Select the orchard you are planning to plant. You can choose from various fruits. If you have not decided, you can select need expert suggestion.',
      'hi':
          'उस बाग का चयन करें जिसे आप लगाने की योजना बना रहे हैं। आप विभिन्न फलों में से चुन सकते हैं। यदि आपने निर्णय नहीं लिया है, तो आप विशेषज्ञ के सुझाव की आवश्यकता है का चयन कर सकते हैं।',
      'te':
          'మీరు నాటాలనుకుంటున్న పండ్ల తోటను ఎంచుకోండి. మీరు వివిధ పండ్ల నుండి ఎంచుకోవచ్చు. మీరు నిర్ణయించుకోకపోతే, నిపుణుల సూచన అవసరం అని ఎంచుకోవచ్చు.',
      'kn':
          'ನೀವು ನೆಡಲು ಯೋಜಿಸುತ್ತಿರುವ ತೋಟವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ನೀವು ವಿವಿಧ ಹಣ್ಣುಗಳಿಂದ ಆಯ್ಕೆ ಮಾಡಬಹುದು. ನೀವು ನಿರ್ಧರಿಸದಿದ್ದರೆ, ತಜ್ಞರ ಸಲಹೆಯ ಅಗತ್ಯವಿದೆ ಎಂಬುದನ್ನು ಆಯ್ಕೆ ಮಾಡಬಹುದು.',
    },
    // Step 4: Land Details
    4: {
      'en':
          'Fill in your land details and preferences. Select your water sources and soil types. You can select multiple options. Then there is mic at the end of this page you can tell anything you want.',
      'hi':
          'अपनी ज़मीन का विवरण और प्राथमिकताएं भरें। अपने पानी के स्रोत और मिट्टी का प्रकार चुनें। आप कई विकल्प चुन सकते हैं। फिर इस पेज के अंत में एक माइक है, आप जो चाहें बता सकते हैं।',
      'te':
          'మీ భూమి వివరాలు ఇవ్వండి. అలాగే నీటి వనరులు మరియు నేల రకాలను ఎంచుకోండి. ఆపై ఈ పేజీ చివర ఒక మైక్ ఉంది, మీరు ఏమైనా చెప్పాలంటే చెప్పవచ్చు.',
      'kn':
          'ನಿಮ್ಮ ಭೂಮಿಯ ವಿವರಗಳು ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ. ನಿಮ್ಮ ನೀರಿನ ಮೂಲಗಳು ಮತ್ತು ಮಣ್ಣಿನ ಪ್ರಕಾರಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ. ನಂತರ ಈ ಪುಟದ ಕೊನೆಯಲ್ಲಿ ಒಂದು ಮೈಕ್ ಇದೆ, ನೀವು ಏನು ಬೇಕಾದರೂ ಹೇಳಬಹುದು.',
    },
  };
}
