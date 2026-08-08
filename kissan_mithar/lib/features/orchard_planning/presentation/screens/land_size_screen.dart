import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_language.dart';
import 'soil_type_screen.dart';

class LandSizeScreen extends StatefulWidget {
  const LandSizeScreen({super.key});

  @override
  State<LandSizeScreen> createState() => _LandSizeScreenState();
}

class _LandSizeScreenState extends State<LandSizeScreen> {
  int _acres = 2;
  int _extraUnits = 0;
  bool _isGuntas = true; // true = Guntas, false = Cents

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
        actions: [
          _buildLanguagePill(context),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 8),

                  // Title
                  const Text(
                    'How much land do\nyou have?',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      height: 1.2,
                      letterSpacing: -0.5,
                    ),
                  ),

                  const SizedBox(height: 36),

                  // ACRES LABEL
                  const Text(
                    'ACRES',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      letterSpacing: 1.2,
                    ),
                  ),

                  const SizedBox(height: 14),

                  // Acres Stepper Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Minus button
                      InkWell(
                        onTap: () {
                          if (_acres > 0) {
                            setState(() => _acres--);
                          }
                        },
                        borderRadius: BorderRadius.circular(30),
                        child: Container(
                          width: 58,
                          height: 58,
                          decoration: const BoxDecoration(
                            color: Color(0xFFE5EBE5),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.remove_rounded,
                            size: 28,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),

                      const SizedBox(width: 20),

                      // Number Display Card with Voice Mic Badge
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          Container(
                            width: 120,
                            height: 100,
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withAlpha(8),
                                  blurRadius: 16,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(
                                '$_acres',
                                style: const TextStyle(
                                  fontSize: 64,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                  height: 1.0,
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            top: -12,
                            right: -12,
                            child: Container(
                              width: 38,
                              height: 38,
                              decoration: const BoxDecoration(
                                color: Color(0xFF42A5F5),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black26,
                                    blurRadius: 6,
                                    offset: Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.mic_rounded,
                                color: Colors.white,
                                size: 20,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(width: 20),

                      // Plus button
                      InkWell(
                        onTap: () {
                          setState(() => _acres++);
                        },
                        borderRadius: BorderRadius.circular(30),
                        child: Container(
                          width: 58,
                          height: 58,
                          decoration: const BoxDecoration(
                            color: Color(0xFF1B6327),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.add_rounded,
                            size: 28,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 28),

                  // Unit Selector Toggle (Guntas / Cents)
                  Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () {
                            setState(() => _isGuntas = true);
                          },
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            decoration: BoxDecoration(
                              color: _isGuntas ? const Color(0xFF236B28) : AppColors.surface,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: _isGuntas ? const Color(0xFF236B28) : const Color(0xFFB0BEC5),
                                width: 1.3,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                'Guntas',
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w800,
                                  color: _isGuntas ? Colors.white : AppColors.textPrimary,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: InkWell(
                          onTap: () {
                            setState(() => _isGuntas = false);
                          },
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            decoration: BoxDecoration(
                              color: !_isGuntas ? const Color(0xFF236B28) : AppColors.surface,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: !_isGuntas ? const Color(0xFF236B28) : const Color(0xFFB0BEC5),
                                width: 1.3,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                'Cents',
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w800,
                                  color: !_isGuntas ? Colors.white : AppColors.textPrimary,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 22),

                  // Extra Units Card (EXTRA GUNTAS / EXTRA CENTS)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F5F2),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFE0E0E0)),
                    ),
                    child: Column(
                      children: [
                        Text(
                          _isGuntas ? 'EXTRA GUNTAS' : 'EXTRA CENTS',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            letterSpacing: 1.0,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            InkWell(
                              onTap: () {
                                if (_extraUnits > 0) {
                                  setState(() => _extraUnits--);
                                }
                              },
                              borderRadius: BorderRadius.circular(26),
                              child: Container(
                                width: 50,
                                height: 50,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFE2E7E2),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.remove_rounded, size: 24, color: AppColors.textPrimary),
                              ),
                            ),
                            const SizedBox(width: 18),
                            Container(
                              width: 80,
                              height: 60,
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFFCFD8DC)),
                              ),
                              child: Center(
                                child: Text(
                                  '$_extraUnits',
                                  style: const TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 18),
                            InkWell(
                              onTap: () {
                                setState(() => _extraUnits++);
                              },
                              borderRadius: BorderRadius.circular(26),
                              child: Container(
                                width: 50,
                                height: 50,
                                decoration: const BoxDecoration(
                                  color: Color(0xFFD7E5D8),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.add_rounded, size: 24, color: AppColors.textPrimary),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  // Land Measurement Info Card
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(5),
                          blurRadius: 10,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(14),
                      child: IntrinsicHeight(
                        child: Row(
                          children: [
                            Container(width: 5, color: const Color(0xFF0070BA)),
                            const Expanded(
                              child: Padding(
                                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                child: Row(
                                  children: [
                                    Icon(Icons.info_outline_rounded, color: Color(0xFF0070BA), size: 22),
                                    SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Land Measurement',
                                            style: TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.w800,
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                          SizedBox(height: 2),
                                          Text(
                                            '1 Acre = 40 Guntas = 100 Cents',
                                            style: TextStyle(
                                              fontSize: 13,
                                              color: AppColors.textSecondary,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Next Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1B6327),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => SoilTypeScreen(
                              landSize: '$_acres Acres ${_extraUnits > 0 ? '$_extraUnits ${_isGuntas ? 'Guntas' : 'Cents'}' : ''}',
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.check_circle_outline_rounded, size: 22),
                      label: const Text(
                        'Next',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                      ),
                    ),
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
