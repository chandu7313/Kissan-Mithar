import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../models/weather_model.dart';

class DailyForecastList extends StatelessWidget {
  final List<DailyForecast> dailyList;

  const DailyForecastList({
    super.key,
    required this.dailyList,
  });

  @override
  Widget build(BuildContext context) {
    if (dailyList.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '7-Day Agricultural Forecast',
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.3,
                  ),
                ),
              ),
              SizedBox(width: 8),
              Text(
                'Spray Suitability',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: dailyList.length,
          separatorBuilder: (context, index) => const SizedBox(height: 10),
          itemBuilder: (context, index) {
            final item = dailyList[index];
            final isHighRain = item.rainChance >= 70;
            final isSafeSpraying = item.rainChance < 40;

            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: index == 0
                      ? AppColors.primaryGreen.withAlpha(120)
                      : const Color(0xFFC7CEC7),
                  width: index == 0 ? 1.5 : 1.0,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(5),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      // Day & Date Column
                      SizedBox(
                        width: 90,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.dayName,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: index == 0
                                    ? FontWeight.w800
                                    : FontWeight.w700,
                                color: index == 0
                                    ? AppColors.primaryGreen
                                    : AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              item.date,
                              style: const TextStyle(
                                fontSize: 12,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Icon & Condition
                      Icon(
                        item.icon,
                        color: isHighRain
                            ? const Color(0xFF0288D1)
                            : const Color(0xFFF57F17),
                        size: 24,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.condition,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            if (item.rainfallMm > 0)
                              Text(
                                '${item.rainfallMm.toStringAsFixed(1)} mm rain (${item.rainChance}%)',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isHighRain
                                      ? const Color(0xFF0288D1)
                                      : AppColors.textSecondary,
                                ),
                              ),
                          ],
                        ),
                      ),

                      // Min - Max Temp Bar
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '${item.minTemp.round()}°',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          Container(
                            width: 38,
                            height: 6,
                            margin: const EdgeInsets.symmetric(horizontal: 6),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [
                                  Color(0xFF81C784),
                                  Color(0xFFFFB74D),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                          Text(
                            '${item.maxTemp.round()}°',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),
                  const Divider(height: 1, color: Color(0xFFEEEEEE)),
                  const SizedBox(height: 8),

                  // Spraying & Agri Advisory Chip
                  Row(
                    children: [
                      Icon(
                        isSafeSpraying
                            ? Icons.check_circle_outline_rounded
                            : Icons.info_outline_rounded,
                        size: 14,
                        color: isSafeSpraying
                            ? AppColors.primaryGreen
                            : const Color(0xFFE65100),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          item.sprayAdvisory,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isSafeSpraying
                                ? AppColors.primaryGreen
                                : const Color(0xFFBF360C),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}
