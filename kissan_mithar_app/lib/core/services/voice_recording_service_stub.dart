import 'voice_recording_service.dart';

VoiceRecordingService getVoiceRecordingService() => _StubVoiceRecordingService();

class _StubVoiceRecordingService implements VoiceRecordingService {
  @override
  Future<bool> startRecording() async => true;

  @override
  Future<String?> stopRecording() async {
    return '/local/recordings/voice_note_${DateTime.now().millisecondsSinceEpoch}.m4a';
  }

  @override
  void play(String audioSource, {void Function()? onCompleted}) {}

  @override
  void stopPlayback() {}

  @override
  void dispose() {}
}
