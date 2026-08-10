import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../../core/localization/app_language.dart';

/// Singleton service that speaks step instructions aloud using TTS.
/// Each step of the orchard planning flow has a short, farmer-friendly
/// instruction in 4 languages.
class StepVoiceGuideService {
  static final StepVoiceGuideService _instance = StepVoiceGuideService._internal();
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
      await _tts.setSpeechRate(0.45); // Slow, clear speech for farmers
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
      'en': 'Upload your land survey document. You can take a photo, upload a PDF, or select an image from your gallery.',
      'hi': 'अपनी ज़मीन का सर्वे नक्शा अपलोड करें। आप फोटो ले सकते हैं, PDF अपलोड कर सकते हैं, या गैलरी से चुन सकते हैं।',
      'te': 'మీ భూమి సర్వే పటాన్ని అప్‌లోడ్ చేయండి. మీరు ఫోటో తీయవచ్చు, PDF అప్‌లోడ్ చేయవచ్చు, లేదా గ్యాలరీ నుండి ఎంచుకోవచ్చు.',
      'kn': 'ನಿಮ್ಮ ಭೂಮಿ ಸರ್ವೆ ನಕ್ಷೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ನೀವು ಫೋಟೋ ತೆಗೆಯಬಹುದು, PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು, ಅಥವಾ ಗ್ಯಾಲರಿಯಿಂದ ಆಯ್ಕೆ ಮಾಡಬಹುದು.',
    },
    // Step 1: Take Photos
    1: {
      'en': 'Take photos of your farm from 4 directions — front, left, right, and back. This helps our experts assess your land.',
      'hi': 'अपने खेत की 4 दिशाओं से फोटो लें — आगे, बाएं, दाएं और पीछे। इससे हमारे विशेषज्ञ आपकी ज़मीन का मूल्यांकन कर सकते हैं।',
      'te': 'మీ పొలం యొక్క 4 దిశల నుండి ఫోటోలు తీయండి — ముందు, ఎడమ, కుడి మరియు వెనుక. ఇది మా నిపుణులకు మీ భూమిని అంచనా వేయడంలో సహాయపడుతుంది.',
      'kn': 'ನಿಮ್ಮ ಜಮೀನಿನ 4 ದಿಕ್ಕುಗಳಿಂದ ಫೋಟೋ ತೆಗೆಯಿರಿ — ಮುಂದೆ, ಎಡ, ಬಲ ಮತ್ತು ಹಿಂದೆ. ಇದು ನಮ್ಮ ತಜ್ಞರಿಗೆ ನಿಮ್ಮ ಭೂಮಿಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    },
    // Step 2: Location
    2: {
      'en': 'Confirm your farm location. Tap detect location to automatically find it, or enter your village and district manually.',
      'hi': 'अपने खेत की लोकेशन की पुष्टि करें। अपने आप लोकेशन पता लगाने के लिए बटन दबाएं, या गांव और जिले का नाम खुद भरें।',
      'te': 'మీ పొలం స్థానాన్ని ధృవీకరించండి. స్వయంచాలకంగా గుర్తించడానికి బటన్ నొక్కండి, లేదా మీ గ్రామం మరియు జిల్లాను మాన్యువల్‌గా నమోదు చేయండి.',
      'kn': 'ನಿಮ್ಮ ಜಮೀನಿನ ಸ್ಥಳವನ್ನು ದೃಢೀಕರಿಸಿ. ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಹಚ್ಚಲು ಬಟನ್ ಒತ್ತಿ, ಅಥವಾ ನಿಮ್ಮ ಹಳ್ಳಿ ಮತ್ತು ಜಿಲ್ಲೆಯನ್ನು ಹಸ್ತಚಾಲಿತವಾಗಿ ನಮೂದಿಸಿ.',
    },
    // Step 3: Land Details
    3: {
      'en': 'Select your water sources and soil types. You can select multiple options. Then fill in your other land details and preferences.',
      'hi': 'अपने पानी के स्रोत और मिट्टी का प्रकार चुनें। आप एक से ज़्यादा विकल्प चुन सकते हैं। फिर अपनी ज़मीन की अन्य जानकारी और प्राथमिकताएं भरें।',
      'te': 'మీ నీటి వనరులు మరియు నేల రకాలను ఎంచుకోండి. మీరు బహుళ ఎంపికలను ఎంచుకోవచ్చు. తర్వాత మీ ఇతర భూమి వివరాలు మరియు ప్రాధాన్యతలను నమోదు చేయండి.',
      'kn': 'ನಿಮ್ಮ ನೀರಿನ ಮೂಲಗಳು ಮತ್ತು ಮಣ್ಣಿನ ಪ್ರಕಾರಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ. ನೀವು ಹಲವು ಆಯ್ಕೆಗಳನ್ನು ಆರಿಸಬಹುದು. ನಂತರ ನಿಮ್ಮ ಇತರ ಭೂಮಿ ವಿವರಗಳು ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ನಮೂದಿಸಿ.',
    },
  };
}
