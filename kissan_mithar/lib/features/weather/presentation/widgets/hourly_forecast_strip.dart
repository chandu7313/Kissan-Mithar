import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../models/weather_model.dart';

class HourlyForecastStrip extends StatelessWidget {
  final List<HourlyForecast> hourlyList;

  const HourlyForecastStrip({
    super.key,
    required this.hourlyList,
  });

  @override
  Widget build(BuildContext context) {
    if (hourlyList.isEmpty) return const SizedBox.shrink();

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
                  'Hourly Forecast (Next 24h)',
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
                'Scroll →',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryGreen,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 142,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: hourlyList.length,
            separatorBuilder: (context, index) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final item = hourlyList[index];
              final isCurrent = index == 0;

              return Container(
                width: 88,
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                decoration: BoxDecoration(
                  color: isCurrent
                      ? const Color(0xFFE8F5E9)
                      : AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isCurrent
                        ? AppColors.primaryGreen
                        : const Color(0xFFC7CEC7),
                    width: isCurrent ? 2.0 : 1.0,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(isCurrent ? 12 : 5),
                      blurRadius: 6,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Time
                    Text(
                      item.time,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight:
                            isCurrent ? FontWeight.w800 : FontWeight.w600,
                        color: isCurrent
                            ? AppColors.primaryGreen
                            : AppColors.textSecondary,
                      ),
                    ),

                    // Icon
                    Icon(
                      item.icon,
                      color: item.rainChance > 50
                          ? const Color(0xFF0288D1)
                          : (isCurrent
                              ? AppColors.primaryGreen
                              : const Color(0xFFF57F17)),
                      size: 26,
                    ),

                    // Temp
                    Text(
                      '${item.temperature.round()}°',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),

                    // Rain Chance Badge
                    if (item.rainChance > 15)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.water_drop,
                            size: 11,
                            color: Color(0xFF0288D1),
                          ),
                          const SizedBox(width: 2),
                          Text(
                            '${item.rainChance}%',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF0288D1),
                            ),
                          ),
                        ],
                      )
                    else
                      Text(
                        item.condition,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 10,
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 22),
      ],
    );
  }
}
