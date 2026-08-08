import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_language.dart';
import '../../../../shared/widgets/large_button.dart';
import '../widgets/expert_illustration_banner.dart';

enum CommunicationMode {
  voiceCall('Voice Call', Icons.phone_rounded),
  videoCall('Video Call', Icons.videocam_outlined),
  chat('Chat', Icons.chat_bubble_outline_rounded);

  final String label;
  final IconData icon;

  const CommunicationMode(this.label, this.icon);
}

class BookExpertScreen extends StatefulWidget {
  const BookExpertScreen({super.key});

  @override
  State<BookExpertScreen> createState() => _BookExpertScreenState();
}

class _BookExpertScreenState extends State<BookExpertScreen> {
  CommunicationMode _selectedMode = CommunicationMode.voiceCall;

  void _onBookNow() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
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
              child: const Icon(Icons.check_circle, color: AppColors.primaryGreen, size: 28),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Booking Confirmed',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primaryGreen,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          'Your ${_selectedMode.label} session is booked. An expert agronomist will reach out within 15 minutes.',
          style: const TextStyle(
            fontSize: 16,
            color: AppColors.textPrimary,
            height: 1.4,
          ),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildLanguagePill() {
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
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFF2C3E2D), width: 1.2),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              currentLang.nativeLabel,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(
              Icons.arrow_drop_down_rounded,
              color: AppColors.textPrimary,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModeCard(CommunicationMode mode) {
    final isSelected = mode == _selectedMode;

    return InkWell(
      onTap: () {
        setState(() {
          _selectedMode = mode;
        });
      },
      borderRadius: BorderRadius.circular(16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0F5A1E) : AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF0F5A1E) : const Color(0xFF2C3E2D),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: isSelected
                  ? const Color(0xFF0F5A1E).withAlpha(50)
                  : Colors.black.withAlpha(6),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              mode.icon,
              size: 32,
              color: isSelected ? Colors.white : const Color(0xFF2C3E2D),
            ),
            const SizedBox(height: 10),
            Text(
              mode.label,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: isSelected ? Colors.white : const Color(0xFF2C3E2D),
                letterSpacing: 0.1,
              ),
            ),
          ],
        ),
      ),
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
          'Book an\nExpert',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.primaryGreen,
            height: 1.15,
            letterSpacing: -0.3,
          ),
        ),
        actions: [
          _buildLanguagePill(),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  const Center(
                    child: Text(
                      'Talk to an Expert',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 30,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryGreen,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Subtitle
                  const Center(
                    child: Text(
                      'Choose how you want to connect.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Expert Illustration Banner
                  const ExpertIllustrationBanner(),

                  const SizedBox(height: 24),

                  // Communication Mode Section Header
                  const Text(
                    'Communication Mode',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),

                  const SizedBox(height: 14),

                  // 1. Voice Call Card
                  _buildModeCard(CommunicationMode.voiceCall),

                  const SizedBox(height: 14),

                  // 2. Video Call Card
                  _buildModeCard(CommunicationMode.videoCall),

                  const SizedBox(height: 14),

                  // 3. Chat Card
                  _buildModeCard(CommunicationMode.chat),

                  const SizedBox(height: 32),

                  // Book Now Button
                  LargeButton(
                    label: 'Book Now',
                    leadingIcon: const Icon(
                      Icons.calendar_today_outlined,
                      color: Colors.white,
                      size: 20,
                    ),
                    onPressed: _onBookNow,
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
