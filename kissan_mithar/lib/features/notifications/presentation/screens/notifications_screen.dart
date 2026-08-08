import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_language.dart';
import '../../models/notification_model.dart';
import '../../providers/notifications_provider.dart';
import '../../services/notification_service.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  final VoidCallback? onHomeTap;
  final VoidCallback? onFarmTap;
  final VoidCallback? onSupportTap;

  const NotificationsScreen({
    super.key,
    this.onHomeTap,
    this.onFarmTap,
    this.onSupportTap,
  });

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  Widget _buildLanguagePill(BuildContext context) {
    final currentLang = LanguageProvider().currentLanguage;

    return PopupMenuButton<AppLanguage>(
      onSelected: (AppLanguage newLang) {
        setState(() {
          LanguageProvider().setLanguage(newLang);
        });
      },
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      itemBuilder: (context) => AppLanguage.values.map((lang) {
        return PopupMenuItem<AppLanguage>(
          value: lang,
          child: Text(
            '${lang.nativeLabel} (${lang.label})',
            style: TextStyle(
              fontWeight:
                  lang == currentLang ? FontWeight.bold : FontWeight.normal,
              color: lang == currentLang
                  ? AppColors.primaryGreen
                  : AppColors.textPrimary,
            ),
          ),
        );
      }).toList(),
      child: Container(
        margin: const EdgeInsets.only(right: 16),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFE2E6E2),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          currentLang.nativeLabel,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChip(
    String label,
    String filterKey,
    String activeFilter,
    int count,
  ) {
    final isSelected = activeFilter == filterKey;
    return GestureDetector(
      onTap: () {
        ref.read(notificationsProvider.notifier).setFilter(filterKey);
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGreen : AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primaryGreen : const Color(0xFFD0D7D0),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                color: isSelected ? Colors.white : AppColors.textPrimary,
              ),
            ),
            if (count > 0) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.white.withAlpha(50)
                      : const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: isSelected ? Colors.white : AppColors.primaryGreen,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(NotificationItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            // 1. Mark as read on tap via PATCH /api/notifications/:id/read
            if (!item.isRead) {
              ref.read(notificationsProvider.notifier).markAsRead(item.id);
            }

            // 2. Deep-link into relevant screen
            if (item.deepLinkRoute != null && item.deepLinkRoute!.isNotEmpty) {
              context.go(item.deepLinkRoute!);
            } else if (item.extraData != null) {
              NotificationService().handleNotificationTap(
                item.extraData!,
                context: context,
              );
            }
          },
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Colored left stripe by type
                  Container(
                    width: 5,
                    color: item.stripeColor,
                  ),

                  // Card Content
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 14,
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Type Icon Avatar
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: item.iconBgColor,
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              item.icon,
                              color: item.iconColor,
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: 12),

                          // Text Info
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        item.title,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: item.isRead
                                              ? FontWeight.w600
                                              : FontWeight.w800,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      item.formattedTime,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                    // Unread indicator dot
                                    if (!item.isRead) ...[
                                      const SizedBox(width: 6),
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: BoxDecoration(
                                          color: item.stripeColor,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  item.message,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 13,
                                    height: 1.35,
                                    color: item.isRead
                                        ? AppColors.textSecondary
                                        : AppColors.textPrimary,
                                    fontWeight: item.isRead
                                        ? FontWeight.normal
                                        : FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationsProvider);
    final allCount = state.items.length;
    final unreadCount = state.items.where((i) => !i.isRead).length;
    final alertCount =
        state.items.where((i) => i.type == NotificationType.alert).length;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        centerTitle: false,
        title: const Text(
          'Notifications',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          if (unreadCount > 0)
            TextButton.icon(
              onPressed: () {
                ref.read(notificationsProvider.notifier).markAllRead();
              },
              icon: const Icon(
                Icons.done_all_rounded,
                size: 18,
                color: AppColors.primaryGreen,
              ),
              label: const Text(
                'Mark all read',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryGreen,
                ),
              ),
            ),
          _buildLanguagePill(context),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primaryGreen,
        onRefresh: () async {
          await ref.read(notificationsProvider.notifier).fetchNotifications();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 600),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Filter Chips Row
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      children: [
                        _buildFilterChip('All', 'all', state.selectedFilter, allCount),
                        _buildFilterChip('Unread', 'unread', state.selectedFilter, unreadCount),
                        _buildFilterChip('Alerts & Warnings', 'alert', state.selectedFilter, alertCount),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Notifications List
                  if (state.isLoading)
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 40),
                      child: Center(
                        child: CircularProgressIndicator(
                          color: AppColors.primaryGreen,
                        ),
                      ),
                    )
                  else if (state.filteredItems.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 48,
                      ),
                      margin: const EdgeInsets.only(top: 20),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: const BoxDecoration(
                              color: Color(0xFFE8F5E9),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.notifications_off_rounded,
                              size: 40,
                              color: AppColors.primaryGreen,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'No Notifications Found',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'You have seen all advisories and alerts.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: state.filteredItems.length,
                      itemBuilder: (context, index) {
                        final item = state.filteredItems[index];
                        return _buildNotificationCard(item);
                      },
                    ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
