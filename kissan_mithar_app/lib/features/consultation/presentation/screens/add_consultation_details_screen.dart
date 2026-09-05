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
import '../../../../l10n/app_localizations.dart';
import '../../../../core/services/step_voice_guide_service.dart';
import '../../../../core/localization/app_language.dart';

class AddConsultationDetailsScreen extends ConsumerStatefulWidget {
  const AddConsultationDetailsScreen({super.key});

  @override
  ConsumerState<AddConsultationDetailsScreen> createState() =>
      _AddConsultationDetailsScreenState();
}

class _AddConsultationDetailsScreenState
    extends ConsumerState<AddConsultationDetailsScreen> {
  final TextEditingController _messageController = TextEditingController();
  final StepVoiceGuideService _voiceGuide = StepVoiceGuideService();
  final GlobalKey<VoiceRecorderCardState> _recorderKey = GlobalKey<VoiceRecorderCardState>();

  @override
  void initState() {
    super.initState();
    final draft =
        ref.read(consultationBookingProvider).value ?? const ConsultationBookingDraft();
    _messageController.text = draft.message;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _voiceGuide.speak("Add clear photos of the crop issue and record a voice note explaining your problem.");
    });
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
    if (_recorderKey.currentState?.isRecording ?? false) {
      _recorderKey.currentState?.stopRecording();
      await Future.delayed(const Duration(milliseconds: 50));
    }

    final notifier = ref.read(consultationBookingProvider.notifier);
    notifier.setMessage(_messageController.text.trim());

    final bookedItem = await notifier.submitBooking();

    if (!mounted) return;

    if (bookedItem != null) {
      ref.invalidate(consultationsHistoryProvider);

      // Play consultation success voice guide
      final currentLang = LanguageProvider().currentLanguage;
      StepVoiceGuideService().speakConsultationSuccess(currentLang);

      context.pushReplacement(
        '/consultation/success',
        extra: {
          'bookingId': bookedItem.id,
          'expertName': bookedItem.expertName,
          'scheduledDate': bookedItem.scheduledDate,
          'scheduledTime': bookedItem.scheduledTime,
          'modeIcon': bookedItem.mode.icon,
          'modeLabel': bookedItem.mode.label,
          'language': bookedItem.language,
        },
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


  @override
  Widget build(BuildContext context) {
    final bookingState = ref.watch(consultationBookingProvider);
    final draft = bookingState.valueOrNull ?? const ConsultationBookingDraft();
    final isLoading = bookingState.isLoading;
    final l10n = AppLocalizations.of(context)!;

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
                  Text(
                    l10n.addCropIssueDetails,
                    style: const TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        l10n.step2PhotosVoiceDesc,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                      const SizedBox(width: 8),
                      InkWell(
                        onTap: () => _voiceGuide.speak("Add clear photos of the crop issue and record a voice note explaining your problem."),
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGreen.withAlpha(20),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.volume_up_rounded,
                            size: 18,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Removed summary card and text message section

                  // 2. Photo & Video Upload Card
                  MediaPickerCard(
                    title: l10n.addPhotosOfCropIssue,
                    hintText: l10n.uploadClearPhotos,
                    takePhotoLabel: l10n.takePhoto,
                    uploadFromGalleryLabel: l10n.uploadFromGallery,
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
                    key: _recorderKey,
                    title: l10n.recordVoiceNote,
                    hintText: l10n.tapMicAndExplain,
                    tapToStartRecordingLabel: l10n.tapToStartVoiceRecording,
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
                    label: isLoading ? l10n.uploadingBooking : l10n.confirmAndBookExpert,
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
