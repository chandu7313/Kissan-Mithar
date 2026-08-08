import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class EnvConfig {
  EnvConfig._();

  static String _getEnv(String key, [String defaultValue = '']) {
    try {
      if (dotenv.isInitialized) {
        return dotenv.env[key] ?? defaultValue;
      }
    } catch (_) {}
    return defaultValue;
  }

  static Future<void> initialize() async {
    try {
      await dotenv.load(fileName: '.env');
      debugPrint('Environment variables loaded successfully.');
    } catch (e) {
      debugPrint('No .env file found or failed to load: $e. Using fallback defaults.');
    }

    // Initialize Supabase if valid credentials are provided
    if (isSupabaseConfigured) {
      try {
        await Supabase.initialize(
          url: supabaseUrl,
          anonKey: supabaseAnonKey,
        );
        debugPrint('Supabase initialized successfully for $supabaseUrl');
      } catch (e) {
        debugPrint('Failed to initialize Supabase: $e');
      }
    }
  }

  // 1. Supabase Config
  static String get supabaseUrl {
    final rawUrl = _getEnv('SUPABASE_URL');
    if (rawUrl.startsWith('postgresql://') || rawUrl.startsWith('postgres://')) {
      final match = RegExp(r'postgres\.([a-zA-Z0-9]+):').firstMatch(rawUrl);
      if (match != null) {
        return 'https://${match.group(1)}.supabase.co';
      }
    }
    return rawUrl.isNotEmpty ? rawUrl : 'https://iwywcdckncowfkoklypx.supabase.co';
  }

  static String get supabaseAnonKey =>
      _getEnv('SUPABASE_ANON_KEY');

  static bool get isSupabaseConfigured =>
      supabaseUrl.isNotEmpty &&
      supabaseAnonKey.isNotEmpty &&
      !supabaseUrl.contains('your-project-id') &&
      !supabaseAnonKey.contains('your-supabase-anon-key');

  static SupabaseClient? get supabaseClient {
    if (isSupabaseConfigured) {
      try {
        return Supabase.instance.client;
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  // 2. SMS / OTP Provider Config (Fast2SMS)
  static String get smsProvider => _getEnv('SMS_PROVIDER', 'FAST2SMS');
  static String get smsApiKey => _getEnv('SMS_API_KEY');
  static String get smsSenderId => _getEnv('SMS_SENDER_ID', 'KISSAN_MITHAR');
  static bool get isSmsConfigured => smsApiKey.isNotEmpty && !smsApiKey.contains('your-');

  // 3. Location / GPS
  static bool get useNativeGps => (_getEnv('USE_NATIVE_GPS', 'true')) == 'true';

  // 4. Live Weather API Config (OpenWeatherMap)
  static String get weatherApiKey => _getEnv('WEATHER_API_KEY');
  static bool get isWeatherConfigured => weatherApiKey.isNotEmpty && !weatherApiKey.contains('your-');

  // 5. Cloudinary Image Storage
  static String get cloudinaryCloudName => _getEnv('CLOUDINARY_CLOUD_NAME');
  static String get cloudinaryApiKey => _getEnv('CLOUDINARY_API_KEY');
  static String get cloudinaryApiSecret => _getEnv('CLOUDINARY_API_SECRET');
  static String get cloudinaryUploadPreset => _getEnv('CLOUDINARY_UPLOAD_PRESET', 'kissan_mithar_uploads');
  static bool get isCloudinaryConfigured =>
      cloudinaryCloudName.isNotEmpty &&
      cloudinaryApiKey.isNotEmpty &&
      !cloudinaryCloudName.contains('your-');

  // 6. REST API Base URL
  static String get apiBaseUrl =>
      _getEnv('API_BASE_URL', 'https://api.kissanmithar.in/v1');
}
