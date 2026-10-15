import 'voice_recording_service_stub.dart'
    if (dart.library.html) 'voice_recording_service_web.dart';

abstract class VoiceRecordingService {
  factory VoiceRecordingService() => getVoiceRecordingService();

  Future<bool> startRecording();
  Future<String?> stopRecording();
  void play(String audioSource, {void Function()? onCompleted});
  void stopPlayback();
  void dispose();
}
