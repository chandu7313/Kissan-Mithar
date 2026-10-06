import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../../../shared/widgets/voice_interaction_system.dart';
import '../../../../core/services/step_voice_guide_service.dart';

class DiseaseVoiceScreen extends ConsumerStatefulWidget {
  const DiseaseVoiceScreen({super.key});

  @override
  ConsumerState<DiseaseVoiceScreen> createState() => _DiseaseVoiceScreenState();
}

class _DiseaseVoiceScreenState extends ConsumerState<DiseaseVoiceScreen> {
  String _recognizedText = '';
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      StepVoiceGuideService().speak("Please tap the microphone and explain what is happening with your crop.");
    });
  }

  void _submitData() async {
    setState(() {
      _isProcessing = true;
    });
    
    // Simulate API call to process photos and voice
    await Future.delayed(const Duration(seconds: 3));
    
    if (mounted) {
      setState(() {
        _isProcessing = false;
      });
      
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Column(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 64),
              SizedBox(height: 16),
              Text('Details Submitted!', textAlign: TextAlign.center),
            ],
          ),
          content: const Text(
            'Our agriculture experts will review your photos and voice note to diagnose the disease and suggest the right treatment. We will notify you shortly.',
            textAlign: TextAlign.center,
          ),
          actions: [
            SizedBox(
              width: double.infinity,
              child: LargeButton(
                label: 'Back to Home',
                onPressed: () {
                  Navigator.of(context).pop(); // Close the dialog
                  context.go('/home'); // Navigate to home
                },
              ),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Voice Note'),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Explain the problem',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF1B3B22),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Tap the microphone and speak. For example: "The leaves on my tomato plants are turning yellow with brown spots."',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.black87,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    VoiceInteractionSystem(
                      instructionText: 'Tap the mic and speak',
                      spokenInstructionText: 'What is happening to your crop?',
                      onSubmit: (text) {
                        setState(() {
                          _recognizedText = text;
                        });
                      },
                    ),
                    
                    if (_recognizedText.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey.shade300),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'You said:',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.black54,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _recognizedText,
                              style: const TextStyle(
                                fontSize: 16,
                                color: Colors.black87,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: LargeButton(
                label: _isProcessing ? 'Processing...' : 'Submit to Experts',
                leadingIcon: _isProcessing 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.send, color: Colors.white),
                onPressed: _isProcessing || _recognizedText.isEmpty ? null : _submitData,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
