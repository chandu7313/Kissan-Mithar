import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../../../shared/widgets/media_picker_card.dart';
import '../../../../shared/widgets/voice_recorder_card.dart';
import '../../models/consultation_model.dart';
import '../../providers/consultation_provider.dart';

class AddConsultationDetailsScreen extends ConsumerStatefulWidget {
  const AddConsultationDetailsScreen({super.key});

  @override
  ConsumerState<AddConsultationDetailsScreen> createState() =>
      _AddConsultationDetailsScreenState();
}

class _AddConsultationDetailsScreenState
    extends ConsumerState<AddConsultationDetailsScreen> {
  final TextEditingController _messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final draft =
        ref.read(consultationBookingProvider).value ?? const ConsultationBookingDraft();
    _messageController.text = draft.message;
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _onMessageChanged(String val) {
    ref.read(consultationBookingProvider.notifier).setMessage(val);
  }

  Future<void> _submitBooking() async {
    final notifier = ref.read(consultationBookingProvider.notifier);
    notifier.setMessage(_messageController.text.trim());

    final bookedItem = await notifier.submitBooking();

    if (!mounted) return;

    if (bookedItem != null) {
      ref.invalidate(consultationsHistoryProvider);

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          backgroundColor: AppColors.surface,
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Color(0xFFE8F5E9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: AppColors.primaryGreen,
                  size: 32,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Consultation Booked!',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: AppColors.primaryGreen,
                  ),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Booking ID: ${bookedItem.id}',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'An expert agronomist (${bookedItem.expertName}) has been assigned for ${bookedItem.scheduledDate} at ${bookedItem.scheduledTime}.',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F8F2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primaryGreen.withAlpha(80)),
                ),
                child: Row(
                  children: [
                    Icon(bookedItem.mode.icon,
                        color: AppColors.primaryGreen, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Mode: ${bookedItem.mode.label} (${bookedItem.language})',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.go('/home');
              },
              child: const Text(
                'Go to Home',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              ),
              onPressed: () {
                Navigator.pop(ctx);
                context.pushReplacement('/consultation/history');
              },
              child: const Text(
                'View Bookings',
                style: TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to book consultation. Please try again.'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  Widget _buildSummaryCard(ConsultationBookingDraft draft) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F8F2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primaryGreen.withAlpha(90), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(draft.mode.icon, color: AppColors.primaryGreen, size: 22),
              const SizedBox(width: 8),
              Text(
                '${draft.mode.label} Session',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primaryGreen,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFC7CEC7)),
                ),
                child: Text(
                  draft.language,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, color: Color(0xFFC7CEC7)),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Category',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    draft.category,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text(
                    'Time Slot',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    draft.timeSlot,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bookingState = ref.watch(consultationBookingProvider);
    final draft = bookingState.value ?? const ConsultationBookingDraft();
    final isLoading = bookingState.isLoading;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: FarmerAppBar(
        onBackTap: () => Navigator.pop(context),
        showTractorIcon: false,
        showBrandTitle: true,
        showLanguagePill: true,
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: SingleChildScrollView(
              padding:
                  const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Step Header
                  const Text(
                    'Add Crop Issue Details',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Step 2 of 2: Photos, Voice & Description',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primaryGreen,
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Session Summary Box
                  _buildSummaryCard(draft),

                  const SizedBox(height: 22),

                  // 1. Text Message Section
                  const Text(
                    '1. Describe the Problem (Optional)',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFC7CEC7), width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(5),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: TextField(
                      controller: _messageController,
                      onChanged: _onMessageChanged,
                      maxLines: 3,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                      decoration: InputDecoration(
                        hintText:
                            'Type crop symptoms, duration of issue, or current fertilizer used...',
                        hintStyle: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: Color(0xFFA5ACA5),
                        ),
                        contentPadding: const EdgeInsets.all(16),
                        border: InputBorder.none,
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.mic_none_rounded,
                              color: AppColors.primaryGreen),
                          tooltip: 'Speak to type',
                          onPressed: () {
                            _messageController.text =
                                'Leaves turning yellow with dark spots at base.';
                            _onMessageChanged(_messageController.text);
                          },
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 22),

                  // 2. Photo & Video Upload Card
                  MediaPickerCard(
                    initialMediaPaths: draft.mediaPaths,
                    onMediaChanged: (paths) {
                      ref
                          .read(consultationBookingProvider.notifier)
                          .setMediaPaths(paths);
                    },
                  ),

                  const SizedBox(height: 22),

                  // 3. Voice Recorder Card
                  VoiceRecorderCard(
                    initialVoicePath: draft.voiceNotePath,
                    initialDurationSeconds: draft.voiceDurationSeconds,
                    onVoiceChanged: (path) {
                      ref
                          .read(consultationBookingProvider.notifier)
                          .setVoiceNote(path, draft.voiceDurationSeconds);
                    },
                    onDurationChanged: (duration) {
                      ref
                          .read(consultationBookingProvider.notifier)
                          .setVoiceNote(draft.voiceNotePath, duration);
                    },
                  ),

                  const SizedBox(height: 36),

                  // Confirm Button
                  LargeButton(
                    label: isLoading ? 'Uploading & Booking...' : 'Confirm & Book Expert',
                    leadingIcon: isLoading
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(
                            Icons.check_circle_outline_rounded,
                            color: Colors.white,
                            size: 22,
                          ),
                    onPressed: isLoading ? () {} : _submitBooking,
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
