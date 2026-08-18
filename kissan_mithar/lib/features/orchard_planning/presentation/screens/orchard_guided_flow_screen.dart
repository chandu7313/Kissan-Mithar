import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'package:intl/intl.dart';
import 'package:video_player/video_player.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../core/localization/app_language.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../../core/routing/app_router.dart';
import '../../../../core/services/step_voice_guide_service.dart';
import '../../providers/orchard_planning_provider.dart';

class OrchardGuidedFlowScreen extends ConsumerStatefulWidget {
  const OrchardGuidedFlowScreen({super.key});

  @override
  ConsumerState<OrchardGuidedFlowScreen> createState() =>
      _OrchardGuidedFlowScreenState();
}

class _OrchardGuidedFlowScreenState
    extends ConsumerState<OrchardGuidedFlowScreen> {
  late final PageController _pageController;
  final ImagePicker _picker = ImagePicker();
  final StepVoiceGuideService _voiceGuide = StepVoiceGuideService();

  AppLocalizations get l10n => AppLocalizations.of(context)!;

  @override
  void initState() {
    super.initState();
    final currentStep = ref.read(orchardPlanningProvider).currentStep;
    _pageController = PageController(initialPage: currentStep);
    // Speak the instruction for the initial step after the frame is built
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _speakCurrentStep(currentStep);
    });
  }

  @override
  void dispose() {
    _voiceGuide.stop();
    _pageController.dispose();
    super.dispose();
  }

  void _speakCurrentStep(int step) {
    final language = ref.read(languageNotifierProvider);
    _voiceGuide.speakStepInstruction(step, language);
  }

  void _goToStep(int step) {
    ref.read(orchardPlanningProvider.notifier).setStep(step);
    _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeInOutCubic,
    );
    // Speak instruction for the new step
    _speakCurrentStep(step);
  }

  Future<void> _pickImage(String angle, ImageSource source) async {
    try {
      final XFile? photo = await _picker.pickImage(
        source: source,
        maxHeight: 1280,
        imageQuality: 85,
      );
      if (photo != null) {
        if (angle == 'surveyMap') {
          ref
              .read(orchardPlanningProvider.notifier)
              .setSurveyMap(photo.path, 'Camera');
        } else {
          ref
              .read(orchardPlanningProvider.notifier)
              .setPhoto(angle, photo.path);
        }
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  Future<void> _pickSurveyPdf() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
      );

      if (result != null && result.files.single.path != null) {
        ref
            .read(orchardPlanningProvider.notifier)
            .setSurveyMap(result.files.single.path!, 'PDF');
      }
    } catch (e) {
      debugPrint('Error picking pdf: $e');
    }
  }

  Future<void> _pickFromGallery() async {
    try {
      final List<XFile> images = await _picker.pickMultiImage(
        maxWidth: 1280,
        maxHeight: 1280,
        imageQuality: 85,
      );
      for (final img in images) {
        ref.read(orchardPlanningProvider.notifier).addGalleryPhoto(img.path);
      }
      if (images.isNotEmpty &&
          ref.read(orchardPlanningProvider).frontPhoto == null) {
        ref
            .read(orchardPlanningProvider.notifier)
            .setPhoto('front', images.first.path);
      }
    } catch (e) {
      debugPrint('Error picking gallery images: $e');
    }
  }

  void _showEditLocationDialog(
    BuildContext context,
    OrchardDraftState state,
    OrchardPlanningNotifier notifier,
  ) {
    final villageCtrl = TextEditingController(text: state.village);
    final districtCtrl = TextEditingController(text: state.district);
    final stateCtrl = TextEditingController(text: state.stateName);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(
              Icons.edit_location_alt_rounded,
              color: AppColors.primary,
            ),
            const SizedBox(width: 8),
            Text(
              l10n.editLocation,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: villageCtrl,
                decoration: const InputDecoration(
                  labelText: 'Village / Town',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.location_city_rounded),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: districtCtrl,
                decoration: const InputDecoration(
                  labelText: 'District',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.map_rounded),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: stateCtrl,
                decoration: const InputDecoration(
                  labelText: 'State',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.terrain_rounded),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.cancel),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              notifier.setLocationDetails(
                lat: state.latitude,
                lng: state.longitude,
                village: villageCtrl.text.trim(),
                district: districtCtrl.text.trim(),
                stateName: stateCtrl.text.trim(),
              );
              Navigator.pop(ctx);
            },
            child: Text(l10n.save),
          ),
        ],
      ),
    );
  }

  void _showMapPickerModal(
    BuildContext context,
    OrchardDraftState state,
    OrchardPlanningNotifier notifier,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  l10n.selectFarmOnMap,
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              l10n.dragPinToMark,
              style: TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: Stack(
                  children: [
                    Container(
                      color: const Color(0xFFE0E5D5),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.map_rounded,
                              size: 80,
                              color: Colors.green.shade700.withOpacity(0.3),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Interactive Map Coordinates:\n${state.latitude.toStringAsFixed(4)}° N, ${state.longitude.toStringAsFixed(4)}° E',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const Center(
                      child: Icon(
                        Icons.location_on_rounded,
                        size: 48,
                        color: Colors.redAccent,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(l10n.farmCoordinatesUpdated)),
                  );
                },
                child: Text(
                  l10n.confirmLocation,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUploadOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isSmall = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(
          vertical: isSmall ? 12 : 20,
          horizontal: 8,
        ),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFB0BEC5), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(5),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: isSmall
            ? Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(icon, color: const Color(0xFF1B6327), size: 20),
                  const SizedBox(width: 6),
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              )
            : Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  icon == Icons.camera_alt_outlined
                      ? _RipplingIcon(icon: icon, size: 30)
                      : Icon(icon, color: const Color(0xFF1B6327), size: 32),
                  const SizedBox(height: 10),
                  Text(
                    label,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      height: 1.2,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildStep0SurveyMap(
    BuildContext context,
    OrchardDraftState state,
    OrchardPlanningNotifier notifier,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 22.0, vertical: 12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: 16),
          Text(
            l10n.uploadDocument,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: -0.4,
            ),
          ),
          const SizedBox(height: 10),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              l10n.surveyMapSubtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: AppColors.textSecondary,
                height: 1.35,
              ),
            ),
          ),
          const SizedBox(height: 32),
          _buildUploadOption(
            icon: Icons.camera_alt_outlined,
            label: l10n.takePhoto,
            onTap: () => _pickImage('surveyMap', ImageSource.camera),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildUploadOption(
                  icon: Icons.picture_as_pdf_outlined,
                  label: l10n.uploadPdf,
                  onTap: _pickSurveyPdf,
                  isSmall: true,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildUploadOption(
                  icon: Icons.photo_library_outlined,
                  label: l10n.fromGallery,
                  onTap: () => _pickImage('surveyMap', ImageSource.gallery),
                  isSmall: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),
          Container(
            width: double.infinity,
            height: 190,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: state.surveyMapPath != null
                    ? const Color(0xFF1B6327)
                    : const Color(0xFFB0BEC5),
                width: 1.5,
                strokeAlign: BorderSide.strokeAlignCenter,
              ),
            ),
            child: Center(
              child: state.surveyMapPath == null
                  ? const Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.image_outlined,
                          size: 48,
                          color: Color(0xFF90A4AE),
                        ),
                        SizedBox(height: 12),
                        Text(
                          'No file selected',
                          style: TextStyle(
                            fontSize: 16,
                            color: Color(0xFF78909C),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    )
                  : Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          state.surveyMapType == 'PDF'
                              ? Icons.picture_as_pdf
                              : Icons.check_circle_outline_rounded,
                          size: 48,
                          color: const Color(0xFF1B6327),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          state.surveyMapType == 'PDF'
                              ? l10n.pdfUploaded
                              : l10n.imageSelected,
                          style: const TextStyle(
                            fontSize: 16,
                            color: Color(0xFF1B6327),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          state.surveyMapPath!.split('/').last,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 12),
                        TextButton.icon(
                          onPressed: () {
                            notifier.clearSurveyMap();
                          },
                          icon: const Icon(
                            Icons.delete_outline,
                            color: Colors.red,
                          ),
                          label: Text(
                            l10n.remove,
                            style: const TextStyle(color: Colors.red),
                          ),
                        ),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 36),
          InkWell(
            onTap: () {
              notifier.clearSurveyMap();
              notifier.nextStep();
            },
            child: const Padding(
              padding: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              child: Text(
                "I don't have this — Skip",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  decoration: TextDecoration.underline,
                  letterSpacing: 0.2,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(orchardPlanningProvider);
    final notifier = ref.read(orchardPlanningProvider.notifier);
    final currentLang = ref.watch(languageProvider);

    final stepProgress = (state.currentStep + 1) / 5.0;
    final stepPercent = '${((state.currentStep + 1) * 20).toInt()}%';

    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F2),
      appBar: FarmerAppBar(
        showBrandTitle: false,
        showTractorIcon: false,
        onBackTap: () {
          if (state.currentStep > 0) {
            _goToStep(state.currentStep - 1);
          } else {
            context.pop();
          }
        },
      ),
      body: Column(
        children: [
          // Step Progress Bar Indicator
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      l10n.step +
                          ' ${state.currentStep + 1} ' +
                          l10n.ofText +
                          ' 5',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          stepPercent,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        // Replay voice instruction button
                        InkWell(
                          onTap: () => _speakCurrentStep(state.currentStep),
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.volume_up_rounded,
                              size: 18,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: stepProgress,
                    minHeight: 8,
                    backgroundColor: const Color(0xFFE9E8E1),
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Main Page View (Steps 1, 2, 3)
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStep0SurveyMap(context, state, notifier),
                _buildStep1Photos(context, state, notifier),
                _buildStep2Location(context, state, notifier),
                _buildStep3OrchardPreference(context, state, notifier),
                _buildStep4LandDetails(context, state, notifier),
              ],
            ),
          ),

          // Bottom Anchored Action Button
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: Color(0xFFE9E8E1), width: 1.5),
              ),
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                height: 64,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  onPressed: state.isSubmitting
                      ? null
                      : () async {
                          if (state.currentStep < 4) {
                            _goToStep(state.currentStep + 1);
                          } else {
                            // Step 5 -> Final Submit
                            final success = await notifier.submitOrchardPlan();
                            if (success && context.mounted) {
                              context.pushNamed(
                                AppRoutes.orchardSuccess,
                                extra: {
                                  'landSize': state.landSize,
                                  'soilType': state.soilTypes.join(', '),
                                  'hasMap': state.surveyMapPath != null,
                                },
                              );
                            } else if (!success && context.mounted) {
                              final error = ref.read(orchardPlanningProvider).errorMessage ?? 'Submission failed';
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(error),
                                  backgroundColor: Colors.red,
                                ),
                              );
                            }
                          }
                        },
                  child: state.isSubmitting
                      ? const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 3,
                              ),
                            ),
                            SizedBox(width: 16),
                            Text(
                              'Submitting Farm Details...',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              state.currentStep == 4
                                  ? l10n.submitFarmPlan
                                  : l10n.nextStep,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Icon(
                              state.currentStep == 4
                                  ? Icons.send_rounded
                                  : Icons.arrow_forward_rounded,
                              size: 24,
                            ),
                          ],
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 1: LAND PHOTOS
  // ==========================================
  Widget _buildStep1Photos(
    BuildContext context,
    OrchardDraftState state,
    OrchardPlanningNotifier notifier,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.takePhotosOfLand,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          // Looping Guide Video (No Controls, Silent)
          const _LoopingGuideVideo(
            // Using a placeholder sample video. Replace with actual guide video URL.
            videoUrl:
                'https://res.cloudinary.com/dazwmir34/video/upload/v1786373178/in_this_only_land_should_be_sh_zp4q59.mp4',
          ),
          const SizedBox(height: 24),

          // 2x2 Photo Capture Grid
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.15,
              children: [
                _buildPhotoCard(
                  l10n.frontView,
                  'front',
                  state.frontPhoto,
                  notifier,
                ),
                _buildPhotoCard(
                  l10n.leftView,
                  'left',
                  state.leftPhoto,
                  notifier,
                ),
                _buildPhotoCard(
                  l10n.rightView,
                  'right',
                  state.rightPhoto,
                  notifier,
                ),
                _buildPhotoCard(
                  l10n.backView,
                  'center',
                  state.centerPhoto,
                  notifier,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Gallery fallback button
          Center(
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF6D4E45),
                side: const BorderSide(color: Color(0xFF6D4E45), width: 1.5),
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: _pickFromGallery,
              icon: const Icon(Icons.photo_library_rounded, size: 22),
              label: Text(
                l10n.uploadFromGalleryInstead,
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),

          if (state.galleryPhotos.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              '${state.galleryPhotos.length} ' +
                  l10n.additionalPhotosSelected.replaceAll(
                    '{count}',
                    state.galleryPhotos.length.toString(),
                  ),
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildPhotoCard(
    String title,
    String angle,
    String? imagePath,
    OrchardPlanningNotifier notifier,
  ) {
    final hasImage = imagePath != null && imagePath.isNotEmpty;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: hasImage ? AppColors.primary : const Color(0xFFBFCABA),
          width: hasImage ? 2 : 1.5,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0F6D4E45),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _pickImage(angle, ImageSource.camera),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (hasImage) ...[
                  Expanded(
                    child: Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child:
                              (imagePath.startsWith('http') ||
                                  imagePath.startsWith('https'))
                              ? Image.network(
                                  imagePath,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, _, _) => const Center(
                                    child: Icon(
                                      Icons.check_circle_rounded,
                                      color: AppColors.primary,
                                      size: 40,
                                    ),
                                  ),
                                )
                              : Image.file(
                                  File(imagePath),
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, _, _) => const Center(
                                    child: Icon(
                                      Icons.check_circle_rounded,
                                      color: AppColors.primary,
                                      size: 40,
                                    ),
                                  ),
                                ),
                        ),
                        Positioned(
                          top: 4,
                          right: 4,
                          child: GestureDetector(
                            onTap: () => notifier.clearPhoto(angle),
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Colors.black54,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.refresh_rounded,
                                color: Colors.white,
                                size: 16,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ] else ...[
                  const _RipplingIcon(icon: Icons.photo_camera_rounded),
                  const SizedBox(height: 12),
                  Text(
                    title,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    AppLocalizations.of(context)!.tapToCapture,
                    style: TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ==========================================
  // STEP 2: LOCATION
  // ==========================================
  Widget _buildStep2Location(
    BuildContext context,
    OrchardDraftState state,
    OrchardPlanningNotifier notifier,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppLocalizations.of(context)!.whereIsYourLand,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 24),

          // Map Preview Card
          Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE3E3DC)),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x106D4E45),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.green.shade100, Colors.amber.shade50],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.satellite_alt_rounded,
                            size: 64,
                            color: Colors.green.shade800.withOpacity(0.4),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'GPS: ${state.latitude.toStringAsFixed(4)}° N, ${state.longitude.toStringAsFixed(4)}° E',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.green.shade900,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Center(
                    child: Icon(
                      Icons.location_pin,
                      size: 48,
                      color: Colors.redAccent,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // Action Buttons: Auto-Detect & Choose on Map
          SizedBox(
            width: double.infinity,
            height: 56,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: state.isLocating
                  ? null
                  : () => notifier.autoDetectLocation(),
              icon: state.isLocating
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Icon(Icons.my_location_rounded, size: 24),
              label: Text(
                state.isLocating
                    ? AppLocalizations.of(context)!.detectingLocation
                    : AppLocalizations.of(context)!.autoDetectLocation,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),

          const SizedBox(height: 12),

          SizedBox(
            width: double.infinity,
            height: 56,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF6D4E45),
                side: const BorderSide(color: Color(0xFF6D4E45), width: 1.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: () => _showMapPickerModal(context, state, notifier),
              icon: const Icon(Icons.map_rounded, size: 24),
              label: Text(
                AppLocalizations.of(context)!.chooseOnMap,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Detected Address Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE3E3DC)),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x0F6D4E45),
                  blurRadius: 12,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.home_work_rounded,
                    color: AppColors.primary,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        AppLocalizations.of(context)!.detectedLocation,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textSecondary,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Village: ${state.village}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        'District: ${state.district}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        'State: ${state.stateName}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(
                    Icons.edit_rounded,
                    color: AppColors.secondary,
                  ),
                  onPressed: () =>
                      _showEditLocationDialog(context, state, notifier),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 3: ORCHARD PREFERENCE
  // ==========================================
  Widget _buildStep3OrchardPreference(
    BuildContext context,
    OrchardDraftState state,
    OrchardPlanningNotifier notifier,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppLocalizations.of(context)!.whichOrchardTitle,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            AppLocalizations.of(context)!.whichOrchardSubtitle,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 24),

          GridView.count(
            crossAxisCount: 3,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 0.85,
            children: [
              _buildImageCard(
                title: AppLocalizations.of(context)!.mangoOrchard,
                imageUrl: 'assets/fruits/mango.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.mangoOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.mangoOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.orangeOrchard,
                imageUrl: 'assets/fruits/ORANGE.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.orangeOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.orangeOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.guavaOrchard,
                imageUrl: 'assets/fruits/guava.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.guavaOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.guavaOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.pomegranateOrchard,
                imageUrl: 'assets/fruits/promogranet.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.pomegranateOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.pomegranateOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.bananaOrchard,
                imageUrl: 'assets/fruits/banana.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.bananaOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.bananaOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.papayaOrchard,
                imageUrl: 'assets/fruits/papaya.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.papayaOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.papayaOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.cashewOrchard,
                imageUrl: 'assets/fruits/cashew.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.cashewOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.cashewOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.coconutOrchard,
                imageUrl: 'assets/fruits/coconut.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.coconutOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.coconutOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.custardAppleOrchard,
                imageUrl: 'assets/fruits/custard apple.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.custardAppleOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.custardAppleOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.dragonFruitOrchard,
                imageUrl: 'assets/fruits/dragon.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.dragonFruitOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.dragonFruitOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.grapesOrchard,
                imageUrl: 'assets/fruits/grapes.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.grapesOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.grapesOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.jackfruitOrchard,
                imageUrl: 'assets/fruits/jackfruit.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.jackfruitOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.jackfruitOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.pineappleOrchard,
                imageUrl: 'assets/fruits/pineapple.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.pineappleOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.pineappleOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.sapotaOrchard,
                imageUrl: 'assets/fruits/sapota.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.sapotaOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.sapotaOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.othersOrchard,
                imageUrl: 'assets/images/others.png',
                isSelected: state.preferredOrchards.contains(AppLocalizations.of(context)!.othersOrchard),
                onTap: () => notifier.togglePreferredOrchard(AppLocalizations.of(context)!.othersOrchard),
              ),
              _buildImageCard(
                title: AppLocalizations.of(context)!.notDecided,
                imageUrl: 'assets/images/thinking.png',
                isSelected: state.needExpertSuggestion,
                onTap: () => notifier.toggleExpertSuggestion(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ==========================================
  // STEP 4: LAND DETAILS
  // ==========================================
  Widget _buildStep4LandDetails(
    BuildContext context,
    OrchardDraftState state,
    OrchardPlanningNotifier notifier,
  ) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 0,
    );

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            AppLocalizations.of(context)!.tellUsAboutYourLand,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 24),

          // 1. Land Size (Single-select)
          _buildSectionHeader('1. Farm Land Size', Icons.square_foot_rounded),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _buildFilterChip(
                '< 1 Acre',
                state.landSize == '<1 Acre',
                () => notifier.setLandSize('<1 Acre'),
              ),
              _buildFilterChip(
                '1 - 3 Acres',
                state.landSize == '1-3 Acres',
                () => notifier.setLandSize('1-3 Acres'),
              ),
              _buildFilterChip(
                '3 - 5 Acres',
                state.landSize == '3-5 Acres',
                () => notifier.setLandSize('3-5 Acres'),
              ),
              _buildFilterChip(
                'Above 5 Acres',
                state.landSize == 'Above 5 Acres',
                () => notifier.setLandSize('Above 5 Acres'),
              ),
            ],
          ),

          const SizedBox(height: 28),

          // 2. Water Availability (Multi-select)
          _buildSectionHeader(
            '2. Water Availability',
            Icons.water_drop_rounded,
          ),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 3,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 0.85,
            children: [
              _buildImageCard(
                title: 'Borewell',
                imageUrl: 'assets/images/borewell.png',
                isSelected: state.waterSources.contains('Borewell'),
                onTap: () => notifier.toggleWaterSource('Borewell'),
              ),
              _buildImageCard(
                title: 'Canal',
                imageUrl: 'assets/images/canal.png',
                isSelected: state.waterSources.contains('Canal'),
                onTap: () => notifier.toggleWaterSource('Canal'),
              ),
              _buildImageCard(
                title: 'Drip',
                imageUrl: 'assets/images/drip.png',
                isSelected: state.waterSources.contains('Drip'),
                onTap: () => notifier.toggleWaterSource('Drip'),
              ),
              _buildImageCard(
                title: 'Rain-fed',
                imageUrl: 'assets/images/rain.png',
                isSelected: state.waterSources.contains('Rain-fed'),
                onTap: () => notifier.toggleWaterSource('Rain-fed'),
              ),
            ],
          ),

          const SizedBox(height: 28),

          // 3. Soil Type (Multi-select)
          _buildSectionHeader('3. Soil Type', Icons.landscape_rounded),
          const SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 3,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 0.85,
            children: [
              _buildImageCard(
                title: 'Red Soil',
                imageUrl: 'assets/images/ red soil.png',
                isSelected: state.soilTypes.contains('Red Soil (Lal Mitti)'),
                onTap: () => notifier.toggleSoilType('Red Soil (Lal Mitti)'),
              ),
              _buildImageCard(
                title: 'Black Soil',
                imageUrl: 'assets/images/black soil.png',
                isSelected: state.soilTypes.contains('Black Soil (Kali Mitti)'),
                onTap: () => notifier.toggleSoilType('Black Soil (Kali Mitti)'),
              ),
              _buildImageCard(
                title: 'Sandy Soil',
                imageUrl: 'assets/images/sandy soil.png',
                isSelected: state.soilTypes.contains(
                  'Sandy Soil (Balui Mitti)',
                ),
                onTap: () =>
                    notifier.toggleSoilType('Sandy Soil (Balui Mitti)'),
              ),
              _buildImageCard(
                title: 'Forest Soil',
                imageUrl: 'assets/images/alluvial soil.png',
                isSelected: state.soilTypes.contains('Forest Soil'),
                onTap: () => notifier.toggleSoilType('Forest Soil'),
              ),
              _buildImageCard(
                title: 'Laterite Soil',
                imageUrl: 'assets/images/laterite soil.png',
                isSelected: state.soilTypes.contains('Laterite Soil'),
                onTap: () => notifier.toggleSoilType('Laterite Soil'),
              ),
              _buildImageCard(
                title: 'Alluvial Soil',
                imageUrl: 'assets/images/alluvial soil01.png',
                isSelected: state.soilTypes.contains('Alluvial Soil'),
                onTap: () => notifier.toggleSoilType('Alluvial Soil'),
              ),
              _buildImageCard(
                title: 'Saline Soil',
                imageUrl: 'assets/images/saline soil.png',
                isSelected: state.soilTypes.contains('Saline Soil'),
                onTap: () => notifier.toggleSoilType('Saline Soil'),
              ),
            ],
          ),

          const SizedBox(height: 28),

          // 4. Voice Note
          _buildSectionHeader(
            '4. Voice Note for Expert (Optional)',
            Icons.mic_rounded,
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE3E3DC)),
            ),
            child: Column(
              children: [
                if (state.voiceNotePath == null) ...[
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () {
                          if (state.isRecordingVoice) {
                            notifier.setRecordingVoice(false);
                            notifier.setVoiceNote(
                              '/local/recordings/farm_note.m4a',
                              15,
                            );
                          } else {
                            notifier.setRecordingVoice(true);
                          }
                        },
                        child: Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: state.isRecordingVoice
                                ? Colors.redAccent
                                : AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            state.isRecordingVoice
                                ? Icons.stop_rounded
                                : Icons.mic_rounded,
                            color: Colors.white,
                            size: 28,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Text(
                          state.isRecordingVoice
                              ? 'Recording... Tap stop when finished'
                              : 'Tap mic to speak your questions or specific requests in your language.',
                          style: TextStyle(
                            fontSize: 14,
                            color: state.isRecordingVoice
                                ? Colors.redAccent
                                : AppColors.textSecondary,
                            fontWeight: state.isRecordingVoice
                                ? FontWeight.bold
                                : FontWeight.normal,
                          ),
                        ),
                      ),
                    ],
                  ),
                ] else ...[
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          state.isPlayingVoice
                              ? Icons.pause_circle_filled_rounded
                              : Icons.play_circle_fill_rounded,
                          color: AppColors.primary,
                          size: 40,
                        ),
                        onPressed: () =>
                            notifier.setPlayingVoice(!state.isPlayingVoice),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.voiceNote,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              l10n.tapPlayToListen,
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(
                          Icons.delete_outline_rounded,
                          color: Colors.redAccent,
                        ),
                        onPressed: () => notifier.clearVoiceNote(),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppColors.primary, size: 22),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE8F5E9) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFFC7CEC7),
            width: isSelected ? 2.0 : 1.0,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: AppColors.primary.withAlpha(50),
                blurRadius: 8,
                offset: const Offset(0, 4),
              )
            else
              BoxShadow(
                color: Colors.black.withAlpha(10),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 15,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageCard({
    required String title,
    required String imageUrl,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE8F5E9) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFFC7CEC7),
            width: isSelected ? 3.0 : 1.0,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: AppColors.primary.withAlpha(50),
                blurRadius: 10,
                offset: const Offset(0, 5),
              )
            else
              BoxShadow(
                color: Colors.black.withAlpha(15),
                blurRadius: 6,
                offset: const Offset(0, 3),
              ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(15),
                    ),
                    child: imageUrl.startsWith('http')
                        ? Image.network(
                            imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                                  color: const Color(0xFFF0F0F0),
                                  child: const Icon(
                                    Icons.image_not_supported_rounded,
                                    color: Colors.grey,
                                  ),
                                ),
                          )
                        : Image.asset(
                            imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                                  color: const Color(0xFFF0F0F0),
                                  child: const Icon(
                                    Icons.image_not_supported_rounded,
                                    color: Colors.grey,
                                  ),
                                ),
                          ),
                  ),
                  if (isSelected)
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.4),
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(13),
                        ),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.check_circle,
                          color: Colors.white,
                          size: 36,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Text(
                title,
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                  height: 1.2,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// An icon that pulses with a ripple effect to draw the farmer's attention.
class _RipplingIcon extends StatefulWidget {
  final IconData icon;
  final double size;

  const _RipplingIcon({required this.icon, this.size = 30});

  @override
  State<_RipplingIcon> createState() => _RipplingIconState();
}

class _RipplingIconState extends State<_RipplingIcon>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 700),
      vsync: this,
    )..repeat(reverse: true);
    _animation = Tween<double>(
      begin: 1.0,
      end: 1.25,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        final double baseSize = widget.size * 1.8;
        // Calculate a normalized value from 0.0 to 1.0 for the glow based on scale
        final double glowProgress = (_animation.value - 1.0) / 0.25;

        return SizedBox(
          width: baseSize,
          height: baseSize,
          child: Transform.scale(
            scale: _animation.value,
            child: Container(
              width: baseSize,
              height: baseSize,
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.5 * glowProgress),
                    blurRadius: 15 * glowProgress,
                    spreadRadius: 5 * glowProgress,
                  ),
                ],
              ),
              child: Icon(
                widget.icon,
                size: widget.size,
                color: AppColors.primary,
              ),
            ),
          ),
        );
      },
    );
  }
}

class _LoopingGuideVideo extends StatefulWidget {
  final String videoUrl;

  const _LoopingGuideVideo({Key? key, required this.videoUrl})
    : super(key: key);

  @override
  State<_LoopingGuideVideo> createState() => _LoopingGuideVideoState();
}

class _LoopingGuideVideoState extends State<_LoopingGuideVideo> {
  late VideoPlayerController _controller;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl))
      ..initialize().then((_) {
        _controller.setVolume(0.0); // Silent
        _controller.setLooping(true); // Loops indefinitely
        _controller.play(); // Auto-plays
        setState(() {});
      });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_controller.value.isInitialized) {
      return Container(
        height: 180,
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.circular(16),
      child: AspectRatio(
        aspectRatio: _controller.value.aspectRatio,
        child: VideoPlayer(_controller),
      ),
    );
  }
}
