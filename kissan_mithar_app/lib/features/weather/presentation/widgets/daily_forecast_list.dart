import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../models/weather_model.dart';

class DailyForecastList extends StatelessWidget {
  final List<DailyForecast> dailyList;

  const DailyForecastList({
    super.key,
    required this.dailyList,
  });

  void _showDayDetails(BuildContext context, DailyForecast item) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final isHighRain = item.rainChance >= 70;
        final isSafeSpraying = item.rainChance < 40;

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${item.dayName}, ${item.date}',
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    Icon(
                      item.icon,
                      color: isHighRain ? const Color(0xFF0288D1) : const Color(0xFFF57F17),
                      size: 32,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  item.condition,
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('High / Low Temp:', style: TextStyle(color: Colors.grey)),
                    Text('${item.maxTemp.round()}° / ${item.minTemp.round()}°', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Rain Probability:', style: TextStyle(color: Colors.grey)),
                    Text('${item.rainChance}%', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(height: 24),
                if (item.rainfallMm > 0) ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Expected Rainfall:', style: TextStyle(color: Colors.grey)),
                      Text('${item.rainfallMm} mm', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const Divider(height: 24),
                ],
                const Text('Farming Advisory:', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      isSafeSpraying ? Icons.check_circle_outline_rounded : Icons.info_outline_rounded,
                      color: isSafeSpraying ? AppColors.secondary : const Color(0xFFE65100),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        item.sprayAdvisory,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isSafeSpraying ? AppColors.secondary : const Color(0xFFE65100),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (dailyList.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4.0),
          child: Text(
            '15-Day Forecast',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: -0.3,
            ),
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 170, // Height for the horizontal cards
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: dailyList.length,
            separatorBuilder: (context, index) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final item = dailyList[index];
              final isHighRain = item.rainChance >= 70;

              return GestureDetector(
                onTap: () => _showDayDetails(context, item),
                child: Container(
                  width: 130, // Fixed width for each card
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: index == 0
                          ? AppColors.secondary.withAlpha(120)
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
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        item.dayName,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: index == 0 ? FontWeight.w800 : FontWeight.w700,
                          color: index == 0 ? AppColors.secondary : AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        item.date,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const Spacer(),
                      Icon(
                        item.icon,
                        color: isHighRain ? const Color(0xFF0288D1) : const Color(0xFFF57F17),
                        size: 36,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${item.maxTemp.round()}° / ${item.minTemp.round()}°',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const Spacer(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.water_drop,
                            size: 14,
                            color: isHighRain ? const Color(0xFF0288D1) : Colors.grey,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${item.rainChance}%',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isHighRain ? const Color(0xFF0288D1) : Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
