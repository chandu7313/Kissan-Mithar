import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../../../shared/widgets/voice_recorder_card.dart';
import '../../../../core/services/step_voice_guide_service.dart';
import '../providers/fertilizer_guide_provider.dart';

class FertilizerVoiceScreen extends ConsumerStatefulWidget {
  const FertilizerVoiceScreen({super.key});

  @override
  ConsumerState<FertilizerVoiceScreen> createState() => _FertilizerVoiceScreenState();
}

class _FertilizerVoiceScreenState extends ConsumerState<FertilizerVoiceScreen> {
  String? _voicePath;
  int _voiceDurationSeconds = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      StepVoiceGuideService().speak(
        "Please tap the microphone to record your voice note. Explain your crop and what fertilizer advice you need.",
      );
    });
  }

  Future<void> _submitData() async {
    final notifier = ref.read(fertilizerGuideProvider.notifier);

    notifier.setVoiceQuery('', audioPath: _voicePath);

    final request = await notifier.submitRequest();

    if (!mounted) return;

    if (request != null) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Column(
            children: [
              Icon(Icons.check_circle, color: Color(0xFF1B6327), size: 64),
              SizedBox(height: 12),
              Text(
                'Voice Note Saved in Database!',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                textAlign: TextAlign.center,
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Request ID: ${request.id.substring(0, request.id.length > 8 ? 8 : request.id.length).toUpperCase()}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1B6327),
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Your voice recording, crop photos, and farm location have been securely saved directly to the database. Agronomists will listen to your voice note and prepare a customized fertilizer schedule.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: Colors.black87, height: 1.4),
              ),
            ],
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
              child: SizedBox(
                width: double.infinity,
                child: LargeButton(
                  label: 'Back to Home',
                  onPressed: () {
                    Navigator.of(context).pop();
                    context.go('/home');
                  },
                ),
              ),
            ),
          ],
        ),
      );
    } else {
      final error = ref.read(fertilizerGuideProvider).errorMessage;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error ?? 'Failed to submit request. Please try again.'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(fertilizerGuideProvider);
    final hasVoice = _voicePath != null && _voicePath!.isNotEmpty;

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
                      'Record Your Voice Note',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF1B3B22),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Speak naturally in your language. Tell us your crop name, age, and what fertilizer plan you need. Your voice is uploaded directly to our experts.',
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.black87,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Direct Voice Recorder Card
                    VoiceRecorderCard(
                      title: 'Record Voice Note',
                      hintText: 'Tap below and speak into your microphone',
                      tapToStartRecordingLabel: 'Tap to Record Voice',
                      initialVoicePath: _voicePath,
                      initialDurationSeconds: _voiceDurationSeconds,
                      onVoiceChanged: (path) {
                        setState(() {
                          _voicePath = path;
                        });
                      },
                      onDurationChanged: (duration) {
                        setState(() {
                          _voiceDurationSeconds = duration;
                        });
                      },
                    ),
                    const SizedBox(height: 20),

                    // Voice Note Ready Confirmation Banner
                    if (hasVoice) ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF1B6327).withAlpha(80)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle_rounded, color: Color(0xFF1B6327), size: 24),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Voice Recording Ready',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1B6327),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Audio will be uploaded directly to the database for experts to hear.',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: Colors.grey.shade800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],

                    Center(
                      child: Image.asset(
                        'assets/images/Farmer Using Voice Chat Smartphone.png',
                        height: 180,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.record_voice_over,
                          size: 90,
                          color: Color(0xFF1B6327),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Summary details card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.photo_library, size: 18, color: Color(0xFF1B6327)),
                              const SizedBox(width: 8),
                              Text(
                                '${state.photos.length} Photos Attached',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                          const Divider(height: 16),
                          Row(
                            children: [
                              const Icon(Icons.location_on, size: 18, color: Color(0xFF1B6327)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  state.address,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Submit Button
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
                label: state.isSubmitting ? 'Uploading to Database...' : 'Submit to Experts',
                leadingIcon: state.isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Icon(Icons.send, color: Colors.white),
                onPressed: state.isSubmitting || (!hasVoice && state.photos.isEmpty) ? null : _submitData,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
