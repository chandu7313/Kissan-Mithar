import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../services/notification_service.dart';
import '../../../../l10n/app_localizations.dart';

class NotificationPermissionScreen extends ConsumerStatefulWidget {
  const NotificationPermissionScreen({super.key});

  @override
  ConsumerState<NotificationPermissionScreen> createState() =>
      _NotificationPermissionScreenState();
}

class _NotificationPermissionScreenState
    extends ConsumerState<NotificationPermissionScreen> {
  bool _isEnabling = false;

  Future<void> _enableNotifications() async {
    setState(() => _isEnabling = true);
    try {
      await NotificationService().requestNotificationPermissions();
      await NotificationService().registerDeviceToken();
    } catch (_) {
      // Continue safely
    } finally {
      if (mounted) {
        setState(() => _isEnabling = false);
        context.go('/home');
      }
    }
  }

  Future<void> _skipForNow() async {
    await NotificationService().setPermissionPromptSeen(true);
    if (mounted) {
      context.go('/home');
    }
  }

  Widget _buildBenefitCard({
    required IconData icon,
    required Color iconBgColor,
    required Color iconColor,
    required String title,
    required String description,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8ECE8)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: iconBgColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 10),

                  // Top Hero Badge / Icon
                  Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: const Color(0xFFA5D6A7),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primaryGreen.withAlpha(25),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.notifications_active_rounded,
                      color: AppColors.primaryGreen,
                      size: 38,
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Title
                  Text(
                    l10n.stayUpdatedOnYourFarm,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primaryGreen,
                      height: 1.2,
                      letterSpacing: -0.5,
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Subtitle
                  Text(
                    l10n.enableAlertsSubtitle,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                      height: 1.35,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // 4 Farmer Benefits List
                  _buildBenefitCard(
                    icon: Icons.cloud_sync_rounded,
                    iconBgColor: const Color(0xFFFFF3E0),
                    iconColor: const Color(0xFFE65100),
                    title: l10n.severeWeatherWarnings,
                    description: l10n.severeWeatherDesc,
                  ),
                  _buildBenefitCard(
                    icon: Icons.video_call_rounded,
                    iconBgColor: const Color(0xFFE3F2FD),
                    iconColor: const Color(0xFF1565C0),
                    title: l10n.agronomistCallReminders,
                    description: l10n.agronomistCallDesc,
                  ),
                  _buildBenefitCard(
                    icon: Icons.trending_up_rounded,
                    iconBgColor: const Color(0xFFE8F5E9),
                    iconColor: const Color(0xFF2E7D32),
                    title: l10n.mandiMarketRateAlerts,
                    description: l10n.mandiMarketRateDesc,
                  ),
                  _buildBenefitCard(
                    icon: Icons.park_rounded,
                    iconBgColor: const Color(0xFFF3E5F5),
                    iconColor: const Color(0xFF7B1FA2),
                    title: l10n.orchardPlanReadyAlert,
                    description: l10n.orchardPlanReadyDesc,
                  ),

                  const SizedBox(height: 24),

                  // Primary Enable Action Button
                  LargeButton(
                    label: _isEnabling ? l10n.enablingAlerts : l10n.turnOnNotifications,
                    leadingIcon: const Icon(
                      Icons.notifications_active_rounded,
                      color: Colors.white,
                      size: 22,
                    ),
                    trailingIcon: const Icon(
                      Icons.arrow_forward,
                      color: Colors.white,
                      size: 22,
                    ),
                    onPressed: _isEnabling ? null : _enableNotifications,
                  ),

                  const SizedBox(height: 12),

                  // Secondary Skip Action Button
                  TextButton(
                    onPressed: _skipForNow,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    ),
                    child: Text(
                      l10n.maybeLaterSkipForNow,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
