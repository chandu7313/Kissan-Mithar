import 'dart:async';
import '../../../../core/network/network_client.dart';
import '../../domain/services/voice_service_interface.dart';
import 'mock_voice_providers.dart';

class LiveAIOrchestrator implements AIOrchestrator {
  final NetworkClient _client;
  final MockAIOrchestrator _offlineFallback = MockAIOrchestrator();

  LiveAIOrchestrator([NetworkClient? client]) : _client = client ?? NetworkClient();

  @override
  Future<String> processIntent(String text, String languageCode) async {
    try {
      final response = await _client.post(
        '/ai/chat',
        data: {
          'message': text,
          'languageCode': languageCode,
        },
      );

      final reply = response.data?['data']?['reply'];
      if (reply != null && reply.toString().trim().isNotEmpty) {
        return reply.toString().trim();
      }
    } catch (_) {
      // Gracefully fall back to local rule-based agronomy knowledge if backend is offline
    }

    return await _offlineFallback.processIntent(text, languageCode);
  }
}
