import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/routing/app_router.dart';
import '../../providers/orchard_planning_provider.dart';
import 'orchard_plan_report_screen.dart';

class PlanTrackerScreen extends ConsumerWidget {
  final String? landSize;
  final String? soilType;
  final bool? hasMap;

  const PlanTrackerScreen({
    super.key,
    this.landSize,
    this.soilType,
    this.hasMap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(orchardPlanningProvider);
    final notifier = ref.read(orchardPlanningProvider.notifier);

    final displayLandSize = landSize ?? state.landSize;
    final stage = state.currentStage; // 0: Submitted, 1: Under Review, 2: Expert Assigned, 3: Plan Ready, 4: Completed

    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F2),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.goNamed(AppRoutes.home);
            }
          },
        ),
        title: const Row(
          children: [
            Icon(Icons.eco_rounded, color: AppColors.primary, size: 26),
            SizedBox(width: 8),
            Text(
              'Kissan Mithar',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
          ],
        ),
        actions: [
          TextButton.icon(
            onPressed: () => notifier.advanceStage(),
            icon: const Icon(Icons.fast_forward_rounded, size: 18, color: AppColors.primary),
            label: const Text(
              'Demo Next',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              const Text(
                'Plan Status',
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Track the progress of your customized orchard plan.',
                style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),

              // 5-Stage Stepper Container
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE9E8E1)),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x0F6D4E45),
                      blurRadius: 12,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _buildStepperStage(
                      stageIndex: 0,
                      currentStage: stage,
                      title: 'Submitted',
                      subtitle: 'Farm details and photos received',
                      icon: Icons.check_rounded,
                      isLast: false,
                    ),
                    _buildStepperStage(
                      stageIndex: 1,
                      currentStage: stage,
                      title: 'Under Review',
                      subtitle: 'Checking soil & climate requirements',
                      icon: Icons.search_rounded,
                      isLast: false,
                    ),
                    _buildStepperStage(
                      stageIndex: 2,
                      currentStage: stage,
                      title: 'Expert Assigned',
                      subtitle: 'An agronomist is working on it',
                      icon: Icons.person_rounded,
                      isLast: false,
                    ),
                    _buildStepperStage(
                      stageIndex: 3,
                      currentStage: stage,
                      title: 'Plan Ready',
                      subtitle: 'Customized layout & roadmap ready',
                      icon: Icons.agriculture_rounded,
                      isLast: false,
                    ),
                    _buildStepperStage(
                      stageIndex: 4,
                      currentStage: stage,
                      title: 'Completed',
                      subtitle: 'Final plan delivered & consultation active',
                      icon: Icons.task_alt_rounded,
                      isLast: true,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Submission Summary Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE9E8E1)),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x0F6D4E45),
                      blurRadius: 10,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        width: 80,
                        height: 80,
                        color: const Color(0xFFE8F5E9),
                        child: const Icon(Icons.agriculture_rounded, size: 40, color: AppColors.primary),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Submission Summary',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              const Icon(Icons.straighten_rounded, size: 16, color: AppColors.textSecondary),
                              const SizedBox(width: 6),
                              Text(
                                'Land Size: $displayLandSize',
                                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.calendar_today_rounded, size: 16, color: AppColors.textSecondary),
                              const SizedBox(width: 6),
                              Text(
                                'Submitted on: ${state.submittedDate}',
                                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Action Buttons
              if (stage >= 3) ...[
                SizedBox(
                  width: double.infinity,
                  height: 58,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 2,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const OrchardPlanReportScreen()),
                      );
                    },
                    icon: const Icon(Icons.description_rounded, size: 24),
                    label: const Text(
                      'View Your Ready Plan',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
              ],

              SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary, width: 1.5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () => context.goNamed(AppRoutes.home),
                  child: const Text(
                    'Back to Home',
                    style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepperStage({
    required int stageIndex,
    required int currentStage,
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isLast,
  }) {
    final isCompleted = currentStage > stageIndex;
    final isActive = currentStage == stageIndex;

    Color iconBg;
    Color iconColor;
    Color titleColor;

    if (isCompleted) {
      iconBg = AppColors.primary;
      iconColor = Colors.white;
      titleColor = AppColors.textPrimary;
    } else if (isActive) {
      iconBg = AppColors.primary;
      iconColor = Colors.white;
      titleColor = AppColors.primary;
    } else {
      iconBg = const Color(0xFFE9E8E1);
      iconColor = const Color(0xFF707A6C);
      titleColor = const Color(0xFF707A6C);
    }

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Step Icon + Vertical Line
          Column(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: iconBg,
                  shape: BoxShape.circle,
                  boxShadow: isActive
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.4),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ]
                      : null,
                ),
                child: Icon(
                  isCompleted ? Icons.check_rounded : icon,
                  size: 20,
                  color: iconColor,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    color: isCompleted ? AppColors.primary : const Color(0xFFE9E8E1),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),

          // Stage Title & Subtitle
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: isActive ? FontWeight.bold : FontWeight.w600,
                      color: titleColor,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 13,
                      color: isActive ? AppColors.textPrimary : AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
