import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:speech_to_text/speech_to_text.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/step_voice_guide_service.dart';

enum VoiceState {
  idle,
  recording,
  recorded,
  processing,
  success,
  error,
}

class VoiceInteractionSystem extends ConsumerStatefulWidget {
  final String instructionText;
  final String spokenInstructionText; // The text to be spoken by TTS
  final Function(String) onSubmit;
  final String? initialText;

  const VoiceInteractionSystem({
    super.key,
    required this.instructionText,
    required this.spokenInstructionText,
    required this.onSubmit,
    this.initialText,
  });

  @override
  ConsumerState<VoiceInteractionSystem> createState() => _VoiceInteractionSystemState();
}

class _VoiceInteractionSystemState extends ConsumerState<VoiceInteractionSystem>
    with SingleTickerProviderStateMixin {
  late SpeechToText _speechToText;
  bool _speechEnabled = false;
  VoiceState _currentState = VoiceState.idle;
  String _recognizedText = '';
  
  late AnimationController _pulseController;
  late Animation<double> _scaleAnimation;
  int _recordingDuration = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _speechToText = SpeechToText();
    _initSpeech();
    
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
    
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    if (widget.initialText != null && widget.initialText!.isNotEmpty) {
      _recognizedText = widget.initialText!;
      _currentState = VoiceState.recorded;
    }
  }

  void _initSpeech() async {
    _speechEnabled = await _speechToText.initialize(
      onError: (val) => _handleSpeechError(val.errorMsg),
      onStatus: (val) => _handleSpeechStatus(val),
    );
    setState(() {});
  }
  
  void _handleSpeechError(String errorMsg) {
    if (mounted) {
      setState(() {
        _currentState = VoiceState.error;
      });
    }
  }
  
  void _handleSpeechStatus(String status) {
    if (status == 'done' && _currentState == VoiceState.recording) {
      _stopRecording();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _recordingDuration = 0;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _recordingDuration++;
        });
      }
    });
  }

  void _stopTimer() {
    _timer?.cancel();
  }

  void _playInstruction() async {
    final tts = StepVoiceGuideService();
    await tts.speak(widget.spokenInstructionText);
  }

  void _startRecording() async {
    if (!_speechEnabled) {
      _initSpeech();
      return;
    }
    
    await StepVoiceGuideService().stop(); // Stop instruction if playing
    
    setState(() {
      _currentState = VoiceState.recording;
      _recognizedText = '';
    });
    
    _startTimer();
    
    await _speechToText.listen(
      onResult: (result) {
        if (mounted) {
          setState(() {
            _recognizedText = result.recognizedWords;
            if (result.finalResult) {
              _stopRecording();
            }
          });
        }
      },
      localeId: 'en_IN', // Default to English for now, should map from language
    );
  }

  void _stopRecording() async {
    await _speechToText.stop();
    _stopTimer();
    
    if (mounted) {
      setState(() {
        _currentState = _recognizedText.isNotEmpty ? VoiceState.recorded : VoiceState.error;
      });
    }
  }

  void _playRecordedText() async {
    if (_recognizedText.isNotEmpty) {
      final tts = StepVoiceGuideService();
      await tts.speak(_recognizedText);
    }
  }

  void _reset() {
    setState(() {
      _currentState = VoiceState.idle;
      _recognizedText = '';
      _recordingDuration = 0;
    });
  }

  void _submit() {
    widget.onSubmit(_recognizedText);
  }

  String _formatTime(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildContentForState(),
        ],
      ),
    );
  }

  Widget _buildContentForState() {
    switch (_currentState) {
      case VoiceState.idle:
        return _buildIdleState();
      case VoiceState.recording:
        return _buildRecordingState();
      case VoiceState.recorded:
        return _buildRecordedState();
      case VoiceState.processing:
        return _buildProcessingState();
      case VoiceState.success:
        return _buildSuccessState();
      case VoiceState.error:
        return _buildErrorState();
    }
  }

  Widget _buildIdleState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        InkWell(
          onTap: _playInstruction,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F8E9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.volume_up, color: Color(0xFF1B6327), size: 32),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Listen to Instruction',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1B6327),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.instructionText,
                        style: const TextStyle(fontSize: 14, color: Colors.black87),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        ScaleTransition(
          scale: _scaleAnimation,
          child: ElevatedButton.icon(
            onPressed: _startRecording,
            icon: const Icon(Icons.mic, size: 28, color: Colors.white),
            label: const Text(
              'START RECORDING',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              padding: const EdgeInsets.symmetric(vertical: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRecordingState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 16),
        FadeTransition(
          opacity: _pulseController,
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: Colors.red.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Icon(Icons.mic, color: Colors.red, size: 40),
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text(
          'Recording...',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.red),
        ),
        const SizedBox(height: 8),
        Text(
          _formatTime(_recordingDuration),
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.black54),
        ),
        const SizedBox(height: 8),
        if (_recognizedText.isNotEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              _recognizedText,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16, color: Colors.black87, fontStyle: FontStyle.italic),
            ),
          ),
        const SizedBox(height: 24),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _stopRecording,
            icon: const Icon(Icons.stop, color: Colors.white),
            label: const Text('Stop', style: TextStyle(fontSize: 18, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRecordedState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade300),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'You said:',
                style: TextStyle(fontSize: 14, color: Colors.black54, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                _recognizedText,
                style: const TextStyle(fontSize: 18, color: Colors.black87, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _playRecordedText,
                icon: const Icon(Icons.play_arrow, color: Color(0xFF1B6327)),
                label: const Text('Listen', style: TextStyle(color: Color(0xFF1B6327))),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: const BorderSide(color: Color(0xFF1B6327)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _reset,
                icon: const Icon(Icons.refresh, color: Colors.black54),
                label: const Text('Record Again', style: TextStyle(color: Colors.black54)),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: const BorderSide(color: Colors.black26),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: _submit,
          icon: const Icon(Icons.check, color: Colors.white),
          label: const Text('SUBMIT', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1B6327),
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }

  Widget _buildProcessingState() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 32.0),
        child: Column(
          children: [
            CircularProgressIndicator(color: Color(0xFF1B6327)),
            SizedBox(height: 16),
            Text('Processing your voice...', style: TextStyle(fontSize: 16, color: Colors.black54)),
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Icon(Icons.check_circle, color: Colors.green, size: 64),
        const SizedBox(height: 16),
        const Text(
          'Successfully Understood!',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: _submit, // Or proceed to next
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryGreen,
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 32),
          ),
          child: const Text('Continue', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  Widget _buildErrorState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Icon(Icons.error_outline, color: Colors.red, size: 64),
        const SizedBox(height: 16),
        const Text(
          'We couldn\'t understand the recording. Please try again.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 16, color: Colors.black87),
        ),
        const SizedBox(height: 24),
        ElevatedButton.icon(
          onPressed: _reset,
          icon: const Icon(Icons.refresh, color: Colors.white),
          label: const Text('Record Again', style: TextStyle(color: Colors.white)),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primaryGreen,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ],
    );
  }
}
