import '../config/env_config.dart';

class AppConstants {
  AppConstants._();

  static String get baseUrl => EnvConfig.apiBaseUrl;
  static const int connectTimeoutMs = 15000;
  static const int receiveTimeoutMs = 15000;

  // Measurement conversions
  static const int guntasPerAcre = 40;
  static const int centsPerAcre = 100;

  // Min touch target
  static const double minTouchTarget = 56.0;
}
