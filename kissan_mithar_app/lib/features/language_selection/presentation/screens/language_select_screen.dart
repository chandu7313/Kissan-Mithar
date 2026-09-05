import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_language.dart';
import '../../../../shared/widgets/large_button.dart';

class LanguageSelectScreen extends ConsumerStatefulWidget {
  const LanguageSelectScreen({super.key});

  @override
  ConsumerState<LanguageSelectScreen> createState() => _LanguageSelectScreenState();
}

class _LanguageSelectScreenState extends ConsumerState<LanguageSelectScreen> {
  AppLanguage _selectedLanguage = AppLanguage.english;

  @override
  void initState() {
    super.initState();
    _selectedLanguage = ref.read(languageNotifierProvider);
  }

  String _getLetterForLanguage(AppLanguage lang) {
    switch (lang) {
      case AppLanguage.telugu:
        return 'అ';
      case AppLanguage.hindi:
        return 'अ';
      case AppLanguage.english:
        return 'A';
      case AppLanguage.kannada:
        return 'ಕ';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),

                  // Title
                  const Text(
                    'Choose Your\nLanguage',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primaryGreen,
                      height: 1.2,
                      letterSpacing: -0.5,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Subtitle
                  const Text(
                    'Select the language you are most\ncomfortable with.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                      height: 1.35,
                    ),
                  ),

                  const SizedBox(height: 32),

                  // 2x2 Language Grid (Fixed Heights to prevent overflow)
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.95,
                    children: AppLanguage.values.map((lang) {
                      final isSelected = lang == _selectedLanguage;

                      return InkWell(
                        onTap: () {
                          setState(() {
                            _selectedLanguage = lang;
                          });
                          ref.read(languageNotifierProvider.notifier).setLanguage(lang);
                        },
                        borderRadius: BorderRadius.circular(20),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.primaryGreen : AppColors.surface,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? AppColors.primaryGreen : AppColors.borderSubtle,
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: isSelected
                                    ? AppColors.primaryGreen.withAlpha(45)
                                    : Colors.black.withAlpha(8),
                                blurRadius: 14,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Stack(
                            children: [
                              // Top-right check badge when selected
                              if (isSelected)
                                Positioned(
                                  top: 12,
                                  right: 12,
                                  child: Container(
                                    width: 24,
                                    height: 24,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFF0F4217),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.check,
                                      color: Colors.white,
                                      size: 15,
                                    ),
                                  ),
                                ),

                              // Center Icon & Text
                              Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      _getLetterForLanguage(lang),
                                      style: TextStyle(
                                        fontSize: 38,
                                        fontWeight: FontWeight.bold,
                                        height: 1,
                                        color: isSelected ? Colors.white : AppColors.primaryGreen,
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      lang.label,
                                      style: TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w700,
                                        color: isSelected ? Colors.white : AppColors.textPrimary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 36),

                  // Bottom Button: Continue to Phone Auth
                  LargeButton(
                    label: 'Continue',
                    trailingIcon: const Icon(Icons.arrow_forward, color: Colors.white, size: 22),
                    onPressed: () async {
                      context.push('/auth/phone');
                    },
                  ),

                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
