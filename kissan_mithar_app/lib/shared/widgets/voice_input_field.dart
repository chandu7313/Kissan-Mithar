import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class VoiceInputField extends StatefulWidget {
  final String hintText;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onVoicePressed;

  const VoiceInputField({
    super.key,
    required this.hintText,
    this.controller,
    this.onChanged,
    this.onVoicePressed,
  });

  @override
  State<VoiceInputField> createState() => _VoiceInputFieldState();
}

class _VoiceInputFieldState extends State<VoiceInputField> {
  bool _isListening = false;

  void _handleVoiceTap() {
    setState(() {
      _isListening = !_isListening;
    });
    if (widget.onVoicePressed != null) {
      widget.onVoicePressed!();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _isListening ? const Color(0xFF1B6327) : AppColors.borderSubtle,
          width: _isListening ? 2.0 : 1.2,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: widget.controller,
              onChanged: widget.onChanged,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              decoration: InputDecoration(
                hintText: _isListening ? 'Listening to voice...' : widget.hintText,
                hintStyle: TextStyle(
                  color: _isListening ? const Color(0xFF1B6327) : AppColors.textSecondary,
                  fontSize: 15,
                ),
                border: InputBorder.none,
              ),
            ),
          ),
          InkWell(
            onTap: _handleVoiceTap,
            borderRadius: BorderRadius.circular(24),
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: _isListening ? const Color(0xFFE8F5E9) : Colors.grey.shade100,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.mic,
                color: _isListening ? const Color(0xFF1B6327) : AppColors.textSecondary,
                size: 24,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
