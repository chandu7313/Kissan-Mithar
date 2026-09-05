import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class ProgressStepper extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final List<String> stepLabels;

  const ProgressStepper({
    super.key,
    required this.currentStep,
    this.totalSteps = 5,
    this.stepLabels = const [
      'Submitted',
      'Under Review',
      'Expert Assigned',
      'Plan Ready',
      'Completed',
    ],
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(totalSteps, (index) {
        final isCompleted = index < currentStep;
        final isCurrent = index == currentStep;
        final isLast = index == totalSteps - 1;

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Circle & Line Column
              Column(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: isCompleted
                          ? const Color(0xFF1B6327)
                          : isCurrent
                              ? const Color(0xFF1C75BC)
                              : const Color(0xFFE0E0E0),
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: isCompleted
                        ? const Icon(Icons.check, color: Colors.white, size: 20)
                        : Text(
                            '${index + 1}',
                            style: TextStyle(
                              color: isCurrent ? Colors.white : AppColors.textSecondary,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                  ),
                  if (!isLast)
                    Expanded(
                      child: Container(
                        width: 3,
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        color: isCompleted ? const Color(0xFF1B6327) : const Color(0xFFE0E0E0),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 14),
              // Label
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 6, bottom: 24),
                  child: Text(
                    stepLabels.length > index ? stepLabels[index] : 'Step ${index + 1}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: isCurrent || isCompleted ? FontWeight.w800 : FontWeight.w600,
                      color: isCurrent || isCompleted ? AppColors.textPrimary : AppColors.textSecondary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
