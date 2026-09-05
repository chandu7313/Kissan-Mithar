import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/app_colors.dart';
import '../../providers/weather_provider.dart';

class CompactWeatherCard extends StatelessWidget {
  final WeatherState weatherState;
  final VoidCallback? onTap;

  const CompactWeatherCard({
    super.key,
    required this.weatherState,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final weather = weatherState.data;
    final timeStr = DateFormat('h:mm a').format(weather.lastUpdated);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFFF1EFEA),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: weather.isOffline
                ? const Color(0xFFFFB74D)
                : const Color(0xFFC7CEC7),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            // Top Row: Location & Offline/Live Badge
            Row(
              children: [
                const Icon(
                  Icons.location_on,
                  color: AppColors.primaryGreen,
                  size: 20,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    weather.locationName.split(',').first,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: weather.isOffline
                        ? const Color(0xFFFFF3E0)
                        : const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: weather.isOffline
                          ? const Color(0xFFFFB74D)
                          : const Color(0xFF81C784),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        weather.isOffline
                            ? Icons.cloud_off_rounded
                            : Icons.check_circle_rounded,
                        size: 13,
                        color: weather.isOffline
                            ? const Color(0xFFE65100)
                            : AppColors.primaryGreen,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        weather.isOffline
                            ? 'Offline ($timeStr)'
                            : 'Live ($timeStr)',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: weather.isOffline
                              ? const Color(0xFFE65100)
                              : AppColors.primaryGreen,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Middle Row: Temperature & Condition Icon
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${weather.currentTemp.round()}°C',
                      style: const TextStyle(
                        fontSize: 38,
                        fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary,
                        letterSpacing: -1,
                        height: 1.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      weather.condition,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen.withAlpha(20),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    weather.rainChance > 50
                        ? Icons.water_drop_rounded
                        : Icons.wb_sunny_rounded,
                    color: weather.rainChance > 50
                        ? const Color(0xFF0288D1)
                        : const Color(0xFFF57F17),
                    size: 40,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),
            const Divider(height: 1, color: Color(0xFFD6DDD6)),
            const SizedBox(height: 12),

            // Bottom Metrics: Rain, Humidity, Wind
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMetric(
                  Icons.water_drop_outlined,
                  '${weather.rainChance}%',
                  'Rain',
                  const Color(0xFF0288D1),
                ),
                Container(width: 1, height: 24, color: const Color(0xFFD6DDD6)),
                _buildMetric(
                  Icons.opacity_rounded,
                  '${weather.humidity}%',
                  'Humidity',
                  AppColors.primaryGreen,
                ),
                Container(width: 1, height: 24, color: const Color(0xFFD6DDD6)),
                _buildMetric(
                  Icons.air_rounded,
                  '${weather.windSpeed.round()} km/h',
                  'Wind',
                  const Color(0xFF5D4037),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetric(
      IconData icon, String value, String label, Color iconColor) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 18, color: iconColor),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
