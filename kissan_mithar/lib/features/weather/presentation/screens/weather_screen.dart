import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../models/weather_model.dart';
import '../../providers/weather_provider.dart';
import '../widgets/agriculture_alert_card.dart';
import '../widgets/daily_forecast_list.dart';
import '../widgets/hourly_forecast_strip.dart';
import '../widgets/rainfall_chart_card.dart';

class WeatherScreen extends ConsumerWidget {
  final VoidCallback? onHomeTap;
  final VoidCallback? onSupportTap;

  const WeatherScreen({
    super.key,
    this.onHomeTap,
    this.onSupportTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final weatherState = ref.watch(weatherProvider);
    final weather = weatherState.data;
    final timeFormat = DateFormat('h:mm a, d MMM');
    final updatedTimeStr = timeFormat.format(weather.lastUpdated);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: FarmerAppBar(
        showBrandTitle: false,
        onBackTap: () {
          if (Navigator.canPop(context)) {
            Navigator.pop(context);
          } else if (onHomeTap != null) {
            onHomeTap!();
          }
        },
        customActions: [
          IconButton(
            tooltip: 'Refresh Weather',
            icon: weatherState.isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
                    ),
                  )
                : const Icon(Icons.refresh_rounded,
                    color: AppColors.primaryGreen, size: 26),
            onPressed: weatherState.isLoading
                ? null
                : () => ref.read(weatherProvider.notifier).fetchLiveWeather(),
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          color: AppColors.primaryGreen,
          onRefresh: () async {
            await ref.read(weatherProvider.notifier).fetchLiveWeather();
          },
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 540),
              child: ListView(
                padding: const EdgeInsets.symmetric(
                    horizontal: 18.0, vertical: 12.0),
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                children: [
                  // 1. Location Bar & Offline Indicator
                  _buildLocationHeader(context, ref, weather, updatedTimeStr),
                  const SizedBox(height: 14),

                  // 2. Agriculture Alerts Banner (Prominent Orange Banner)
                  if (weather.alerts.isNotEmpty) ...[
                    ...weather.alerts.map(
                      (alert) => AgricultureAlertCard(alert: alert),
                    ),
                  ],

                  // 3. Current Weather Hero Card
                  _buildCurrentWeatherHero(weather),
                  const SizedBox(height: 20),

                  // 4. Hourly Forecast Strip (Next 24h)
                  HourlyForecastStrip(hourlyList: weather.hourlyForecast),

                  // 5. Rainfall Trend Chart (fl_chart)
                  RainfallChartCard(
                    rainfallTrend: weather.rainfallTrend,
                    rainChance: weather.rainChance,
                  ),

                  // 6. 7-Day Agricultural Forecast List
                  DailyForecastList(dailyList: weather.dailyForecast),
                  const SizedBox(height: 20),

                  // 7. Atmospheric & Farm Conditions Grid
                  _buildAtmosphericGrid(weather),
                  const SizedBox(height: 24),

                  // 8. Sun & Daylight Schedule
                  _buildSunScheduleCard(weather),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLocationHeader(
    BuildContext context,
    WidgetRef ref,
    WeatherData weather,
    String updatedTimeStr,
  ) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: weather.isOffline
              ? const Color(0xFFFFB74D)
              : const Color(0xFFC7CEC7),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withAlpha(25),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.location_on_rounded,
                  color: AppColors.primaryGreen,
                  size: 22,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      weather.locationName,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '${weather.latitude.toStringAsFixed(4)}° N, ${weather.longitude.toStringAsFixed(4)}° E',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              InkWell(
                onTap: () {
                  ref.read(weatherProvider.notifier).fetchLiveWeather();
                },
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF81C784)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.gps_fixed_rounded,
                          size: 13, color: AppColors.primaryGreen),
                      SizedBox(width: 4),
                      Text(
                        'GPS Sync',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, color: Color(0xFFE8ECE8)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      weather.isOffline
                          ? Icons.cloud_off_rounded
                          : Icons.check_circle_rounded,
                      size: 14,
                      color: weather.isOffline
                          ? const Color(0xFFE65100)
                          : AppColors.primaryGreen,
                    ),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        weather.isOffline
                            ? 'Cached Offline Data'
                            : 'Live Satellite Weather',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: weather.isOffline
                              ? const Color(0xFFE65100)
                              : AppColors.primaryGreen,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                'Updated: $updatedTimeStr',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentWeatherHero(WeatherData weather) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF2E7D32),
            Color(0xFF1B5E20),
          ],
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2E7D32).withAlpha(60),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${weather.currentTemp.round()}°C',
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -2,
                        height: 1.0,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      weather.condition,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFE8F5E9),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Feels like ${weather.feelsLike.round()}°C • High: ${weather.maxTemp.round()}° Low: ${weather.minTemp.round()}°',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withAlpha(210),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withAlpha(35),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  weather.rainChance > 50
                      ? Icons.water_drop_rounded
                      : Icons.wb_sunny_rounded,
                  color: weather.rainChance > 50
                      ? const Color(0xFF81D4FA)
                      : const Color(0xFFFFD54F),
                  size: 48,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(30),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildHeroMetric(
                    Icons.water_drop_outlined,
                    '${weather.rainChance}%',
                    'Rain Prob.',
                  ),
                ),
                Container(
                    width: 1,
                    height: 24,
                    color: Colors.white.withAlpha(60)),
                Expanded(
                  child: _buildHeroMetric(
                    Icons.opacity_rounded,
                    '${weather.humidity}%',
                    'Humidity',
                  ),
                ),
                Container(
                    width: 1,
                    height: 24,
                    color: Colors.white.withAlpha(60)),
                Expanded(
                  child: _buildHeroMetric(
                    Icons.air_rounded,
                    '${weather.windSpeed.round()} km/h',
                    'Wind (${weather.windDirection})',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroMetric(IconData icon, String value, String label) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: Colors.white),
            const SizedBox(width: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: Colors.white.withAlpha(200),
          ),
        ),
      ],
    );
  }

  Widget _buildAtmosphericGrid(WeatherData weather) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4.0),
          child: Text(
            'Atmospheric & Field Conditions',
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: -0.3,
            ),
          ),
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 2.1,
          children: [
            _buildGridTile(
              icon: Icons.wb_sunny_outlined,
              iconColor: const Color(0xFFF57F17),
              title: 'UV Index',
              value: '${weather.uvIndex} (${_getUvLabel(weather.uvIndex)})',
              subtitle: 'Solar radiation intensity',
            ),
            _buildGridTile(
              icon: Icons.speed_rounded,
              iconColor: const Color(0xFF00897B),
              title: 'Air Pressure',
              value: '${weather.pressureHpa} hPa',
              subtitle: 'Atmospheric density',
            ),
            _buildGridTile(
              icon: Icons.dew_point,
              iconColor: const Color(0xFF0288D1),
              title: 'Dew Point',
              value: '${weather.dewPoint.round()}°C',
              subtitle: 'Moisture condensation',
            ),
            _buildGridTile(
              icon: Icons.air_rounded,
              iconColor: const Color(0xFF5D4037),
              title: 'Wind Direction',
              value: '${weather.windDirection} • ${weather.windSpeed.round()} km/h',
              subtitle: 'Foliar drift factor',
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildGridTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String value,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFC7CEC7), width: 1.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(4),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withAlpha(25),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  value,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  subtitle,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSunScheduleCard(WeatherData weather) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFC7CEC7), width: 1.0),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Row(
            children: [
              const Icon(
                Icons.wb_sunny_rounded,
                color: Color(0xFFFFB300),
                size: 26,
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Sunrise',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    weather.sunrise,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ],
          ),
          Container(width: 1, height: 32, color: const Color(0xFFE0E0E0)),
          Row(
            children: [
              const Icon(
                Icons.nights_stay_rounded,
                color: Color(0xFF5C6BC0),
                size: 26,
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Sunset',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    weather.sunset,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getUvLabel(double uv) {
    if (uv < 3) return 'Low';
    if (uv < 6) return 'Moderate';
    if (uv < 8) return 'High';
    return 'Very High';
  }
}
