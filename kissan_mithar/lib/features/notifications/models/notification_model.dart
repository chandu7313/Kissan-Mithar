import 'package:flutter/material.dart';

enum NotificationType {
  alert,
  success,
  info,
  consultation;

  static NotificationType fromString(String? typeStr) {
    switch (typeStr?.toLowerCase()) {
      case 'alert':
      case 'warning':
      case 'emergency':
        return NotificationType.alert;
      case 'success':
      case 'completed':
      case 'ready':
        return NotificationType.success;
      case 'consultation':
      case 'expert':
      case 'call':
        return NotificationType.consultation;
      case 'info':
      case 'update':
      default:
        return NotificationType.info;
    }
  }

  String get key => name;
}

class NotificationItem {
  final String id;
  final String title;
  final String message;
  final NotificationType type;
  final DateTime createdAt;
  final bool isRead;
  final String? deepLinkRoute;
  final Map<String, dynamic>? extraData;

  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    this.type = NotificationType.info,
    required this.createdAt,
    this.isRead = false,
    this.deepLinkRoute,
    this.extraData,
  });

  Color get stripeColor {
    switch (type) {
      case NotificationType.alert:
        return const Color(0xFFE65100);
      case NotificationType.success:
        return const Color(0xFF2E7D32);
      case NotificationType.consultation:
        return const Color(0xFF1565C0);
      case NotificationType.info:
        return const Color(0xFF0288D1);
    }
  }

  Color get iconColor {
    switch (type) {
      case NotificationType.alert:
        return const Color(0xFFE65100);
      case NotificationType.success:
        return const Color(0xFF2E7D32);
      case NotificationType.consultation:
        return const Color(0xFF1565C0);
      case NotificationType.info:
        return const Color(0xFF0288D1);
    }
  }

  Color get iconBgColor {
    switch (type) {
      case NotificationType.alert:
        return const Color(0xFFFFF3E0);
      case NotificationType.success:
        return const Color(0xFFE8F5E9);
      case NotificationType.consultation:
        return const Color(0xFFE3F2FD);
      case NotificationType.info:
        return const Color(0xFFE1F5FE);
    }
  }

  IconData get icon {
    switch (type) {
      case NotificationType.alert:
        return Icons.warning_amber_rounded;
      case NotificationType.success:
        return Icons.assignment_turned_in_rounded;
      case NotificationType.consultation:
        return Icons.phone_in_talk_rounded;
      case NotificationType.info:
        return Icons.trending_up_rounded;
    }
  }

  String get typeLabel {
    switch (type) {
      case NotificationType.alert:
        return 'Alert';
      case NotificationType.success:
        return 'Success';
      case NotificationType.consultation:
        return 'Consultation';
      case NotificationType.info:
        return 'Update';
    }
  }

  String get formattedTime {
    final diff = DateTime.now().difference(createdAt);
    if (diff.inMinutes < 1) {
      return 'Just now';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else if (diff.inDays == 1) {
      return 'Yesterday';
    } else {
      return '${diff.inDays}d ago';
    }
  }

  NotificationItem copyWith({
    String? id,
    String? title,
    String? message,
    NotificationType? type,
    DateTime? createdAt,
    bool? isRead,
    String? deepLinkRoute,
    Map<String, dynamic>? extraData,
  }) {
    return NotificationItem(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      type: type ?? this.type,
      createdAt: createdAt ?? this.createdAt,
      isRead: isRead ?? this.isRead,
      deepLinkRoute: deepLinkRoute ?? this.deepLinkRoute,
      extraData: extraData ?? this.extraData,
    );
  }

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    DateTime parsedDate;
    if (json['created_at'] != null) {
      parsedDate = DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now();
    } else if (json['createdAt'] != null) {
      parsedDate = DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now();
    } else {
      parsedDate = DateTime.now();
    }

    return NotificationItem(
      id: json['id']?.toString() ?? UniqueKey().toString(),
      title: json['title']?.toString() ?? 'Farm Notification',
      message: json['message']?.toString() ?? json['body']?.toString() ?? '',
      type: NotificationType.fromString(json['type']?.toString()),
      createdAt: parsedDate,
      isRead: json['is_read'] == true || json['isRead'] == true,
      deepLinkRoute: json['deep_link_route']?.toString() ?? json['route']?.toString(),
      extraData: json['extra_data'] as Map<String, dynamic>? ?? json['data'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type.name,
      'created_at': createdAt.toIso8601String(),
      'is_read': isRead,
      'deep_link_route': deepLinkRoute,
      if (extraData != null) 'extra_data': extraData,
    };
  }

  static List<NotificationItem> initialMockList() {
    final now = DateTime.now();
    return [
      NotificationItem(
        id: 'NOTIF-01',
        title: 'Your Orchard Plan is Ready! 🌳',
        message: 'Custom layout and tree plantation roadmap for 2 Acres Red Soil is generated.',
        type: NotificationType.success,
        createdAt: now.subtract(const Duration(minutes: 15)),
        isRead: false,
        deepLinkRoute: '/orchard/report',
        extraData: {'planId': 'ORC-9921'},
      ),
      NotificationItem(
        id: 'NOTIF-02',
        title: 'Heavy Rain Warning Tomorrow 🌧️',
        message: 'Expected 24mm rainfall tomorrow afternoon. Delay chemical spraying by 24-48 hours.',
        type: NotificationType.alert,
        createdAt: now.subtract(const Duration(hours: 2)),
        isRead: false,
        deepLinkRoute: '/weather',
      ),
      NotificationItem(
        id: 'NOTIF-03',
        title: 'Expert Consultation Confirmed 👨‍🌾',
        message: 'Your video session with Dr. Ananya Sharma is scheduled for tomorrow at 10:00 AM.',
        type: NotificationType.consultation,
        createdAt: now.subtract(const Duration(hours: 5)),
        isRead: false,
        deepLinkRoute: '/consultation/detail/CNS-8921',
        extraData: {'consultationId': 'CNS-8921'},
      ),
      NotificationItem(
        id: 'NOTIF-04',
        title: 'Mandi Market Prices Updated 📈',
        message: 'Mango prices increased by 5% and Guava reached ₹45/kg at your local market.',
        type: NotificationType.info,
        createdAt: now.subtract(const Duration(hours: 9)),
        isRead: true,
        deepLinkRoute: '/activity',
      ),
      NotificationItem(
        id: 'NOTIF-05',
        title: 'Soil Moisture Advisory 💧',
        message: 'Ideal soil moisture level detected for mango orchard fertigation this week.',
        type: NotificationType.info,
        createdAt: now.subtract(const Duration(days: 1)),
        isRead: true,
        deepLinkRoute: '/weather',
      ),
    ];
  }
}
