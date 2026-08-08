import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_language.dart';
import '../../../../core/localization/app_localizations.dart';
import '../../../../core/routing/app_router.dart';
import '../../providers/orchard_planning_provider.dart';

class OrchardGuidedFlowScreen extends ConsumerStatefulWidget {
  const OrchardGuidedFlowScreen({super.key});

  @override
  ConsumerState<OrchardGuidedFlowScreen> createState() => _OrchardGuidedFlowScreenState();
}

class _OrchardGuidedFlowScreenState extends ConsumerState<OrchardGuidedFlowScreen> {
  late final PageController _pageController;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    final currentStep = ref.read(orchardPlanningProvider).currentStep;
    _pageController = PageController(initialPage: currentStep);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _goToStep(int step) {
    ref.read(orchardPlanningProvider.notifier).setStep(step);
    _pageController.animateToPage(
      step,
      duration: const Duration(milliseconds: 350),
      curve: Curves.easeInOutCubic,
    );
  }

  Future<void> _pickImage(String angle, ImageSource source) async {
    try {
      final XFile? photo = await _picker.pickImage(
        source: source,
        maxWidth: 1280,
        maxHeight: 1280,
        imageQuality: 85,
      );
      if (photo != null) {
        ref.read(orchardPlanningProvider.notifier).setPhoto(angle, photo.path);
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
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
      if (images.isNotEmpty && ref.read(orchardPlanningProvider).frontPhoto == null) {
        ref.read(orchardPlanningProvider.notifier).setPhoto('front', images.first.path);
      }
    } catch (e) {
      debugPrint('Error picking gallery images: $e');
    }
  }

  void _showEditLocationDialog(BuildContext context, OrchardDraftState state, OrchardPlanningNotifier notifier) {
    final villageCtrl = TextEditingController(text: state.village);
    final districtCtrl = TextEditingController(text: state.district);
    final stateCtrl = TextEditingController(text: state.stateName);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.edit_location_alt_rounded, color: AppColors.primary),
            SizedBox(width: 8),
            Text('Edit Location', style: TextStyle(fontWeight: FontWeight.bold)),
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
            child: const Text('Cancel'),
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
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showMapPickerModal(BuildContext context, OrchardDraftState state, OrchardPlanningNotifier notifier) {
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
                const Text(
                  'Select Farm on Map',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Drag the pin to mark your farm boundary.',
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
                            Icon(Icons.map_rounded, size: 80, color: Colors.green.shade700.withOpacity(0.3)),
                            const SizedBox(height: 8),
                            Text(
                              'Interactive Map Coordinates:\n${state.latitude.toStringAsFixed(4)}° N, ${state.longitude.toStringAsFixed(4)}° E',
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontWeight: FontWeight.w600),
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
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Farm coordinates updated!')),
                  );
                },
                child: const Text('Confirm Location', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(orchardPlanningProvider);
    final notifier = ref.read(orchardPlanningProvider.notifier);
    final currentLang = ref.watch(languageProvider);

    final stepProgress = (state.currentStep + 1) / 3.0;
    final stepPercent = '${((state.currentStep + 1) * 33.33).toInt()}%';

    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F2),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(80),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Color(0x12000000),
                blurRadius: 10,
                offset: Offset(0, 3),
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_rounded, size: 28, color: AppColors.textPrimary),
                    onPressed: () {
                      if (state.currentStep > 0) {
                        _goToStep(state.currentStep - 1);
                      } else {
                        context.pop();
                      }
                    },
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.eco_rounded, color: AppColors.primary, size: 28),
                  const SizedBox(width: 6),
                  const Text(
                    'Kissan Mithar',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F4ED),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFBFCABA)),
                    ),
                    child: Text(
                      currentLang.nativeName,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
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
                      'Step ${state.currentStep + 1} of 3',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      stepPercent,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
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
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
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
                _buildStep1Photos(context, state, notifier),
                _buildStep2Location(context, state, notifier),
                _buildStep3LandDetails(context, state, notifier),
              ],
            ),
          ),

          // Bottom Anchored Action Button
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE9E8E1), width: 1.5)),
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
                          if (state.currentStep == 0) {
                            _goToStep(1);
                          } else if (state.currentStep == 1) {
                            _goToStep(2);
                          } else {
                            // Step 3 -> Final Submit
                            final success = await notifier.submitOrchardPlan();
                            if (success && context.mounted) {
                              context.pushNamed(AppRoutes.planTracker, extra: {
                                'landSize': state.landSize,
                                'soilType': state.soilType,
                                'hasMap': true,
                              });
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
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3),
                            ),
                            SizedBox(width: 16),
                            Text(
                              'Submitting Farm Details...',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              state.currentStep == 2 ? 'Submit Farm Plan' : 'Next Step',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(width: 8),
                            Icon(
                              state.currentStep == 2 ? Icons.send_rounded : Icons.arrow_forward_rounded,
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
  Widget _buildStep1Photos(BuildContext context, OrchardDraftState state, OrchardPlanningNotifier notifier) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Take Photos of Your Land',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Please capture clear images of your farm from the following 4 angles to help our agronomists assess soil & slope.',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),

          // 2x2 Photo Capture Grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 0.95,
            children: [
              _buildPhotoCard('Front View', 'front', state.frontPhoto, notifier),
              _buildPhotoCard('Left View', 'left', state.leftPhoto, notifier),
              _buildPhotoCard('Right View', 'right', state.rightPhoto, notifier),
              _buildPhotoCard('Center View', 'center', state.centerPhoto, notifier),
            ],
          ),

          const SizedBox(height: 24),

          // Gallery fallback button
          Center(
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF6D4E45),
                side: const BorderSide(color: Color(0xFF6D4E45), width: 1.5),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _pickFromGallery,
              icon: const Icon(Icons.photo_library_rounded, size: 22),
              label: const Text(
                'Upload from Gallery instead',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),

          if (state.galleryPhotos.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              '${state.galleryPhotos.length} additional photo(s) selected from gallery',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w600),
            ),
          ],
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildPhotoCard(String title, String angle, String? imagePath, OrchardPlanningNotifier notifier) {
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
                          child: (imagePath.startsWith('http') || imagePath.startsWith('https'))
                              ? Image.network(
                                  imagePath,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Center(
                                    child: Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 40),
                                  ),
                                )
                              : Image.file(
                                  File(imagePath),
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Center(
                                    child: Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 40),
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
                              child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 16),
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
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(28),
                    ),
                    child: const Icon(Icons.photo_camera_rounded, size: 30, color: AppColors.primary),
                  ),
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
                  const Text(
                    'Tap to capture',
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
  Widget _buildStep2Location(BuildContext context, OrchardDraftState state, OrchardPlanningNotifier notifier) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Where is your land?',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Help us locate your farm to match weather, microclimate, and local market prices accurately.',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
              height: 1.4,
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
                          Icon(Icons.satellite_alt_rounded, size: 64, color: Colors.green.shade800.withOpacity(0.4)),
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
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: state.isLocating ? null : () => notifier.autoDetectLocation(),
              icon: state.isLocating
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Icon(Icons.my_location_rounded, size: 24),
              label: Text(
                state.isLocating ? 'Detecting Location...' : 'Auto-Detect Location',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
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
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: () => _showMapPickerModal(context, state, notifier),
              icon: const Icon(Icons.map_rounded, size: 24),
              label: const Text(
                'Choose on Map',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
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
                  child: const Icon(Icons.home_work_rounded, color: AppColors.primary, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Detected Location',
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
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      Text(
                        'District: ${state.district}',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                      Text(
                        'State: ${state.stateName}',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.edit_rounded, color: AppColors.secondary),
                  onPressed: () => _showEditLocationDialog(context, state, notifier),
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
  // STEP 3: LAND DETAILS
  // ==========================================
  Widget _buildStep3LandDetails(BuildContext context, OrchardDraftState state, OrchardPlanningNotifier notifier) {
    final currencyFormatter = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Tell us about your land',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Provide details about water, soil, budget, and goals to get an expert-certified orchard design.',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24),

          // 1. Land Size Single Select Radio Cards
          _buildSectionHeader('1. Land Size', Icons.straighten_rounded),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: ['<1 Acre', '1-3 Acres', '3-5 Acres', 'Above 5 Acres'].map((size) {
              final isSelected = state.landSize == size;
              return InkWell(
                onTap: () => notifier.setLandSize(size),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : const Color(0xFFBFCABA),
                      width: 1.5,
                    ),
                  ),
                  child: Text(
                    size,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 28),

          // 2. Water Availability (Multi-select)
          _buildSectionHeader('2. Water Availability', Icons.water_drop_rounded),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _buildFilterChip('Borewell', Icons.water_damage_rounded, state.waterSources.contains('Borewell'), () => notifier.toggleWaterSource('Borewell')),
              _buildFilterChip('Canal', Icons.waves_rounded, state.waterSources.contains('Canal'), () => notifier.toggleWaterSource('Canal')),
              _buildFilterChip('Drip', Icons.grain_rounded, state.waterSources.contains('Drip'), () => notifier.toggleWaterSource('Drip')),
              _buildFilterChip('Rain-fed', Icons.cloud_queue_rounded, state.waterSources.contains('Rain-fed'), () => notifier.toggleWaterSource('Rain-fed')),
            ],
          ),

          const SizedBox(height: 28),

          // 3. Soil Type (Single select)
          _buildSectionHeader('3. Soil Type', Icons.landscape_rounded),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildSoilCard('Red Soil', 'Red Soil (Lal Mitti)', const Color(0xFFD32F2F), state.soilType, notifier),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildSoilCard('Black Soil', 'Black Soil (Kali Mitti)', const Color(0xFF37474F), state.soilType, notifier),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildSoilCard('Sandy Soil', 'Sandy Soil (Balui Mitti)', const Color(0xFFFFA000), state.soilType, notifier),
              ),
            ],
          ),

          const SizedBox(height: 28),

          // 4. Existing Crops (Multi-select)
          _buildSectionHeader('4. Existing / Previous Crops', Icons.agriculture_rounded),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: ['Cotton', 'Soybean', 'Paddy', 'Sugarcane', 'Vegetables', 'None / Fallow'].map((crop) {
              final isSelected = state.existingCrops.contains(crop);
              return FilterChip(
                label: Text(crop),
                selected: isSelected,
                selectedColor: const Color(0xFFE8F5E9),
                checkmarkColor: AppColors.primary,
                labelStyle: TextStyle(
                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
                onSelected: (_) => notifier.toggleExistingCrop(crop),
              );
            }).toList(),
          ),

          const SizedBox(height: 28),

          // 5. Electricity & Drip Toggles
          _buildSectionHeader('5. Farm Infrastructure', Icons.bolt_rounded),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE3E3DC)),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  activeColor: AppColors.primary,
                  title: const Text('Electricity Availability', style: TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('3-phase or single-phase power on site'),
                  value: state.hasElectricity,
                  onChanged: (val) => notifier.setElectricity(val),
                ),
                const Divider(),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  activeColor: AppColors.primary,
                  title: const Text('Existing Drip System', style: TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: const Text('Drip irrigation pipes installed'),
                  value: state.hasDripIrrigation,
                  onChanged: (val) => notifier.setDripIrrigation(val),
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

          // 6. Budget Slider
          _buildSectionHeader('6. Estimated Budget', Icons.currency_rupee_rounded),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE3E3DC)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Planned Investment:', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5E9),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        state.budget >= 100000 ? '₹1,00,000+' : currencyFormatter.format(state.budget),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                Slider(
                  value: state.budget,
                  min: 20000,
                  max: 100000,
                  divisions: 16,
                  activeColor: AppColors.primary,
                  inactiveColor: const Color(0xFFE0E0E0),
                  onChanged: (val) => notifier.setBudget(val),
                ),
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('₹20,000 (Basic)', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    Text('₹1,00,000+ (High-Density)', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),

          // 7. Preferred Orchard
          _buildSectionHeader('7. Preferred Orchard Crop', Icons.park_rounded),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              'Mango (Kesar Variety)',
              'Guava (Taiwan Pink)',
              'Pomegranate (Bhagwa)',
              'Custard Apple (Sitaphal)',
              'Dragon Fruit',
              'Sweet Lime (Mosambi)',
            ].map((orchard) {
              final isSelected = state.preferredOrchards.contains(orchard);
              return FilterChip(
                label: Text(orchard),
                selected: isSelected,
                selectedColor: const Color(0xFFE8F5E9),
                checkmarkColor: AppColors.primary,
                labelStyle: TextStyle(
                  color: isSelected ? AppColors.primary : AppColors.textPrimary,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
                onSelected: (_) => notifier.togglePreferredOrchard(orchard),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),
          InkWell(
            onTap: () => notifier.toggleExpertSuggestion(),
            borderRadius: BorderRadius.circular(12),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: state.needExpertSuggestion ? const Color(0xFFFFF3E0) : Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: state.needExpertSuggestion ? const Color(0xFFFFA000) : const Color(0xFFBFCABA),
                  width: 1.5,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    state.needExpertSuggestion ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                    color: state.needExpertSuggestion ? const Color(0xFFE65100) : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'I need expert suggestion (Recommend based on soil & climate)',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 28),

          // 8. Expected Goal
          _buildSectionHeader('8. Primary Farming Goal', Icons.flag_rounded),
          const SizedBox(height: 12),
          Column(
            children: [
              'Higher Profit Margin',
              'Low Water Requirement',
              'Export Quality Produce',
              'Organic Farming',
              'Long-Term Steady Income',
            ].map((goal) {
              final isSelected = state.expectedGoal == goal;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: InkWell(
                  onTap: () => notifier.setExpectedGoal(goal),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFFE8F5E9) : Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : const Color(0xFFE3E3DC),
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isSelected ? Icons.check_circle_rounded : Icons.circle_outlined,
                          color: isSelected ? AppColors.primary : AppColors.textSecondary,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          goal,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 28),

          // 9. Voice Note
          _buildSectionHeader('9. Voice Note for Expert (Optional)', Icons.mic_rounded),
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
                            notifier.setVoiceNote('/local/recordings/farm_note.m4a', 15);
                          } else {
                            notifier.setRecordingVoice(true);
                          }
                        },
                        child: Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: state.isRecordingVoice ? Colors.redAccent : AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            state.isRecordingVoice ? Icons.stop_rounded : Icons.mic_rounded,
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
                            color: state.isRecordingVoice ? Colors.redAccent : AppColors.textSecondary,
                            fontWeight: state.isRecordingVoice ? FontWeight.bold : FontWeight.normal,
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
                          state.isPlayingVoice ? Icons.pause_circle_filled_rounded : Icons.play_circle_fill_rounded,
                          color: AppColors.primary,
                          size: 40,
                        ),
                        onPressed: () => notifier.setPlayingVoice(!state.isPlayingVoice),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Voice Note (0:15)', style: TextStyle(fontWeight: FontWeight.bold)),
                            Text('Tap play to listen', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline_rounded, color: Colors.redAccent),
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

  Widget _buildFilterChip(String label, IconData icon, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE8F5E9) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFFBFCABA),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: isSelected ? AppColors.primary : AppColors.textSecondary),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSoilCard(String title, String fullName, Color color, String selectedSoil, OrchardPlanningNotifier notifier) {
    final isSelected = selectedSoil == fullName;

    return InkWell(
      onTap: () => notifier.setSoilType(fullName),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE8F5E9) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFFBFCABA),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
