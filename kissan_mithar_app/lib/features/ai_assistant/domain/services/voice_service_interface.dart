abstract class TTSProvider {
  Future<void> init();
  Future<void> speak(String text, {String? languageCode});
  Future<void> stop();
  void setOnProgressCallback(Function(String text, int startOffset, int endOffset, String word)? callback);
  void setOnCompletionCallback(Function()? callback);
}

abstract class STTProvider {
  Future<bool> init();
  Future<void> startListening({required Function(String text) onResult, String? languageCode});
  Future<void> stopListening();
  bool get isListening;
}

abstract class AIOrchestrator {
  Future<String> processIntent(String text, String languageCode);
}
