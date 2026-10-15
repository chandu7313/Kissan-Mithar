import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../../../shared/widgets/voice_recorder_card.dart';
import '../../../../core/services/step_voice_guide_service.dart';
import '../providers/disease_help_provider.dart';

class DiseaseVoiceScreen extends ConsumerStatefulWidget {
  const DiseaseVoiceScreen({super.key});

  @override
  ConsumerState<DiseaseVoiceScreen> createState() => _DiseaseVoiceScreenState();
}

class _DiseaseVoiceScreenState extends ConsumerState<DiseaseVoiceScreen> {
  String? _voicePath;
  int _voiceDurationSeconds = 0;
  String _selectedCrop = 'Chilli';
  String _affectedPart = 'Leaves';
  String _spreadRate = 'Spreading fast (2-3 days)';

  final List<String> _crops = [
    'Chilli',
    'Cotton',
    'Tomato',
    'Paddy / Rice',
    'Groundnut',
    'Maize',
  ];

  final List<String> _plantParts = [
    'Leaves',
    'Fruit / Pods',
    'Stem',
    'Roots',
    'Whole Plant',
  ];

  final List<String> _spreadRates = [
    'Spreading fast (2-3 days)',
    'Moderate (1 week)',
    'Few plants only',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      StepVoiceGuideService().speak(
        "Please select your crop and affected plant part, then record your voice describing what is happening to your plants.",
      );
    });
  }

  Future<void> _submitData() async {
    final notifier = ref.read(diseaseHelpProvider.notifier);

    notifier.setCropDetails(
      cropType: _selectedCrop,
      cropAge: 'Flowering Stage',
      affectedPart: _affectedPart,
      spreadRate: _spreadRate,
    );

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
                'Voice Note & Inquiry Saved!',
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
                  'Inquiry ID: ${request.id.substring(0, request.id.length > 8 ? 8 : request.id.length).toUpperCase()}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1B6327),
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Your voice recording and disease inquiry for $_selectedCrop (affected part: $_affectedPart) have been securely saved to the database. Plant pathologists are listening to your recording and formulating an organic & chemical remedy.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: Colors.black87, height: 1.4),
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
      final error = ref.read(diseaseHelpProvider).errorMessage;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error ?? 'Failed to submit inquiry. Please try again.'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(diseaseHelpProvider);
    final hasVoice = _voicePath != null && _voicePath!.isNotEmpty;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Explain Problem'),
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
                      'Crop & Symptoms Details',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF1B3B22),
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Specify what crop is affected, then record your voice describing the spots, curling, or pests.',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.black87,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Crop Selection Chips
                    const Text(
                      'Select Crop',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _crops.map((crop) {
                        final isSelected = _selectedCrop == crop;
                        return ChoiceChip(
                          label: Text(
                            crop,
                            style: TextStyle(
                              color: isSelected ? Colors.white : const Color(0xFF1B3B22),
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: const Color(0xFF1B6327),
                          backgroundColor: Colors.white,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() => _selectedCrop = crop);
                            }
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),

                    // Affected Plant Part & Spread Rate Row
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Affected Part',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.grey.shade300),
                                ),
                                child: DropdownButton<String>(
                                  value: _affectedPart,
                                  isExpanded: true,
                                  underline: const SizedBox(),
                                  items: _plantParts
                                      .map((p) => DropdownMenuItem(value: p, child: Text(p, overflow: TextOverflow.ellipsis)))
                                      .toList(),
                                  onChanged: (val) {
                                    if (val != null) setState(() => _affectedPart = val);
                                  },
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Spread Rate',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: Colors.grey.shade300),
                                ),
                                child: DropdownButton<String>(
                                  value: _spreadRate,
                                  isExpanded: true,
                                  underline: const SizedBox(),
                                  items: _spreadRates
                                      .map((s) => DropdownMenuItem(value: s, child: Text(s, overflow: TextOverflow.ellipsis)))
                                      .toList(),
                                  onChanged: (val) {
                                    if (val != null) setState(() => _spreadRate = val);
                                  },
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Voice Recorder Card
                    VoiceRecorderCard(
                      title: 'Record Disease Symptoms',
                      hintText: 'Tap below and describe what is happening to your plants',
                      tapToStartRecordingLabel: 'Tap to Record Symptoms',
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
                    const SizedBox(height: 16),

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
                                    'Symptoms Voice Recording Ready',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1B6327),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Your voice recording will be uploaded directly to our database for plant pathologists to analyze.',
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
                      const SizedBox(height: 16),
                    ],

                    // Summary Details Card
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
                              Text('${state.photos.length} Disease Photos Attached', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                            ],
                          ),
                          const Divider(height: 16),
                          Row(
                            children: [
                              const Icon(Icons.eco, size: 18, color: Color(0xFF1B6327)),
                              const SizedBox(width: 8),
                              Text('$_selectedCrop • Affected: $_affectedPart', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
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
