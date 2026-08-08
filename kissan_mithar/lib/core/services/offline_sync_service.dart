import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../network/network_client.dart';
import 'local_notification_service.dart';

enum SyncState { idle, syncing, success, failed }

/// Background and offline draft synchronization service for Kisan Mithar.
/// Queues incomplete or offline survey requests and uploads them automatically
/// once internet connectivity is restored.
class OfflineSyncService {
  static final OfflineSyncService _instance = OfflineSyncService._internal();
  factory OfflineSyncService() => _instance;
  OfflineSyncService._internal();

  static const String _queueStorageKey = 'kissan_mithar_offline_sync_queue';
  final NetworkClient _networkClient = NetworkClient();
  final LocalNotificationService _localNotifications = LocalNotificationService();

  final ValueNotifier<SyncState> syncStateNotifier = ValueNotifier(SyncState.idle);
  final ValueNotifier<int> pendingCountNotifier = ValueNotifier(0);

  Timer? _periodicSyncTimer;

  /// Initialize periodic background sync checker
  Future<void> initialize() async {
    await updatePendingCount();
    // Periodically retry sync every 60 seconds when pending items exist
    _periodicSyncTimer?.cancel();
    _periodicSyncTimer = Timer.periodic(const Duration(seconds: 60), (_) {
      if (pendingCountNotifier.value > 0 && syncStateNotifier.value != SyncState.syncing) {
        syncPendingQueue();
      }
    });
  }

  /// Add an unsubmitted or failed orchard request to the offline queue
  Future<void> enqueueRequest({
    required String requestId,
    required Map<String, dynamic> payload,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final List<String> queue = prefs.getStringList(_queueStorageKey) ?? [];

      final item = jsonEncode({
        'requestId': requestId,
        'payload': payload,
        'enqueuedAt': DateTime.now().toIso8601String(),
        'attempts': 0,
      });

      // Avoid duplicates for the same requestId
      queue.removeWhere((raw) {
        try {
          final decoded = jsonDecode(raw);
          return decoded['requestId'] == requestId;
        } catch (_) {
          return false;
        }
      });

      queue.add(item);
      await prefs.setStringList(_queueStorageKey, queue);
      await updatePendingCount();

      debugPrint('OfflineSyncService: Enqueued offline survey $requestId. Queue size: ${queue.length}');

      // Notify farmer locally that draft is safe
      await _localNotifications.showInstantAlert(
        id: requestId.hashCode,
        title: '💾 Survey Saved Offline',
        body: 'Your orchard request ($requestId) will be uploaded automatically once internet connects.',
      );
    } catch (e) {
      debugPrint('Error enqueuing offline request: $e');
    }
  }

  /// Trigger sync of all pending requests in queue
  Future<bool> syncPendingQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String> queue = prefs.getStringList(_queueStorageKey) ?? [];

    if (queue.isEmpty) {
      pendingCountNotifier.value = 0;
      return true;
    }

    syncStateNotifier.value = SyncState.syncing;
    debugPrint('OfflineSyncService: Starting sync of ${queue.length} pending requests...');

    final List<String> remainingQueue = [];
    int successCount = 0;

    for (final rawItem in queue) {
      try {
        final item = jsonDecode(rawItem) as Map<String, dynamic>;
        final String requestId = item['requestId'];
        final Map<String, dynamic> payload = Map<String, dynamic>.from(item['payload']);

        final response = await _networkClient.post('/api/orchard-requests', data: payload);

        if (response.statusCode == 200 || response.statusCode == 201) {
          successCount++;
          debugPrint('OfflineSyncService: Successfully synced survey $requestId');
        } else {
          remainingQueue.add(rawItem);
        }
      } catch (e) {
        debugPrint('OfflineSyncService: Sync attempt failed for item: $e');
        remainingQueue.add(rawItem);
      }
    }

    await prefs.setStringList(_queueStorageKey, remainingQueue);
    await updatePendingCount();

    if (successCount > 0) {
      syncStateNotifier.value = SyncState.success;
      await _localNotifications.showInstantAlert(
        id: 9999,
        title: '✅ Survey Uploaded Successfully',
        body: '$successCount pending land surveys have been delivered to our agronomists.',
      );
      Future.delayed(const Duration(seconds: 4), () {
        syncStateNotifier.value = SyncState.idle;
      });
      return true;
    } else {
      syncStateNotifier.value = SyncState.failed;
      Future.delayed(const Duration(seconds: 4), () {
        syncStateNotifier.value = SyncState.idle;
      });
      return false;
    }
  }

  /// Update pending count notifier
  Future<int> updatePendingCount() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final List<String> queue = prefs.getStringList(_queueStorageKey) ?? [];
      pendingCountNotifier.value = queue.length;
      return queue.length;
    } catch (_) {
      return 0;
    }
  }

  /// Clear all queued offline items
  Future<void> clearQueue() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_queueStorageKey);
    pendingCountNotifier.value = 0;
    syncStateNotifier.value = SyncState.idle;
  }

  void dispose() {
    _periodicSyncTimer?.cancel();
  }
}
