import 'dart:async';
import 'dart:html' as html;
import 'package:flutter/foundation.dart';
import 'voice_recording_service.dart';

VoiceRecordingService getVoiceRecordingService() => WebVoiceRecordingService();

class WebVoiceRecordingService implements VoiceRecordingService {
  html.MediaRecorder? _mediaRecorder;
  html.MediaStream? _mediaStream;
  final List<html.Blob> _chunks = [];
  html.AudioElement? _audioElement;
  StreamSubscription? _audioEndedSub;

  @override
  Future<bool> startRecording() async {
    try {
      _chunks.clear();
      final mediaDevices = html.window.navigator.mediaDevices;
      if (mediaDevices == null) {
        debugPrint('[WebVoiceRecording] MediaDevices not available');
        return false;
      }

      _mediaStream = await mediaDevices.getUserMedia({'audio': true});
      _mediaRecorder = html.MediaRecorder(_mediaStream!);

      _mediaRecorder!.addEventListener('dataavailable', (html.Event event) {
        final blobEvent = event as html.BlobEvent;
        if (blobEvent.data != null && (blobEvent.data!.size ?? 0) > 0) {
          _chunks.add(blobEvent.data!);
        }
      });

      _mediaRecorder!.start();
      debugPrint('[WebVoiceRecording] Microphone recording started successfully');
      return true;
    } catch (e) {
      debugPrint('[WebVoiceRecording] Could not access microphone: $e');
      return false;
    }
  }

  @override
  Future<String?> stopRecording() async {
    try {
      if (_mediaRecorder == null) {
        return '/local/recordings/voice_note_${DateTime.now().millisecondsSinceEpoch}.m4a';
      }

      final completer = Completer<String?>();

      _mediaRecorder!.addEventListener('stop', (html.Event event) async {
        try {
          final blob = html.Blob(_chunks, 'audio/webm');
          final reader = html.FileReader();
          reader.readAsDataUrl(blob);
          await reader.onLoadEnd.first;
          final dataUrl = reader.result as String?;

          // Stop mic tracks to release hardware indicator
          _mediaStream?.getTracks().forEach((track) => track.stop());
          _mediaStream = null;

          debugPrint('[WebVoiceRecording] Recording stopped, captured data URL length: ${dataUrl?.length ?? 0}');
          completer.complete(dataUrl);
        } catch (err) {
          debugPrint('[WebVoiceRecording] Blob reading error: $err');
          completer.complete('/local/recordings/voice_note_${DateTime.now().millisecondsSinceEpoch}.webm');
        }
      });

      _mediaRecorder!.stop();
      return await completer.future;
    } catch (e) {
      debugPrint('[WebVoiceRecording] stopRecording error: $e');
      return '/local/recordings/voice_note_${DateTime.now().millisecondsSinceEpoch}.m4a';
    }
  }

  @override
  void play(String audioSource, {void Function()? onCompleted}) {
    stopPlayback();
    try {
      _audioElement = html.AudioElement(audioSource);
      _audioEndedSub = _audioElement!.onEnded.listen((_) {
        onCompleted?.call();
      });
      _audioElement!.play();
      debugPrint('[WebVoiceRecording] Playing recorded audio');
    } catch (e) {
      debugPrint('[WebVoiceRecording] Error playing audio: $e');
      onCompleted?.call();
    }
  }

  @override
  void stopPlayback() {
    try {
      _audioEndedSub?.cancel();
      _audioEndedSub = null;
      _audioElement?.pause();
      _audioElement = null;
    } catch (_) {}
  }

  @override
  void dispose() {
    stopPlayback();
    _mediaStream?.getTracks().forEach((track) => track.stop());
    _mediaStream = null;
  }
}
