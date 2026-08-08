import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kissan_mithar/core/localization/app_localizations.dart';
import 'package:kissan_mithar/features/notifications/models/notification_model.dart';
import 'package:kissan_mithar/features/notifications/presentation/screens/notification_permission_screen.dart';
import 'package:kissan_mithar/features/notifications/presentation/screens/notifications_screen.dart';
import 'package:kissan_mithar/features/notifications/providers/notifications_provider.dart';
import 'package:kissan_mithar/features/notifications/services/notification_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('NotificationItem Model Tests', () {
    test('JSON serialization & deserialization works seamlessly', () {
      final item = NotificationItem(
        id: 'TEST-01',
        title: 'Your Orchard Plan is Ready',
        message: 'View 2 Acres layout',
        type: NotificationType.success,
        createdAt: DateTime.now().subtract(const Duration(minutes: 10)),
        isRead: false,
        deepLinkRoute: '/orchard/report',
        extraData: {'planId': '123'},
      );

      final json = item.toJson();
      expect(json['id'], 'TEST-01');
      expect(json['type'], 'success');
      expect(json['deep_link_route'], '/orchard/report');

      final fromJson = NotificationItem.fromJson(json);
      expect(fromJson.id, 'TEST-01');
      expect(fromJson.type, NotificationType.success);
      expect(fromJson.deepLinkRoute, '/orchard/report');
      expect(fromJson.isRead, false);
    });

    test('NotificationType colors and icons map appropriately', () {
      final alertItem = NotificationItem(
        id: 'A1',
        title: 'Rain Alert',
        message: 'Heavy rain',
        type: NotificationType.alert,
        createdAt: DateTime(2026, 1, 1),
      );

      expect(alertItem.stripeColor, const Color(0xFFE65100));
      expect(alertItem.icon, Icons.warning_amber_rounded);
      expect(alertItem.typeLabel, 'Alert');

      final successItem = NotificationItem(
        id: 'S1',
        title: 'Report Ready',
        message: 'Plan ready',
        type: NotificationType.success,
        createdAt: DateTime(2026, 1, 1),
      );

      expect(successItem.stripeColor, const Color(0xFF2E7D32));
      expect(successItem.icon, Icons.assignment_turned_in_rounded);
      expect(successItem.typeLabel, 'Success');
    });

    test('Relative formattedTime returns reasonable strings', () {
      final itemNow = NotificationItem(
        id: 'N1',
        title: 'T',
        message: 'M',
        createdAt: DateTime.now().subtract(const Duration(seconds: 10)),
      );
      expect(itemNow.formattedTime, 'Just now');

      final itemMinutes = NotificationItem(
        id: 'N2',
        title: 'T',
        message: 'M',
        createdAt: DateTime.now().subtract(const Duration(minutes: 25)),
      );
      expect(itemMinutes.formattedTime, '25m ago');

      final itemHours = NotificationItem(
        id: 'N3',
        title: 'T',
        message: 'M',
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      );
      expect(itemHours.formattedTime, '3h ago');
    });
  });

  group('NotificationService Deep-Link & FCM Tests', () {
    test('resolveDeepLinkRoute maps notification payloads correctly', () {
      final service = NotificationService();

      // Explicit route
      expect(
        service.resolveDeepLinkRoute({'route': '/orchard/report'}),
        '/orchard/report',
      );

      // Orchard plan title
      expect(
        service.resolveDeepLinkRoute({
          'title': 'Your Orchard Plan is Ready! 🌳',
          'screen': 'orchard_report',
        }),
        '/orchard/report',
      );

      // Consultation
      expect(
        service.resolveDeepLinkRoute({
          'screen': 'consultation_detail',
          'consultationId': 'CNS-8921',
        }),
        '/consultation/detail/CNS-8921',
      );

      // Weather
      expect(
        service.resolveDeepLinkRoute({'screen': 'weather'}),
        '/weather',
      );

      // Default fallback
      expect(
        service.resolveDeepLinkRoute({}),
        '/notifications',
      );
    });

    test('FCM token generation and permission persistence work', () async {
      final service = NotificationService();

      expect(await service.hasSeenPermissionPrompt(), false);
      expect(await service.isPermissionGranted(), false);

      final token = await service.getFcmToken();
      expect(token.startsWith('fcm_km_'), true);

      final granted = await service.requestNotificationPermissions();
      expect(granted, true);
      expect(await service.isPermissionGranted(), true);
      expect(await service.hasSeenPermissionPrompt(), true);
    });
  });

  group('NotificationsNotifier State Tests', () {
    test('markAsRead updates item status and unread count', () async {
      final notifier = NotificationsNotifier();
      final initialUnread = notifier.state.unreadCount;

      final firstUnread = notifier.state.items.firstWhere((i) => !i.isRead);
      await notifier.markAsRead(firstUnread.id);

      expect(notifier.state.unreadCount, initialUnread - 1);
      final updatedItem =
          notifier.state.items.firstWhere((i) => i.id == firstUnread.id);
      expect(updatedItem.isRead, true);
    });

    test('markAllRead marks all items as read', () async {
      final notifier = NotificationsNotifier();
      await notifier.markAllRead();

      expect(notifier.state.unreadCount, 0);
      expect(notifier.state.items.every((i) => i.isRead), true);
    });

    test('setFilter correctly filters items', () {
      final notifier = NotificationsNotifier();

      notifier.setFilter('all');
      expect(notifier.state.filteredItems.length, notifier.state.items.length);

      notifier.setFilter('alert');
      expect(
        notifier.state.filteredItems
            .every((i) => i.type == NotificationType.alert),
        true,
      );

      notifier.setFilter('unread');
      expect(notifier.state.filteredItems.every((i) => !i.isRead), true);
    });
  });

  group('Notification UI Widget Tests', () {
    testWidgets('NotificationPermissionScreen renders hero & benefit cards',
        (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: NotificationPermissionScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Stay Updated On\nYour Farm'), findsOneWidget);
      expect(find.text('Severe Weather Warnings'), findsOneWidget);
      expect(find.text('Agronomist Call Reminders'), findsOneWidget);
      expect(find.text('Mandi Market Rate Alerts'), findsOneWidget);
      expect(find.text('Orchard Plan Ready Alert'), findsOneWidget);
      expect(find.text('Turn On Notifications'), findsOneWidget);
      expect(find.text('Maybe Later, Skip for Now'), findsOneWidget);
    });

    testWidgets('NotificationsScreen renders filter chips and notification cards',
        (tester) async {
      tester.view.physicalSize = const Size(500, 2000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            localizationsDelegates: [
              AppLocalizations.delegate,
            ],
            home: NotificationsScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Check header and tabs
      expect(find.text('Notifications'), findsOneWidget);
      expect(find.text('All'), findsOneWidget);
      expect(find.text('Unread'), findsOneWidget);
      expect(find.text('Alerts & Warnings'), findsOneWidget);

      // Check notification items
      expect(find.text('Your Orchard Plan is Ready! 🌳'), findsOneWidget);
      expect(find.text('Heavy Rain Warning Tomorrow 🌧️'), findsOneWidget);
    });
  });
}
