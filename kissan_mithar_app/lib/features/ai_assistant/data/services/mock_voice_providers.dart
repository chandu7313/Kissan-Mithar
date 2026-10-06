import 'dart:async';
import 'package:flutter_tts/flutter_tts.dart';
import '../../domain/services/voice_service_interface.dart';

class LocalTTSProvider implements TTSProvider {
  final FlutterTts _flutterTts = FlutterTts();
  Function()? _onCompletion;

  @override
  Future<void> init() async {
    await _flutterTts.setLanguage("en-US");
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);

    _flutterTts.setCompletionHandler(() {
      if (_onCompletion != null) {
        _onCompletion!();
      }
    });
  }

  @override
  Future<void> speak(String text, {String? languageCode}) async {
    if (languageCode != null) {
      await _flutterTts.setLanguage(languageCode);
    }
    await _flutterTts.speak(text);
  }

  @override
  Future<void> stop() async {
    await _flutterTts.stop();
  }

  @override
  void setOnCompletionCallback(Function()? callback) {
    _onCompletion = callback;
  }

  @override
  void setOnProgressCallback(Function(String text, int startOffset, int endOffset, String word)? callback) {
    _flutterTts.setProgressHandler(callback ?? (text, startOffset, endOffset, word) {});
  }
}

class MockSTTProvider implements STTProvider {
  bool _isListening = false;
  Timer? _mockTimer;

  @override
  bool get isListening => _isListening;

  @override
  Future<bool> init() async {
    return true; // Pretend it initialized successfully
  }

  @override
  Future<void> startListening({required Function(String text) onResult, String? languageCode}) async {
    _isListening = true;
    
    // Simulate thinking/listening, then giving a fake response after 3 seconds.
    // In a real implementation, this would use speech_to_text library
    _mockTimer = Timer(const Duration(seconds: 3), () {
      if (_isListening) {
        onResult("I need help with my cotton crop. There are some insects.");
        stopListening();
      }
    });
  }

  @override
  Future<void> stopListening() async {
    _isListening = false;
    _mockTimer?.cancel();
  }
}

class MockAIOrchestrator implements AIOrchestrator {
  @override
  Future<String> processIntent(String text, String languageCode) async {
    await Future.delayed(const Duration(seconds: 2)); // Simulate network processing

    final lower = text.toLowerCase();
    if (lower.contains('cotton') || lower.contains('insect') || lower.contains('disease')) {
      return "It looks like insects may be affecting your cotton crop. Please take a clear photo of the leaf so we can check it.";
    } else if (lower.contains('weather') || lower.contains('rain')) {
      return "Tomorrow in Gadwal, there is a 60 percent chance of rain. Would you like me to tell you the full day's forecast?";
    } else if (lower.contains('fertilizer')) {
      return "I know you are growing cotton on your 4.5-acre farm. Do you want help with fertilizer for this crop?";
    } else if (lower.contains('tractor') || lower.contains('machinery')) {
      return "Okay. I can help you find a tractor near your farm.";
    } else if (lower.contains('labour') || lower.contains('workers')) {
      return "I can help you find labour groups near your farm.";
    } else if (lower.contains('sell')) {
      return "Okay. Let's create your crop listing. How much yield do you expect to harvest?";
    }
    
    return "I understood you need help. Could you give me a few more details about your farm?";
  }
}
