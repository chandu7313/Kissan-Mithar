import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/ai_state.dart';
import '../../domain/models/ai_message.dart';
import '../../data/services/mock_voice_providers.dart';
import '../../domain/services/voice_service_interface.dart';
import '../../../../core/localization/app_language.dart';

class AIAssistantStateData {
  final AIAssistantState state;
  final List<AIMessage> messages;
  final String? partialTranscript;

  AIAssistantStateData({
    required this.state,
    required this.messages,
    this.partialTranscript,
  });

  AIAssistantStateData copyWith({
    AIAssistantState? state,
    List<AIMessage>? messages,
    String? partialTranscript,
  }) {
    return AIAssistantStateData(
      state: state ?? this.state,
      messages: messages ?? this.messages,
      partialTranscript: partialTranscript, // We want to be able to set it to null sometimes
    );
  }
}

class AIAssistantNotifier extends StateNotifier<AIAssistantStateData> {
  final TTSProvider _ttsProvider;
  final STTProvider _sttProvider;
  final AIOrchestrator _orchestrator;
  AppLanguage currentLanguage = AppLanguage.english;

  AIAssistantNotifier(
    this._ttsProvider,
    this._sttProvider,
    this._orchestrator,
  ) : super(AIAssistantStateData(state: AIAssistantState.idle, messages: [])) {
    _init();
  }

  Future<void> _init() async {
    await _ttsProvider.init();
    await _sttProvider.init();

    _ttsProvider.setOnCompletionCallback(() {
      if (state.state == AIAssistantState.aiSpeaking) {
        state = state.copyWith(state: AIAssistantState.readyToListen);
      }
    });

    // Start by greeting the user
    _greetUser();
  }
  
  void updateLanguage(AppLanguage lang) {
    currentLanguage = lang;
  }

  Future<void> _greetUser() async {
    state = state.copyWith(state: AIAssistantState.aiSpeaking);
    
    String greeting = "Hello! Tell me what you need help with on your farm.";
    if (currentLanguage == AppLanguage.telugu) {
      greeting = "నమస్కారం! మీ పొలం గురించి నాకు చెప్పండి. నేను ఎలా సహాయం చేయగలను?";
    } else if (currentLanguage == AppLanguage.hindi) {
      greeting = "नमस्ते! अपने खेत के बारे में बताइए। मैं आपकी कैसे मदद कर सकता हूँ?";
    }

    _addMessage(AIMessage(text: greeting, isUser: false, timestamp: DateTime.now()));
    
    // Choose voice based on language mapping (simplified)
    String langCode = "en-IN";
    if (currentLanguage == AppLanguage.telugu) langCode = "te-IN";
    if (currentLanguage == AppLanguage.hindi) langCode = "hi-IN";

    await _ttsProvider.speak(greeting, languageCode: langCode);
  }

  void startListening() async {
    if (state.state == AIAssistantState.aiSpeaking) {
      await _ttsProvider.stop();
    }
    
    state = state.copyWith(state: AIAssistantState.listening, partialTranscript: null);

    // Provide language code based on current selection
    String langCode = "en-IN";
    if (currentLanguage == AppLanguage.telugu) langCode = "te-IN";
    if (currentLanguage == AppLanguage.hindi) langCode = "hi-IN";

    await _sttProvider.startListening(
      languageCode: langCode,
      onResult: (text) {
        // We received the final speech transcript
        stopListening(transcript: text);
      },
    );
  }

  void stopListening({String? transcript}) async {
    await _sttProvider.stopListening();
    
    if (transcript != null && transcript.isNotEmpty) {
      _addMessage(AIMessage(text: transcript, isUser: true, timestamp: DateTime.now()));
      _processInput(transcript);
    } else {
      state = state.copyWith(state: AIAssistantState.readyToListen, partialTranscript: null);
    }
  }

  Future<void> _processInput(String input) async {
    state = state.copyWith(state: AIAssistantState.processing, partialTranscript: null);

    // Call orchestrator
    try {
      final response = await _orchestrator.processIntent(input, currentLanguage.code);
      
      _addMessage(AIMessage(text: response, isUser: false, timestamp: DateTime.now()));
      state = state.copyWith(state: AIAssistantState.aiSpeaking);
      
      String langCode = "en-IN";
      if (currentLanguage == AppLanguage.telugu) langCode = "te-IN";
      if (currentLanguage == AppLanguage.hindi) langCode = "hi-IN";
      
      await _ttsProvider.speak(response, languageCode: langCode);
    } catch (e) {
      state = state.copyWith(state: AIAssistantState.error);
    }
  }

  void stopSpeaking() async {
    await _ttsProvider.stop();
    state = state.copyWith(state: AIAssistantState.readyToListen);
  }

  void _addMessage(AIMessage message) {
    state = state.copyWith(messages: List.from(state.messages)..add(message));
  }
}

final ttsProvider = Provider<TTSProvider>((ref) => LocalTTSProvider());
final sttProvider = Provider<STTProvider>((ref) => MockSTTProvider());
final aiOrchestratorProvider = Provider<AIOrchestrator>((ref) => MockAIOrchestrator());

final aiAssistantProvider = StateNotifierProvider<AIAssistantNotifier, AIAssistantStateData>((ref) {
  final tts = ref.watch(ttsProvider);
  final stt = ref.watch(sttProvider);
  final orch = ref.watch(aiOrchestratorProvider);
  
  return AIAssistantNotifier(tts, stt, orch);
});
