import 'package:flutter/material.dart';

enum AlertSeverity {
  critical(
    label: 'Critical Alert',
    badgeColor: Color(0xFFD32F2F),
    bgColor: Color(0xFFFFEBEE),
    textColor: Color(0xFFB71C1C),
    icon: Icons.warning_rounded,
  ),
  warning(
    label: 'Warning',
    badgeColor: Color(0xFFE65100),
    bgColor: Color(0xFFFFF3E0),
    textColor: Color(0xFFBF360C),
    icon: Icons.warning_amber_rounded,
  ),
  advisory(
    label: 'Agri Advisory',
    badgeColor: Color(0xFFF57F17),
    bgColor: Color(0xFFFFFDE7),
    textColor: Color(0xFFE65100),
    icon: Icons.agriculture_rounded,
  ),
  info(
    label: 'Good Conditions',
    badgeColor: Color(0xFF2E7D32),
    bgColor: Color(0xFFE8F5E9),
    textColor: Color(0xFF1B5E20),
    icon: Icons.check_circle_outline_rounded,
  );

  final String label;
  final Color badgeColor;
  final Color bgColor;
  final Color textColor;
  final IconData icon;

  const AlertSeverity({
    required this.label,
    required this.badgeColor,
    required this.bgColor,
    required this.textColor,
    required this.icon,
  });

  static AlertSeverity fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'critical':
      case 'severe':
        return AlertSeverity.critical;
      case 'warning':
      case 'danger':
        return AlertSeverity.warning;
      case 'advisory':
      case 'watch':
        return AlertSeverity.advisory;
      default:
        return AlertSeverity.info;
    }
  }
}

class AgricultureAlert {
  final String id;
  final String title;
  final String message;
  final String advisory;
  final AlertSeverity severity;
  final String effectiveTime;
  final String affectedCrops;

  const AgricultureAlert({
    required this.id,
    required this.title,
    required this.message,
    required this.advisory,
    required this.severity,
    required this.effectiveTime,
    required this.affectedCrops,
  });

  factory AgricultureAlert.fromJson(Map<String, dynamic> json) {
    return AgricultureAlert(
      id: json['id'] as String? ?? 'ALT-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] as String? ?? 'Weather Advisory',
      message: json['message'] as String? ?? 'Check conditions before field work.',
      advisory: json['advisory'] as String? ?? 'Delay spraying until winds subside.',
      severity: AlertSeverity.fromString(json['severity'] as String?),
      effectiveTime: json['effectiveTime'] as String? ?? 'Next 24 Hours',
      affectedCrops: json['affectedCrops'] as String? ?? 'All Orchards & Field Crops',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'advisory': advisory,
      'severity': severity.name,
      'effectiveTime': effectiveTime,
      'affectedCrops': affectedCrops,
    };
  }
}

class RainfallDataPoint {
  final String timeLabel;
  final double rainfallMm;
  final int rainChance;

  const RainfallDataPoint({
    required this.timeLabel,
    required this.rainfallMm,
    required this.rainChance,
  });

