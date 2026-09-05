import '../config/env_config.dart';

class AppConstants {
  AppConstants._();

  static String get baseUrl => EnvConfig.apiBaseUrl;
  static const int connectTimeoutMs = 30000; // 30s — rural networks can be slow
  static const int receiveTimeoutMs = 30000; // 30s
  static const int sendTimeoutMs = 30000;    // 30s for photo/file uploads

  // Measurement conversions
  static const int guntasPerAcre = 40;
  static const int centsPerAcre = 100;

  // Min touch target
  static const double minTouchTarget = 56.0;
}
