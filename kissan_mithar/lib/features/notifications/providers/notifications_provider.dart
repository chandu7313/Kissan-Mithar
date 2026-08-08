import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/network_client.dart';
import '../models/notification_model.dart';

class NotificationsState {
  final List<NotificationItem> items;
  final int unreadCount;
  final bool isLoading;
  final String? errorMessage;
  final String selectedFilter; // 'all', 'unread', 'alert'

  const NotificationsState({
    this.items = const [],
    this.unreadCount = 0,
    this.isLoading = false,
    this.errorMessage,
    this.selectedFilter = 'all',
  });

  List<NotificationItem> get recentThreeItems => items.take(3).toList();

  List<NotificationItem> get filteredItems {
    switch (selectedFilter) {
      case 'unread':
        return items.where((i) => !i.isRead).toList();
      case 'alert':
        return items.where((i) => i.type == NotificationType.alert).toList();
      case 'all':
      default:
        return items;
    }
  }

  NotificationsState copyWith({
    List<NotificationItem>? items,
    int? unreadCount,
    bool? isLoading,
    String? errorMessage,
    String? selectedFilter,
  }) {
    return NotificationsState(
      items: items ?? this.items,
      unreadCount: unreadCount ?? this.unreadCount,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      selectedFilter: selectedFilter ?? this.selectedFilter,
    );
  }
}

class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final NetworkClient _networkClient;

  NotificationsNotifier({NetworkClient? networkClient})
      : _networkClient = networkClient ?? NetworkClient(),
        super(NotificationsState(
          items: NotificationItem.initialMockList(),
          unreadCount: NotificationItem.initialMockList().where((i) => !i.isRead).length,
        )) {
    fetchNotifications();
  }

  Future<void> fetchNotifications() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final response = await _networkClient.get<dynamic>('/notifications');
      final data = response.data;

      if (data is List && data.isNotEmpty) {
        final parsed = data
            .map((e) => NotificationItem.fromJson(e as Map<String, dynamic>))
            .toList();
        state = state.copyWith(
          items: parsed,
          unreadCount: parsed.where((i) => !i.isRead).length,
          isLoading: false,
        );
      } else {
        // Retain current mock / cache
        state = state.copyWith(
          isLoading: false,
          unreadCount: state.items.where((i) => !i.isRead).length,
        );
      }
    } catch (_) {
      // Graceful offline fallback
      state = state.copyWith(
        isLoading: false,
        unreadCount: state.items.where((i) => !i.isRead).length,
      );
    }
  }

  Future<void> markAsRead(String notificationId) async {
    // 1. Optimistic local update
    final updatedList = state.items.map((item) {
      if (item.id == notificationId) {
        return item.copyWith(isRead: true);
      }
      return item;
    }).toList();

    state = state.copyWith(
      items: updatedList,
      unreadCount: updatedList.where((i) => !i.isRead).length,
    );

    // 2. Call backend PATCH /api/notifications/:id/read
    try {
      await _networkClient.patch<dynamic>(
        '/notifications/$notificationId/read',
        data: {'is_read': true},
      );
    } catch (e) {
      debugPrint('Mark-as-read backend fallback: $e');
    }
  }

  Future<void> markAllRead() async {
    final updatedList = state.items.map((item) {
      return item.copyWith(isRead: true);
    }).toList();

    state = state.copyWith(
      items: updatedList,
      unreadCount: 0,
    );

    try {
      await _networkClient.post<dynamic>(
        '/notifications/read-all',
        data: {'all': true},
      );
    } catch (e) {
      debugPrint('Mark all read backend fallback: $e');
    }
  }

  void setFilter(String filter) {
    state = state.copyWith(selectedFilter: filter);
  }

  void addIncomingNotification(NotificationItem item) {
    final updatedList = [item, ...state.items];
    state = state.copyWith(
      items: updatedList,
      unreadCount: updatedList.where((i) => !i.isRead).length,
    );
  }
}

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  return NotificationsNotifier();
});
