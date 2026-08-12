import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class VoiceRecorderCard extends StatefulWidget {
  final String? initialVoicePath;
  final int initialDurationSeconds;
  final ValueChanged<String?>? onVoiceChanged;
  final ValueChanged<int>? onDurationChanged;
  final String title;
  final String hintText;
  final String tapToStartRecordingLabel;

  const VoiceRecorderCard({
    super.key,
    this.initialVoicePath,
    this.initialDurationSeconds = 0,
    this.onVoiceChanged,
    this.onDurationChanged,
    this.title = 'Record Voice Note',
    this.hintText = 'Tap mic and explain your problem in your language',
    this.tapToStartRecordingLabel = 'Tap to Start Voice Recording',
  });

  @override
  State<VoiceRecorderCard> createState() => VoiceRecorderCardState();
}

class VoiceRecorderCardState extends State<VoiceRecorderCard>
    with SingleTickerProviderStateMixin {
  bool _isRecording = false;
  bool get isRecording => _isRecording;
  bool _isPlaying = false;
  int _recordedSeconds = 0;
  String? _voicePath;
  Timer? _recordTimer;
  Timer? _playbackTimer;
  int _playProgressSeconds = 0;
  late AnimationController _pulseController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _voicePath = widget.initialVoicePath;
    _recordedSeconds = widget.initialDurationSeconds;
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.03).animate(
      CurvedAnimation(
        parent: _pulseController,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _recordTimer?.cancel();
    _playbackTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  void stopRecording() {
    if (_isRecording) {
      _stopRecording();
    }
  }

  void _startRecording() {
    setState(() {
      _isRecording = true;
      _isPlaying = false;
      _recordedSeconds = 0;
      _voicePath = null;
    });

    _recordTimer?.cancel();
    _recordTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_isRecording) {
        setState(() {
          _recordedSeconds++;
        });
        if (_recordedSeconds >= 120) {
          // Max 2 mins
          _stopRecording();
        }
      } else {
        timer.cancel();
      }
    });
  }

  void _stopRecording() {
    _recordTimer?.cancel();
    final dummyPath =
        '/local/recordings/consultation_note_${DateTime.now().millisecondsSinceEpoch}.m4a';
    setState(() {
      _isRecording = false;
      _voicePath = dummyPath;
    });
    widget.onVoiceChanged?.call(_voicePath);
    widget.onDurationChanged?.call(_recordedSeconds > 0 ? _recordedSeconds : 15);
  }

  void _togglePlayback() {
    if (_isPlaying) {
      _playbackTimer?.cancel();
      setState(() => _isPlaying = false);
    } else {
      setState(() {
        _isPlaying = true;
        _playProgressSeconds = 0;
      });
      final total = _recordedSeconds > 0 ? _recordedSeconds : 15;
      _playbackTimer?.cancel();
      _playbackTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (_playProgressSeconds < total) {
          setState(() => _playProgressSeconds++);
        } else {
          timer.cancel();
          setState(() {
            _isPlaying = false;
            _playProgressSeconds = 0;
          });
        }
      });
    }
  }

  void _deleteRecording() {
    _playbackTimer?.cancel();
    _recordTimer?.cancel();
    setState(() {
      _isRecording = false;
      _isPlaying = false;
      _recordedSeconds = 0;
      _playProgressSeconds = 0;
      _voicePath = null;
    });
    widget.onVoiceChanged?.call(null);
    widget.onDurationChanged?.call(0);
  }

  String _formatTime(int totalSeconds) {
    final mins = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final secs = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
  }

  @override
  Widget build(BuildContext context) {
    final hasRecording = _voicePath != null && _voicePath!.isNotEmpty;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _isRecording
              ? Colors.redAccent
              : hasRecording
                  ? AppColors.primaryGreen
                  : const Color(0xFFC7CEC7),
          width: _isRecording || hasRecording ? 2.0 : 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _isRecording
                      ? const Color(0xFFFFEBEE)
                      : const Color(0xFFE8F5E9),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _isRecording ? Icons.mic_rounded : Icons.mic_none_rounded,
                  color: _isRecording ? Colors.redAccent : AppColors.primaryGreen,
                  size: 22,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              if (hasRecording && !_isRecording)
                IconButton(
                  onPressed: _deleteRecording,
                  icon: const Icon(
                    Icons.delete_outline_rounded,
                    color: Colors.redAccent,
                    size: 22,
                  ),
                  tooltip: 'Delete voice note',
                ),
            ],
          ),

          const SizedBox(height: 14),

          // State 1: Currently Recording
          if (_isRecording) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF0F0),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.redAccent.withAlpha(100)),
              ),
              child: Row(
                children: [
                  FadeTransition(
                    opacity: _pulseController,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: const BoxDecoration(
                        color: Colors.redAccent,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Recording... ${_formatTime(_recordedSeconds)}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: Colors.redAccent,
                    ),
                  ),
                  const Spacer(),
                  ElevatedButton.icon(
                    onPressed: _stopRecording,
                    icon: const Icon(Icons.stop_rounded, color: Colors.white, size: 20),
                    label: const Text('Stop', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                  ),
                ],
              ),
            ),
          ]
          // State 2: Has Recorded Voice Note Preview
          else if (hasRecording) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F8F2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primaryGreen.withAlpha(80)),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: _togglePlayback,
                    icon: Icon(
                      _isPlaying
                          ? Icons.pause_circle_filled_rounded
                          : Icons.play_circle_fill_rounded,
                      color: AppColors.primaryGreen,
                      size: 40,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isPlaying
                              ? 'Playing: ${_formatTime(_playProgressSeconds)} / ${_formatTime(_recordedSeconds > 0 ? _recordedSeconds : 15)}'
                              : 'Voice Note (${_formatTime(_recordedSeconds > 0 ? _recordedSeconds : 15)})',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        LinearProgressIndicator(
                          value: _recordedSeconds > 0
                              ? (_playProgressSeconds / _recordedSeconds).clamp(0.0, 1.0)
                              : (_playProgressSeconds / 15).clamp(0.0, 1.0),
                          backgroundColor: Colors.black12,
                          valueColor: const AlwaysStoppedAnimation<Color>(
                              AppColors.primaryGreen),
                          minHeight: 4,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: _startRecording,
                    child: const Text(
                      'Re-record',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ]
          // State 3: Ready to Record
          else ...[
            Text(
              widget.hintText,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 14),
            ScaleTransition(
              scale: _scaleAnimation,
              child: InkWell(
                onTap: _startRecording,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1EFEA),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFC7CEC7),
                      style: BorderStyle.solid,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryGreen.withAlpha(20),
                        blurRadius: 8,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.mic_rounded,
                        color: AppColors.primaryGreen,
                        size: 26,
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          widget.tapToStartRecordingLabel,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
