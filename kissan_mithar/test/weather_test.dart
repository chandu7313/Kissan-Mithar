import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kissan_mithar/features/weather/models/weather_model.dart';
import 'package:kissan_mithar/features/weather/presentation/screens/weather_screen.dart';
import 'package:kissan_mithar/features/weather/presentation/widgets/agriculture_alert_card.dart';
import 'package:kissan_mithar/features/weather/presentation/widgets/compact_weather_card.dart';
import 'package:kissan_mithar/features/weather/presentation/widgets/daily_forecast_list.dart';
import 'package:kissan_mithar/features/weather/presentation/widgets/hourly_forecast_strip.dart';
import 'package:kissan_mithar/features/weather/presentation/widgets/rainfall_chart_card.dart';
import 'package:kissan_mithar/features/weather/providers/weather_provider.dart';

void main() {
  group('Weather Model & JSON Unit Tests', () {
    test('WeatherData.initial has valid default values', () {
      final initial = WeatherData.initial();
      expect(initial.locationName, contains('Pune'));
      expect(initial.currentTemp, 26.0);
      expect(initial.alerts, isNotEmpty);
      expect(initial.hourlyForecast, isNotEmpty);
      expect(initial.dailyForecast.length, 7);
      expect(initial.rainfallTrend, isNotEmpty);
      expect(initial.isOffline, isFalse);
    });

    test('WeatherData toJson and fromJson roundtrip serialization', () {
      final initial = WeatherData.initial();
      final jsonMap = initial.toJson();
      final restored = WeatherData.fromJson(jsonMap);

      expect(restored.locationName, initial.locationName);
      expect(restored.currentTemp, initial.currentTemp);
      expect(restored.humidity, initial.humidity);
      expect(restored.alerts.first.title, initial.alerts.first.title);
      expect(restored.dailyForecast.length, initial.dailyForecast.length);
      expect(restored.rainfallTrend.length, initial.rainfallTrend.length);
    });

    test('AgricultureAlert severity parsing', () {
      expect(AlertSeverity.fromString('warning'), AlertSeverity.warning);
      expect(AlertSeverity.fromString('critical'), AlertSeverity.critical);
      expect(AlertSeverity.fromString('advisory'), AlertSeverity.advisory);
      expect(AlertSeverity.fromString('unknown'), AlertSeverity.info);

      final alert = AgricultureAlert.fromJson({
        'id': 'ALT-1',
        'title': 'High Winds',
        'message': 'Winds up to 45km/h',
        'advisory': 'Secure nursery nets',
        'severity': 'warning',
        'effectiveTime': 'Today',
        'affectedCrops': 'Banana',
      });

      expect(alert.severity, AlertSeverity.warning);
      expect(alert.affectedCrops, 'Banana');
    });
  });

  group('Weather Widgets UI Tests', () {
    testWidgets('CompactWeatherCard renders condition and metrics',
        (tester) async {
      final state = WeatherState(data: WeatherData.initial());

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CompactWeatherCard(weatherState: state),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('26°C'), findsOneWidget);
      expect(find.text('Light Rain Expected'), findsOneWidget);
      expect(find.text('78%'), findsOneWidget);
      expect(find.text('Humidity'), findsOneWidget);
      expect(find.text('12 km/h'), findsOneWidget);
    });

    testWidgets('AgricultureAlertCard renders advisory and severity',
        (tester) async {
      const alert = AgricultureAlert(
        id: 'ALT-TEST',
        title: 'Heavy Rain Tomorrow — Delay Spraying',
        message: 'Expected 24mm rainfall in the afternoon.',
        advisory: 'Postpone chemical applications by 24-48 hours.',
        severity: AlertSeverity.warning,
        effectiveTime: 'Tomorrow 1:00 PM',
        affectedCrops: 'Cotton, Vegetables',
      );

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AgricultureAlertCard(alert: alert),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('WARNING'), findsOneWidget);
      expect(find.text('Heavy Rain Tomorrow — Delay Spraying'), findsOneWidget);
      expect(find.text('Postpone chemical applications by 24-48 hours.'), findsOneWidget);
      expect(find.text('Target Crops: Cotton, Vegetables'), findsOneWidget);
    });

    testWidgets('HourlyForecastStrip and DailyForecastList render items',
        (tester) async {
      final weather = WeatherData.initial();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: Column(
                children: [
                  HourlyForecastStrip(hourlyList: weather.hourlyForecast),
                  DailyForecastList(dailyList: weather.dailyForecast),
                ],
              ),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Hourly Forecast (Next 24h)'), findsOneWidget);
      expect(find.text('7-Day Agricultural Forecast'), findsOneWidget);
      expect(find.text('Today'), findsWidgets);
      expect(find.text('Tomorrow'), findsOneWidget);
      expect(find.text('Saturday'), findsOneWidget);
    });

    testWidgets('RainfallChartCard renders chart and accumulation summary',
        (tester) async {
      final weather = WeatherData.initial();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: RainfallChartCard(
              rainfallTrend: weather.rainfallTrend,
              rainChance: weather.rainChance,
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Rainfall Trend & Volume'), findsOneWidget);
      expect(find.textContaining('mm Total'), findsOneWidget);
    });

    testWidgets('WeatherScreen renders complete live dashboard',
        (tester) async {
      tester.view.physicalSize = const Size(600, 3000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: WeatherScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Live Satellite Weather'), findsOneWidget);
      expect(find.text('26°C'), findsOneWidget);
      expect(find.text('Hourly Forecast (Next 24h)'), findsOneWidget);
      expect(find.byType(RainfallChartCard), findsOneWidget);
      expect(find.byType(DailyForecastList), findsOneWidget);
      expect(find.text('Atmospheric & Field Conditions'), findsOneWidget);
    });
  });
}
