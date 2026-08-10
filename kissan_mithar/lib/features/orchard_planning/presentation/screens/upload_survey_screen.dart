import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_language.dart';
import 'plan_tracker_screen.dart';

class UploadSurveyScreen extends StatefulWidget {
  final String landSize;
  final String soilType;

  const UploadSurveyScreen({
    super.key,
    required this.landSize,
    required this.soilType,
  });

  @override
  State<UploadSurveyScreen> createState() => _UploadSurveyScreenState();
}

class _UploadSurveyScreenState extends State<UploadSurveyScreen> {
  String? _selectedFileType;

  Widget _buildLanguagePill(BuildContext context) {
    final currentLang = LanguageProvider().currentLanguage;

    return PopupMenuButton<AppLanguage>(
      onSelected: (AppLanguage newLang) {
        setState(() {
          LanguageProvider().setLanguage(newLang);
        });
      },
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      itemBuilder: (context) => AppLanguage.values.map((lang) {
        return PopupMenuItem<AppLanguage>(
          value: lang,
          child: Text(
            '${lang.nativeLabel} (${lang.label})',
            style: TextStyle(
              fontWeight: lang == currentLang ? FontWeight.bold : FontWeight.normal,
              color: lang == currentLang ? AppColors.primaryGreen : AppColors.textPrimary,
            ),
          ),
        );
      }).toList(),
      child: Container(
        margin: const EdgeInsets.only(right: 16),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFE2E6E2),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          currentLang.nativeLabel,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
      ),
    );
  }

  Widget _buildUploadOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 8),
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: const Color(0xFF1B6327), size: 32),
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
      ),
    );
  }

  void _proceedToTracker() {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (context) => PlanTrackerScreen(
          landSize: widget.landSize,
          soilType: widget.soilType,
          hasMap: _selectedFileType != null,
        ),
      ),
      (route) => route.isFirst,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Add Your Land\nSurvey Map',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.primaryGreen,
            letterSpacing: -0.3,
            height: 1.15,
          ),
        ),
        centerTitle: true,
        actions: [
          _buildLanguagePill(context),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 22.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 16),

                  // Header
                  const Text(
                    'Upload Document',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.4,
                    ),
                  ),

                  const SizedBox(height: 10),

                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Have a survey map from your Panchayat Secretary? Add it here.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        color: AppColors.textSecondary,
                        height: 1.35,
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // 3 Option Buttons
                  Row(
                    children: [
                      _buildUploadOption(
                        icon: Icons.camera_alt_outlined,
                        label: 'Take\nPhoto',
                        onTap: () {
                          setState(() {
                            _selectedFileType = 'Camera Photo';
                          });
                        },
                      ),
                      const SizedBox(width: 12),
                      _buildUploadOption(
                        icon: Icons.picture_as_pdf_outlined,
                        label: 'Upload\nPDF',
                        onTap: () {
                          setState(() {
                            _selectedFileType = 'Survey_Map.pdf';
                          });
                        },
                      ),
                      const SizedBox(width: 12),
                      _buildUploadOption(
                        icon: Icons.photo_library_outlined,
                        label: 'From\nGallery',
                        onTap: () {
                          setState(() {
                            _selectedFileType = 'Land_Map_Image.jpg';
                          });
                        },
                      ),
                    ],
                  ),

                  const SizedBox(height: 28),

                  // Dashed Border Upload Area
                  Container(
                    width: double.infinity,
                    height: 190,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(
                        color: _selectedFileType != null ? const Color(0xFF1B6327) : const Color(0xFFB0BEC5),
                        width: 1.5,
                        strokeAlign: BorderSide.strokeAlignCenter,
                      ),
                    ),
                    child: Center(
                      child: _selectedFileType == null
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
                                  'No file selected yet',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFF78909C),
                                  ),
                                ),
                              ],
                            )
                          : Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 56,
                                  height: 56,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFE8F5E9),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.check_circle_rounded,
                                    color: Color(0xFF1B6327),
                                    size: 36,
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  _selectedFileType!,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                TextButton(
                                  onPressed: () {
                                    setState(() {
                                      _selectedFileType = null;
                                    });
                                  },
                                  child: Text(l10n.changeFile, style: const TextStyle(color: Color(0xFFC62828))),
                                ),
                              ],
                            ),
                    ),
                  ),

                  const SizedBox(height: 36),

                  // Submit or Skip
                  if (_selectedFileType != null) ...[
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1B6327),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        onPressed: _proceedToTracker,
                        child: const Text(
                          'Submit Orchard Plan Request',
                          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // "I don't have this — Skip"
                  InkWell(
                    onTap: _proceedToTracker,
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
            ),
          ),
        ),
      ),
    );
  }
}
