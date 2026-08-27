import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../../../core/services/step_voice_guide_service.dart';
import '../../../../core/localization/app_language.dart';
import '../../../../l10n/app_localizations.dart';

class OrchardSuccessScreen extends StatefulWidget {
  final String landSize;
  final String soilType;
  final bool hasMap;

  const OrchardSuccessScreen({
    super.key,
    required this.landSize,
    required this.soilType,
    required this.hasMap,
  });

  @override
  State<OrchardSuccessScreen> createState() => _OrchardSuccessScreenState();
}

class _OrchardSuccessScreenState extends State<OrchardSuccessScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.elasticOut),
    );
    _controller.forward();

    // Play voice guide for success screen
    final currentLang = LanguageProvider().currentLanguage;
    StepVoiceGuideService().speakSuccess(currentLang);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        context.go('/home');
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(),
              
              ScaleTransition(
                scale: _scaleAnimation,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primaryGreen.withOpacity(0.2),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.check_circle_rounded,
                    color: AppColors.primaryGreen,
                    size: 80,
                  ),
                ),
              ),
              
              const SizedBox(height: 32),
              
              Text(
                l10n.farmDetailsSubmittedTitle, 
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 16),
              
              Text(
                l10n.farmDetailsReviewDesc(widget.landSize),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),

              const SizedBox(height: 48),
              
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE9E8E1)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, color: AppColors.primaryGreen, size: 28),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        l10n.trackOrchardPlanDashboard,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              const Spacer(),

              LargeButton(
                label: l10n.trackProgressBtn,
                onPressed: () {
                  context.pushReplacementNamed(
                    'planTracker',
                    extra: {
                      'landSize': widget.landSize,
                      'soilType': widget.soilType,
                      'hasMap': widget.hasMap,
                    },
                  );
                },
              ),
              
              const SizedBox(height: 16),
              
              TextButton(
                onPressed: () => context.go('/home'),
                style: TextButton.styleFrom(
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(
                  l10n.backToHome,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryGreen,
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    ),
    );
  }
}
