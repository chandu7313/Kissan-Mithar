import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../../../core/config/env_config.dart';
import '../../../core/network/network_client.dart';
import '../models/weather_model.dart';

class WeatherState {
  final WeatherData data;
  final bool isLoading;
  final String? errorMessage;

  const WeatherState({
    required this.data,
    this.isLoading = false,
    this.errorMessage,
  });

  // Convenience getters for Home and quick access
  String get location => data.locationName;
  double get temperature => data.currentTemp;
  String get condition => data.condition;
  int get humidity => data.humidity;
  double get windSpeed => data.windSpeed;
  int get rainProbability => data.rainChance;
  bool get isOffline => data.isOffline;
  DateTime get lastUpdated => data.lastUpdated;
  List<AgricultureAlert> get alerts => data.alerts;
  List<HourlyForecast> get hourlyForecast => data.hourlyForecast;
  List<DailyForecast> get dailyForecast => data.dailyForecast;
  List<RainfallDataPoint> get rainfallTrend => data.rainfallTrend;

  WeatherState copyWith({
    WeatherData? data,
    bool? isLoading,
    String? errorMessage,
  }) {
    return WeatherState(
      data: data ?? this.data,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class WeatherNotifier extends StateNotifier<WeatherState> {
  static const String _cacheKey = 'cached_weather_data';
  static const String _savedFarmKey = 'kissan_saved_farm_location';
  final NetworkClient _networkClient;

  WeatherNotifier({NetworkClient? networkClient})
      : _networkClient = networkClient ?? NetworkClient(),
        super(WeatherState(data: WeatherData.initial())) {
    _initAndLoad();
  }

  Future<void> _initAndLoad() async {
    // 1. Instantly load from local offline cache first
    await _loadFromLocalCache();
    // 2. Fetch fresh live data in background
    await fetchLiveWeather();
  }

  /// Loads cached weather JSON from SharedPreferences
  Future<void> _loadFromLocalCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedJson = prefs.getString(_cacheKey);
      if (cachedJson != null && cachedJson.isNotEmpty) {
        final Map<String, dynamic> map = jsonDecode(cachedJson);
        final cachedData = WeatherData.fromJson(map).copyWith(isOffline: true);
        state = state.copyWith(data: cachedData);
      }
    } catch (e) {
      debugPrint('Error loading cached weather: $e');
    }
  }

  /// Saves fresh weather payload to SharedPreferences
  Future<void> _saveToLocalCache(WeatherData data) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = jsonEncode(data.toJson());
      await prefs.setString(_cacheKey, jsonString);
    } catch (e) {
      debugPrint('Error saving cached weather: $e');
    }
  }

  /// Retrieves saved farm location or uses device GPS
  Future<Map<String, dynamic>> _resolveFarmCoordinates() async {
    double lat = 18.8475;
    double lng = 73.9103;
    String locationName = 'Khed, Pune, Maharashtra';

    try {
      final prefs = await SharedPreferences.getInstance();
      // Check saved farm location
      final savedFarm = prefs.getString(_savedFarmKey);
      if (savedFarm != null) {
        final Map<String, dynamic> farmMap = jsonDecode(savedFarm);
        lat = (farmMap['lat'] as num?)?.toDouble() ?? lat;
        lng = (farmMap['lng'] as num?)?.toDouble() ?? lng;
        locationName = farmMap['name'] as String? ?? locationName;
        return {'lat': lat, 'lng': lng, 'name': locationName};
      }

      // Check orchard draft storage if available
      final orchardDraft = prefs.getString('orchard_planning_draft_v1');
      if (orchardDraft != null) {
        final Map<String, dynamic> draftMap = jsonDecode(orchardDraft);
        final draftLat = (draftMap['latitude'] as num?)?.toDouble();
        final draftLng = (draftMap['longitude'] as num?)?.toDouble();
        final village = draftMap['village'] as String? ?? '';
        final district = draftMap['district'] as String? ?? '';
        final stateName = draftMap['stateName'] as String? ?? '';
        if (draftLat != null && draftLng != null && draftLat != 0.0) {
          lat = draftLat;
          lng = draftLng;
          locationName = [village, district, stateName]
              .where((s) => s.isNotEmpty)
              .join(', ');
          return {'lat': lat, 'lng': lng, 'name': locationName};
        }
      }

      // Fallback: Native Device GPS
      if (EnvConfig.useNativeGps) {
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
        }
        if (permission == LocationPermission.whileInUse ||
            permission == LocationPermission.always) {
          final pos = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.medium,
            timeLimit: const Duration(seconds: 4),
          );
          lat = pos.latitude;
          lng = pos.longitude;
        }
      }
    } catch (e) {
      debugPrint('Location resolution notice: $e');
    }

    return {'lat': lat, 'lng': lng, 'name': locationName};
  }

  /// Main method to fetch weather from backend endpoint GET /api/weather?lat=&lng=
  Future<void> fetchLiveWeather({
    double? customLat,
    double? customLng,
    String? customLocationName,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final loc = await _resolveFarmCoordinates();
      final lat = customLat ?? (loc['lat'] as double);
      final lng = customLng ?? (loc['lng'] as double);
      final name = customLocationName ?? (loc['name'] as String);

      WeatherData freshData;

      // 1. Try Backend Proxy endpoint: GET /weather?lat=&lng=
      try {
        final response = await _networkClient.get(
          '/weather',
          queryParameters: {'lat': lat, 'lng': lng},
        );

        if (response.statusCode == 200 && response.data != null) {
          final Map<String, dynamic> dataMap = response.data is String
              ? jsonDecode(response.data as String)
              : response.data as Map<String, dynamic>;
          freshData = WeatherData.fromJson(dataMap);
          await _saveToLocalCache(freshData);
          state = state.copyWith(data: freshData, isLoading: false);
          return;
        }
      } catch (dioError) {
        debugPrint('Backend /api/weather endpoint offline, trying direct client proxy fallback: $dioError');
      }

      // 2. Direct OpenWeather Client fallback if API key configured
      if (EnvConfig.isWeatherConfigured) {
        try {
          final url = Uri.parse(
            'https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lng&units=metric&appid=${EnvConfig.weatherApiKey}',
          );
          final res = await http.get(url).timeout(const Duration(seconds: 6));
          if (res.statusCode == 200) {
            final data = jsonDecode(res.body);
            final main = data['main'] as Map<String, dynamic>? ?? {};
            final weatherList = data['weather'] as List<dynamic>? ?? [];
            final wind = data['wind'] as Map<String, dynamic>? ?? {};
            final apiName = data['name'] as String? ?? name;

            final temp = (main['temp'] as num?)?.toDouble() ?? 26.0;
            final tempMin = (main['temp_min'] as num?)?.toDouble() ?? (temp - 4);
            final tempMax = (main['temp_max'] as num?)?.toDouble() ?? (temp + 3);
            final feelsLike = (main['feels_like'] as num?)?.toDouble() ?? temp;
            final hum = (main['humidity'] as num?)?.toInt() ?? 75;
            final windSpd = (wind['speed'] as num?)?.toDouble() ?? 3.5;
            final pressure = (main['pressure'] as num?)?.toInt() ?? 1012;
            final cond = weatherList.isNotEmpty
                ? (weatherList[0]['main'] as String? ?? 'Cloudy')
                : 'Cloudy';

            final isRaining = cond.toLowerCase().contains('rain');

            freshData = WeatherData(
              locationName: apiName.isNotEmpty ? apiName : name,
              latitude: lat,
              longitude: lng,
              currentTemp: temp,
              minTemp: tempMin,
              maxTemp: tempMax,
              feelsLike: feelsLike,
              condition: cond,
              humidity: hum,
              windSpeed: (windSpd * 3.6).roundToDouble(),
              windDirection: 'SW',
              rainChance: isRaining ? 85 : 20,
              uvIndex: 4.5,
              pressureHpa: pressure,
              dewPoint: 21.0,
              sunrise: '06:05 AM',
              sunset: '07:02 PM',
              lastUpdated: DateTime.now(),
              isOffline: false,
              alerts: [
                if (isRaining)
                  const AgricultureAlert(
                    id: 'ALT-LIVE-1',
                    title: 'Active Rain in Your Area — Delay Spraying & Field Operations',
                    message: 'High humidity and rainfall will wash away protective spray chemicals.',
                    advisory: 'Wait for a 24-hour dry spell before applying fertilizer or pesticide.',
                    severity: AlertSeverity.warning,
                    effectiveTime: 'Next 12 Hours',
                    affectedCrops: 'All Farm Crops',
                  )
                else
                  const AgricultureAlert(
                    id: 'ALT-LIVE-2',
                    title: 'Favorable Weather for Orchard Irrigation & Foliar Nutrition',
                    message: 'Moderate temperatures and gentle breeze create ideal spraying conditions.',
                    advisory: 'Complete morning spraying before 11:00 AM for maximum leaf absorption.',
                    severity: AlertSeverity.info,
                    effectiveTime: 'Today 6:00 AM – 11:00 AM',
                    affectedCrops: 'Orchards, Vegetables, Pulses',
                  ),
              ],
              hourlyForecast: _generateHourlyForecast(temp, isRaining),
              dailyForecast: _generateDailyForecast(temp, isRaining),
              rainfallTrend: _generateRainfallTrend(isRaining),
            );

            await _saveToLocalCache(freshData);
            state = state.copyWith(data: freshData, isLoading: false);
            return;
          }
        } catch (apiErr) {
          debugPrint('OpenWeather fallback error: $apiErr');
        }
      }

      // 3. Offline Cache recovery with offline flag
      final updatedCached = state.data.copyWith(
        locationName: name,
        latitude: lat,
        longitude: lng,
        isOffline: true,
      );
      state = state.copyWith(
        data: updatedCached,
        isLoading: false,
      );
    } catch (e) {
      debugPrint('Weather fetch error: $e');
      state = state.copyWith(
        data: state.data.copyWith(isOffline: true),
        isLoading: false,
        errorMessage: 'Showing cached offline weather.',
      );
    }
  }

  void refreshWeather() {
    fetchLiveWeather();
  }

  // --- Helper generators for synthetic realistic forecasts ---
  static List<HourlyForecast> _generateHourlyForecast(double baseTemp, bool isRaining) {
    return [
      HourlyForecast(time: 'Now', temperature: baseTemp, condition: isRaining ? 'Light Rain' : 'Partly Cloudy', rainChance: isRaining ? 80 : 20, rainMm: isRaining ? 1.5 : 0.0, icon: isRaining ? Icons.grain_rounded : Icons.wb_cloudy_rounded),
      HourlyForecast(time: '1 PM', temperature: baseTemp + 1.2, condition: isRaining ? 'Showers' : 'Sunny', rainChance: isRaining ? 85 : 15, rainMm: isRaining ? 3.2 : 0.0, icon: isRaining ? Icons.water_drop_outlined : Icons.wb_sunny_rounded),
      HourlyForecast(time: '3 PM', temperature: baseTemp + 2.0, condition: isRaining ? 'Heavy Rain' : 'Cloudy', rainChance: isRaining ? 90 : 30, rainMm: isRaining ? 6.8 : 0.0, icon: isRaining ? Icons.thunderstorm_rounded : Icons.wb_cloudy_rounded),
      HourlyForecast(time: '5 PM', temperature: baseTemp + 0.5, condition: 'Cloudy', rainChance: 40, rainMm: 0.8, icon: Icons.wb_cloudy_rounded),
      HourlyForecast(time: '7 PM', temperature: baseTemp - 1.5, condition: 'Clear', rainChance: 15, rainMm: 0.0, icon: Icons.nightlight_round),
      HourlyForecast(time: '9 PM', temperature: baseTemp - 2.8, condition: 'Clear', rainChance: 10, rainMm: 0.0, icon: Icons.nightlight_round),
      HourlyForecast(time: '11 PM', temperature: baseTemp - 3.5, condition: 'Overcast', rainChance: 20, rainMm: 0.0, icon: Icons.cloud_outlined),
    ];
  }

  static List<DailyForecast> _generateDailyForecast(double baseTemp, bool isRaining) {
    return [
      DailyForecast(dayName: 'Today', date: 'Today', minTemp: baseTemp - 4, maxTemp: baseTemp + 3, condition: isRaining ? 'Rain Showers' : 'Partly Cloudy', rainChance: isRaining ? 80 : 25, rainfallMm: isRaining ? 12.0 : 1.2, sprayAdvisory: isRaining ? 'Avoid spraying' : 'Safe morning window', icon: isRaining ? Icons.grain_rounded : Icons.wb_cloudy_rounded),
      DailyForecast(dayName: 'Tomorrow', date: 'Fri', minTemp: baseTemp - 3, maxTemp: baseTemp + 4, condition: 'Heavy Rain', rainChance: 90, rainfallMm: 24.5, sprayAdvisory: 'Delay spraying & check channels', icon: Icons.thunderstorm_rounded),
      DailyForecast(dayName: 'Saturday', date: 'Sat', minTemp: baseTemp - 4, maxTemp: baseTemp + 5, condition: 'Scattered Showers', rainChance: 55, rainfallMm: 4.2, sprayAdvisory: 'Morning window suitable', icon: Icons.grain_rounded),
      DailyForecast(dayName: 'Sunday', date: 'Sun', minTemp: baseTemp - 5, maxTemp: baseTemp + 6, condition: 'Partly Cloudy', rainChance: 20, rainfallMm: 0.0, sprayAdvisory: 'Good for fertigation', icon: Icons.wb_cloudy_rounded),
      DailyForecast(dayName: 'Monday', date: 'Mon', minTemp: baseTemp - 5, maxTemp: baseTemp + 7, condition: 'Sunny & Clear', rainChance: 10, rainfallMm: 0.0, sprayAdvisory: 'Ideal for all orchard tasks', icon: Icons.wb_sunny_rounded),
      DailyForecast(dayName: 'Tuesday', date: 'Tue', minTemp: baseTemp - 4, maxTemp: baseTemp + 8, condition: 'Sunny', rainChance: 10, rainfallMm: 0.0, sprayAdvisory: 'Irrigate during cool hours', icon: Icons.wb_sunny_rounded),
      DailyForecast(dayName: 'Wednesday', date: 'Wed', minTemp: baseTemp - 3, maxTemp: baseTemp + 6, condition: 'Overcast', rainChance: 35, rainfallMm: 1.5, sprayAdvisory: 'Suitable for spraying', icon: Icons.cloud_outlined),
    ];
  }

  static List<RainfallDataPoint> _generateRainfallTrend(bool isRaining) {
    return [
      const RainfallDataPoint(timeLabel: '6 AM', rainfallMm: 0.0, rainChance: 10),
      RainfallDataPoint(timeLabel: '9 AM', rainfallMm: isRaining ? 1.2 : 0.0, rainChance: isRaining ? 40 : 15),
      RainfallDataPoint(timeLabel: '12 PM', rainfallMm: isRaining ? 3.5 : 0.5, rainChance: isRaining ? 75 : 25),
      RainfallDataPoint(timeLabel: '3 PM', rainfallMm: isRaining ? 8.2 : 1.0, rainChance: isRaining ? 90 : 35),
      RainfallDataPoint(timeLabel: '6 PM', rainfallMm: isRaining ? 4.8 : 0.0, rainChance: isRaining ? 65 : 20),
      const RainfallDataPoint(timeLabel: '9 PM', rainfallMm: 0.2, rainChance: 15),
    ];
  }
}

final weatherProvider =
    StateNotifierProvider<WeatherNotifier, WeatherState>((ref) {
  return WeatherNotifier();
});
