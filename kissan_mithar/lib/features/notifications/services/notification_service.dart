import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/network/network_client.dart';
import '../models/notification_model.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final NetworkClient _networkClient = NetworkClient();
  final StreamController<NotificationItem> _foregroundStreamController =
      StreamController<NotificationItem>.broadcast();

  Stream<NotificationItem> get onForegroundNotification =>
      _foregroundStreamController.stream;

  static const String _prefPermissionGranted = 'notification_permission_granted';
  static const String _prefPermissionPromptSeen = 'has_seen_notification_permission_prompt';
  static const String _prefDeviceToken = 'fcm_device_token';

  String? _cachedFcmToken;
  NotificationItem? _pendingInitialNotification;

  /// Check if the user has already seen the notification explanation screen
  Future<bool> hasSeenPermissionPrompt() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_prefPermissionPromptSeen) ?? false;
  }

  /// Mark permission explanation as seen
  Future<void> setPermissionPromptSeen(bool seen) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefPermissionPromptSeen, seen);
  }

  /// Check if notifications are granted
  Future<bool> isPermissionGranted() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_prefPermissionGranted) ?? false;
  }

  /// Request notification permissions
  Future<bool> requestNotificationPermissions() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_prefPermissionPromptSeen, true);
    await prefs.setBool(_prefPermissionGranted, true);

    // Fetch and register token on permission grant
    await getFcmToken();
    return true;
  }

  /// Retrieve or generate FCM Device Token
  Future<String> getFcmToken() async {
    if (_cachedFcmToken != null) return _cachedFcmToken!;

    final prefs = await SharedPreferences.getInstance();
    var token = prefs.getString(_prefDeviceToken);

    if (token == null || token.isEmpty) {
      // Generate a distinct farmer device FCM token
      final randomSuffix = DateTime.now().millisecondsSinceEpoch.toString().substring(6);
      token = 'fcm_km_${defaultTargetPlatform.name}_$randomSuffix';
      await prefs.setString(_prefDeviceToken, token);
    }

    _cachedFcmToken = token;
    return token;
  }

  /// Register FCM Token with backend via POST /api/devices
  Future<bool> registerDeviceToken({
    String? userId,
    String? language,
  }) async {
    try {
      final token = await getFcmToken();
      final payload = {
        'fcm_token': token,
        'platform': defaultTargetPlatform.name,
        'app_version': '1.0.0',
        'language': language ?? 'en',
        'user_id': userId ?? 'farmer_primary',
        'device_type': 'mobile',
        'registered_at': DateTime.now().toIso8601String(),
      };

      final response = await _networkClient.post<dynamic>(
        '/devices',
        data: payload,
      );

      debugPrint('FCM Device registered successfully with backend: $response');
      return true;
    } catch (e) {
      debugPrint('FCM Device registration fallback (offline or mock): $e');
      return false;
    }
  }

  /// Resolves the deep-link route string from a notification's payload
  String resolveDeepLinkRoute(Map<String, dynamic> data) {
    if (data['route'] != null && data['route'].toString().isNotEmpty) {
      return data['route'].toString();
    }
    if (data['deep_link_route'] != null &&
        data['deep_link_route'].toString().isNotEmpty) {
      return data['deep_link_route'].toString();
    }

    final screen = data['screen']?.toString().toLowerCase();
    final type = data['type']?.toString().toLowerCase();

    if (screen == 'orchard_report' ||
        type == 'orchard_plan' ||
        data['title']?.toString().contains('Orchard Plan') == true) {
      return '/orchard/report';
    }

    if (screen == 'consultation_detail' ||
        type == 'consultation' ||
        data['consultationId'] != null ||
        data['consultation_id'] != null) {
      final cnsId = data['consultationId'] ??
          data['consultation_id'] ??
          data['id'] ??
          'CNS-8921';
      return '/consultation/detail/$cnsId';
    }

    if (screen == 'weather' ||
        type == 'alert' ||
        data['title']?.toString().contains('Rain') == true ||
        data['title']?.toString().contains('Weather') == true) {
      return '/weather';
    }

    if (screen == 'activity' || type == 'activity') {
      return '/activity';
    }

    return '/notifications';
  }

  /// Handle tap on notification (Foreground banner, Background, or Terminated)
  void handleNotificationTap(
    Map<String, dynamic> data, {
    GoRouter? router,
    BuildContext? context,
  }) {
    final route = resolveDeepLinkRoute(data);

    if (router != null) {
      router.go(route);
    } else if (context != null && context.mounted) {
      context.go(route);
    }
  }

  /// Handles incoming push notification when app is in foreground
  void handleIncomingForegroundMessage(NotificationItem item) {
    _foregroundStreamController.add(item);
  }

  /// Check and consume cold-start initial notification
  NotificationItem? consumeInitialNotification() {
    final notif = _pendingInitialNotification;
    _pendingInitialNotification = null;
    return notif;
  }

  void setInitialNotification(NotificationItem item) {
    _pendingInitialNotification = item;
  }

  void dispose() {
    _foregroundStreamController.close();
  }
}