  factory RainfallDataPoint.fromJson(Map<String, dynamic> json) {
    return RainfallDataPoint(
      timeLabel: json['timeLabel'] as String? ?? '12 PM',
      rainfallMm: (json['rainfallMm'] as num?)?.toDouble() ?? 0.0,
      rainChance: (json['rainChance'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'timeLabel': timeLabel,
      'rainfallMm': rainfallMm,
      'rainChance': rainChance,
    };
  }
}

class HourlyForecast {
  final String time;
  final double temperature;
  final String condition;
  final int rainChance;
  final double rainMm;
  final IconData icon;

  const HourlyForecast({
    required this.time,
    required this.temperature,
    required this.condition,
    required this.rainChance,
    required this.rainMm,
    required this.icon,
  });

  factory HourlyForecast.fromJson(Map<String, dynamic> json) {
    return HourlyForecast(
      time: json['time'] as String? ?? 'Now',
      temperature: (json['temperature'] as num?)?.toDouble() ?? 25.0,
      condition: json['condition'] as String? ?? 'Clear',
      rainChance: (json['rainChance'] as num?)?.toInt() ?? 0,
      rainMm: (json['rainMm'] as num?)?.toDouble() ?? 0.0,
      icon: _parseWeatherIcon(json['condition'] as String?),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'time': time,
      'temperature': temperature,
      'condition': condition,
      'rainChance': rainChance,
      'rainMm': rainMm,
    };
  }
}

class DailyForecast {
  final String dayName;
  final String date;
  final double minTemp;
  final double maxTemp;
  final String condition;
  final int rainChance;
  final double rainfallMm;
  final String sprayAdvisory;
  final IconData icon;

  const DailyForecast({
    required this.dayName,
    required this.date,
    required this.minTemp,
    required this.maxTemp,
    required this.condition,
    required this.rainChance,
    required this.rainfallMm,
    required this.sprayAdvisory,
    required this.icon,
  });

  factory DailyForecast.fromJson(Map<String, dynamic> json) {
    return DailyForecast(
      dayName: json['dayName'] as String? ?? 'Today',
      date: json['date'] as String? ?? 'Aug 07',
      minTemp: (json['minTemp'] as num?)?.toDouble() ?? 20.0,
      maxTemp: (json['maxTemp'] as num?)?.toDouble() ?? 30.0,
      condition: json['condition'] as String? ?? 'Sunny',
      rainChance: (json['rainChance'] as num?)?.toInt() ?? 10,
      rainfallMm: (json['rainfallMm'] as num?)?.toDouble() ?? 0.0,
      sprayAdvisory: json['sprayAdvisory'] as String? ?? 'Suitable for spraying',
      icon: _parseWeatherIcon(json['condition'] as String?),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'dayName': dayName,
      'date': date,
      'minTemp': minTemp,
      'maxTemp': maxTemp,
      'condition': condition,
      'rainChance': rainChance,
      'rainfallMm': rainfallMm,
      'sprayAdvisory': sprayAdvisory,
    };
  }
}

class WeatherData {
  final String locationName;
  final double latitude;
  final double longitude;
  final double currentTemp;
  final double minTemp;
  final double maxTemp;
  final double feelsLike;
  final String condition;
  final int humidity;
  final double windSpeed;
  final String windDirection;
  final int rainChance;
  final double uvIndex;
  final int pressureHpa;
  final double dewPoint;
  final String sunrise;
  final String sunset;
  final DateTime lastUpdated;
  final bool isOffline;
  final List<AgricultureAlert> alerts;
  final List<HourlyForecast> hourlyForecast;
  final List<DailyForecast> dailyForecast;
  final List<RainfallDataPoint> rainfallTrend;

  const WeatherData({
    required this.locationName,
    required this.latitude,
    required this.longitude,
    required this.currentTemp,
    required this.minTemp,
    required this.maxTemp,
    required this.feelsLike,
    required this.condition,
    required this.humidity,
    required this.windSpeed,
    required this.windDirection,
    required this.rainChance,
    required this.uvIndex,
    required this.pressureHpa,
    required this.dewPoint,
    required this.sunrise,
    required this.sunset,
    required this.lastUpdated,
    this.isOffline = false,
    required this.alerts,
    required this.hourlyForecast,
    required this.dailyForecast,
    required this.rainfallTrend,
  });

  factory WeatherData.initial() {
    final now = DateTime.now();
    return WeatherData(
      locationName: 'Saved Farm (Pune, Maharashtra)',
      latitude: 18.8475,
      longitude: 73.9103,
      currentTemp: 26.0,
      minTemp: 21.0,
      maxTemp: 29.0,
      feelsLike: 27.5,
      condition: 'Light Rain Expected',
      humidity: 78,
      windSpeed: 12.0,
      windDirection: 'SW (South-West)',
      rainChance: 75,
      uvIndex: 4.2,
      pressureHpa: 1012,
      dewPoint: 22.0,
      sunrise: '06:05 AM',
      sunset: '07:02 PM',
      lastUpdated: now,
      isOffline: false,
      alerts: [
        const AgricultureAlert(
          id: 'ALT-101',
          title: 'Moderate Rain Expected Tomorrow — Delay Pesticide Spraying',
          message: 'Expected 18-24mm rainfall in the afternoon. Any pesticide spray will get washed off.',
          advisory: 'Postpone chemical applications by 24-48 hours. Ensure field drainage outlets are open.',
          severity: AlertSeverity.warning,
          effectiveTime: 'Tomorrow 1:00 PM – 7:00 PM',
          affectedCrops: 'Cotton, Vegetables, Mango Orchards',
        ),
      ],
      hourlyForecast: [
        const HourlyForecast(time: 'Now', temperature: 26.0, condition: 'Cloudy', rainChance: 40, rainMm: 0.0, icon: Icons.cloud_outlined),
        const HourlyForecast(time: '2 PM', temperature: 27.5, condition: 'Light Rain', rainChance: 75, rainMm: 2.5, icon: Icons.grain_rounded),
        const HourlyForecast(time: '4 PM', temperature: 27.0, condition: 'Heavy Rain', rainChance: 90, rainMm: 8.0, icon: Icons.thunderstorm_rounded),
        const HourlyForecast(time: '6 PM', temperature: 25.0, condition: 'Showers', rainChance: 65, rainMm: 3.2, icon: Icons.water_drop_outlined),
        const HourlyForecast(time: '8 PM', temperature: 24.0, condition: 'Cloudy', rainChance: 30, rainMm: 0.5, icon: Icons.cloud_outlined),
        const HourlyForecast(time: '10 PM', temperature: 23.0, condition: 'Overcast', rainChance: 20, rainMm: 0.0, icon: Icons.nightlight_round),
      ],
      dailyForecast: [
        const DailyForecast(dayName: 'Today', date: 'Today', minTemp: 21, maxTemp: 27, condition: 'Light Rain', rainChance: 75, rainfallMm: 8.5, sprayAdvisory: 'Avoid afternoon spraying', icon: Icons.grain_rounded),
        const DailyForecast(dayName: 'Tomorrow', date: 'Fri', minTemp: 22, maxTemp: 28, condition: 'Heavy Rain', rainChance: 90, rainfallMm: 22.0, sprayAdvisory: 'Strictly avoid spraying', icon: Icons.thunderstorm_rounded),
        const DailyForecast(dayName: 'Saturday', date: 'Sat', minTemp: 21, maxTemp: 29, condition: 'Scattered Showers', rainChance: 50, rainfallMm: 4.0, sprayAdvisory: 'Morning window suitable', icon: Icons.grain_rounded),
        const DailyForecast(dayName: 'Sunday', date: 'Sun', minTemp: 20, maxTemp: 30, condition: 'Partly Cloudy', rainChance: 25, rainfallMm: 0.8, sprayAdvisory: 'Good day for fertilizer', icon: Icons.wb_cloudy_rounded),
        const DailyForecast(dayName: 'Monday', date: 'Mon', minTemp: 20, maxTemp: 31, condition: 'Sunny & Clear', rainChance: 10, rainfallMm: 0.0, sprayAdvisory: 'Ideal for all farm work', icon: Icons.wb_sunny_rounded),
        const DailyForecast(dayName: 'Tuesday', date: 'Tue', minTemp: 21, maxTemp: 32, condition: 'Hot & Clear', rainChance: 10, rainfallMm: 0.0, sprayAdvisory: 'Irrigate in early morning', icon: Icons.wb_sunny_rounded),
        const DailyForecast(dayName: 'Wednesday', date: 'Wed', minTemp: 22, maxTemp: 30, condition: 'Cloudy', rainChance: 35, rainfallMm: 1.2, sprayAdvisory: 'Suitable for spraying', icon: Icons.cloud_outlined),
      ],
      rainfallTrend: [
        const RainfallDataPoint(timeLabel: '6 AM', rainfallMm: 0.0, rainChance: 10),
        const RainfallDataPoint(timeLabel: '9 AM', rainfallMm: 0.5, rainChance: 25),
        const RainfallDataPoint(timeLabel: '12 PM', rainfallMm: 2.8, rainChance: 70),
        const RainfallDataPoint(timeLabel: '3 PM', rainfallMm: 7.4, rainChance: 90),
        const RainfallDataPoint(timeLabel: '6 PM', rainfallMm: 4.2, rainChance: 65),
        const RainfallDataPoint(timeLabel: '9 PM', rainfallMm: 1.0, rainChance: 30),
      ],
    );
  }

  factory WeatherData.fromJson(Map<String, dynamic> json) {
    return WeatherData(
      locationName: json['locationName'] as String? ?? 'Farm Location',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 18.8475,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 73.9103,
      currentTemp: (json['currentTemp'] as num?)?.toDouble() ?? 26.0,
      minTemp: (json['minTemp'] as num?)?.toDouble() ?? 21.0,
      maxTemp: (json['maxTemp'] as num?)?.toDouble() ?? 29.0,
      feelsLike: (json['feelsLike'] as num?)?.toDouble() ?? 27.0,
      condition: json['condition'] as String? ?? 'Clear',
      humidity: (json['humidity'] as num?)?.toInt() ?? 70,
      windSpeed: (json['windSpeed'] as num?)?.toDouble() ?? 10.0,
      windDirection: json['windDirection'] as String? ?? 'SW',
      rainChance: (json['rainChance'] as num?)?.toInt() ?? 20,
      uvIndex: (json['uvIndex'] as num?)?.toDouble() ?? 4.0,
      pressureHpa: (json['pressureHpa'] as num?)?.toInt() ?? 1013,
      dewPoint: (json['dewPoint'] as num?)?.toDouble() ?? 20.0,
      sunrise: json['sunrise'] as String? ?? '06:00 AM',
      sunset: json['sunset'] as String? ?? '07:00 PM',
      lastUpdated: json['lastUpdated'] != null
          ? DateTime.tryParse(json['lastUpdated'] as String) ?? DateTime.now()
          : DateTime.now(),
      isOffline: json['isOffline'] as bool? ?? false,
      alerts: (json['alerts'] as List<dynamic>?)
              ?.map((e) => AgricultureAlert.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      hourlyForecast: (json['hourlyForecast'] as List<dynamic>?)
              ?.map((e) => HourlyForecast.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      dailyForecast: (json['dailyForecast'] as List<dynamic>?)
              ?.map((e) => DailyForecast.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      rainfallTrend: (json['rainfallTrend'] as List<dynamic>?)
              ?.map((e) => RainfallDataPoint.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'locationName': locationName,
      'latitude': latitude,
      'longitude': longitude,
      'currentTemp': currentTemp,
      'minTemp': minTemp,
      'maxTemp': maxTemp,
      'feelsLike': feelsLike,
      'condition': condition,
      'humidity': humidity,
      'windSpeed': windSpeed,
      'windDirection': windDirection,
      'rainChance': rainChance,
      'uvIndex': uvIndex,
      'pressureHpa': pressureHpa,
      'dewPoint': dewPoint,
      'sunrise': sunrise,
      'sunset': sunset,
      'lastUpdated': lastUpdated.toIso8601String(),
      'isOffline': isOffline,
      'alerts': alerts.map((e) => e.toJson()).toList(),
      'hourlyForecast': hourlyForecast.map((e) => e.toJson()).toList(),
      'dailyForecast': dailyForecast.map((e) => e.toJson()).toList(),
      'rainfallTrend': rainfallTrend.map((e) => e.toJson()).toList(),
    };
  }

  WeatherData copyWith({
    String? locationName,
    double? latitude,
    double? longitude,
    double? currentTemp,
    double? minTemp,
    double? maxTemp,
    double? feelsLike,
    String? condition,
    int? humidity,
    double? windSpeed,
    String? windDirection,
    int? rainChance,
    double? uvIndex,
    int? pressureHpa,
    double? dewPoint,
    String? sunrise,
    String? sunset,
    DateTime? lastUpdated,
    bool? isOffline,
    List<AgricultureAlert>? alerts,
    List<HourlyForecast>? hourlyForecast,
    List<DailyForecast>? dailyForecast,
    List<RainfallDataPoint>? rainfallTrend,
  }) {
    return WeatherData(
      locationName: locationName ?? this.locationName,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      currentTemp: currentTemp ?? this.currentTemp,
      minTemp: minTemp ?? this.minTemp,
      maxTemp: maxTemp ?? this.maxTemp,
      feelsLike: feelsLike ?? this.feelsLike,
      condition: condition ?? this.condition,
      humidity: humidity ?? this.humidity,
      windSpeed: windSpeed ?? this.windSpeed,
      windDirection: windDirection ?? this.windDirection,
      rainChance: rainChance ?? this.rainChance,
      uvIndex: uvIndex ?? this.uvIndex,
      pressureHpa: pressureHpa ?? this.pressureHpa,
      dewPoint: dewPoint ?? this.dewPoint,
      sunrise: sunrise ?? this.sunrise,
      sunset: sunset ?? this.sunset,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      isOffline: isOffline ?? this.isOffline,
      alerts: alerts ?? this.alerts,
      hourlyForecast: hourlyForecast ?? this.hourlyForecast,
      dailyForecast: dailyForecast ?? this.dailyForecast,
      rainfallTrend: rainfallTrend ?? this.rainfallTrend,
    );
  }
}

IconData _parseWeatherIcon(String? condition) {
  final cond = condition?.toLowerCase() ?? '';
  if (cond.contains('thunder') || cond.contains('storm')) {
    return Icons.thunderstorm_rounded;
  } else if (cond.contains('heavy rain') || cond.contains('pouring')) {
    return Icons.thunderstorm_rounded;
  } else if (cond.contains('rain') || cond.contains('drizzle') || cond.contains('shower')) {
    return Icons.grain_rounded;
  } else if (cond.contains('cloud') || cond.contains('overcast')) {
    return Icons.wb_cloudy_rounded;
  } else if (cond.contains('wind') || cond.contains('breeze')) {
    return Icons.air_rounded;
  } else if (cond.contains('fog') || cond.contains('mist') || cond.contains('haze')) {
    return Icons.blur_on_rounded;
  }
  return Icons.wb_sunny_rounded;
}
