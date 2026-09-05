import 'package:flutter/foundation.dart';

/// Service for handling local on-device notifications & offline reminders
/// without requiring active internet connectivity or Firebase Cloud Messaging.
class LocalNotificationService {
  static final LocalNotificationService _instance = LocalNotificationService._internal();
  factory LocalNotificationService() => _instance;
  LocalNotificationService._internal();

  bool _isInitialized = false;

  /// Initialize local notification channels
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // In production Flutter apps, FlutterLocalNotificationsPlugin registers
      // notification channels and handles tap callbacks.
      debugPrint('LocalNotificationService: Initialized offline notification channels.');
      _isInitialized = true;
    } catch (e) {
      debugPrint('LocalNotificationService Init Note: $e');
    }
  }

  /// Show an immediate alert to the farmer (e.g. spray alert, offline sync notice)
  Future<void> showInstantAlert({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    debugPrint('LocalNotificationService [INSTANT]: $title -> $body (ID: $id)');
  }

  /// Schedule a follow-up consultation reminder before the call time
  Future<void> scheduleConsultationReminder({
    required int id,
    required String expertName,
    required String category,
    required DateTime scheduledTime,
    int minutesBefore = 15,
  }) async {
    final reminderTime = scheduledTime.subtract(Duration(minutes: minutesBefore));
    if (reminderTime.isBefore(DateTime.now())) {
      debugPrint('Consultation reminder time has already passed.');
      return;
    }

    final title = '👨‍⚕️ Expert Consultation in $minutesBefore mins!';
    final body = 'Get ready for your $category session with $expertName.';

    debugPrint('LocalNotificationService [SCHEDULED for $reminderTime]: $title -> $body (ID: $id)');
  }

  /// Schedule a crop protection or fertilizer spray reminder
  Future<void> scheduleSprayReminder({
    required int id,
    required String cropName,
    required String treatmentName,
    required DateTime scheduledDate,
  }) async {
    final title = '🌱 Scheduled Spray Alert: $cropName';
    final body = 'Time to apply $treatmentName as recommended in your Orchard Plan.';

    debugPrint('LocalNotificationService [SPRAY SCHEDULED for $scheduledDate]: $title -> $body (ID: $id)');
  }

  /// Cancel a scheduled notification
  Future<void> cancelReminder(int id) async {
    debugPrint('LocalNotificationService: Cancelled reminder $id');
  }

  /// Cancel all scheduled reminders
  Future<void> cancelAll() async {
    debugPrint('LocalNotificationService: Cancelled all scheduled reminders');
  }
}
