import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../models/consultation_model.dart';
import '../../providers/consultation_provider.dart';
import 'consultation_detail_screen.dart';
import '../../../../l10n/app_localizations.dart';

class ConsultationHistoryScreen extends ConsumerStatefulWidget {
  const ConsultationHistoryScreen({super.key});

  @override
  ConsumerState<ConsultationHistoryScreen> createState() =>
      _ConsultationHistoryScreenState();
}

class _ConsultationHistoryScreenState
    extends ConsumerState<ConsultationHistoryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Widget _buildStatusChip(ConsultationStatus status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: status.backgroundColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: status.textColor.withAlpha(60)),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w800,
          color: status.textColor,
        ),
      ),
    );
  }

  Widget _buildConsultationCard(ConsultationItem item) {
    final isUpcoming = item.status == ConsultationStatus.upcoming;

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isUpcoming ? AppColors.primaryGreen : const Color(0xFFC7CEC7),
          width: isUpcoming ? 1.8 : 1.2,
        ),
      ),
      color: AppColors.surface,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ConsultationDetailScreen(consultationId: item.id),
            ),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Row: Category + Mode Badge + Status
              Row(
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1EFEA),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(item.mode.icon,
                            color: AppColors.primaryGreen, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          item.mode.label,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5E9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        item.category,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  _buildStatusChip(item.status),
                ],
              ),

              const SizedBox(height: 14),

              // Middle: Expert Details
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Expert Avatar
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: const Color(0xFFE8F5E9),
                    backgroundImage: NetworkImage(item.expertPhotoUrl),
                    onBackgroundImageError: (exception, stackTrace) {},
                    child: const Icon(Icons.person_rounded,
                        color: AppColors.primaryGreen, size: 28),
                  ),
                  const SizedBox(width: 12),
                  // Expert Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.expertName,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item.expertRole,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded,
                                color: Colors.amber, size: 16),
                            const SizedBox(width: 3),
                            Text(
                              '${item.expertRating}',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(width: 10),
                            const Icon(Icons.language_rounded,
                                color: AppColors.textSecondary, size: 14),
                            const SizedBox(width: 3),
                            Text(
                              item.language,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),
              const Divider(height: 1, color: Color(0xFFE8ECE8)),
              const SizedBox(height: 10),

              // Bottom Row: Date/Time + Action
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today_rounded,
                            size: 16, color: AppColors.primaryGreen),
                        const SizedBox(width: 6),
                        Flexible(
                          child: Text(
                            '${item.scheduledDate}, ${item.scheduledTime}',
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Row(
                    children: [
                      Text(
                        isUpcoming ? 'Join / View' : 'View Notes',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                      const Icon(Icons.chevron_right_rounded,
                          color: AppColors.primaryGreen, size: 20),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message, AppLocalizations l10n) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: Color(0xFFE8F5E9),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.support_agent_rounded,
                color: AppColors.primaryGreen,
                size: 40,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              l10n.noConsultationsFound,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: () {
                context.push('/consultation');
              },
              icon: const Icon(Icons.add_rounded, size: 20),
              label: Text(l10n.bookAnExpert,
                  style: const TextStyle(fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final historyAsync = ref.watch(consultationsHistoryProvider);
    final l10n = AppLocalizations.of(context)!;

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        context.go('/home');
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: FarmerAppBar(
          onBackTap: () {
            context.go('/home');
          },
          showTractorIcon: false,
          showBrandTitle: true,
          showLanguagePill: true,
        ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 540),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          l10n.myConsultations,
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () => context.push('/consultation'),
                        icon: const Icon(Icons.add_rounded,
                            color: AppColors.primaryGreen),
                        label: Text(
                          l10n.newSession,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // High-Contrast Tab Bar
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8ECE8),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    indicatorSize: TabBarIndicatorSize.tab,
                    indicator: BoxDecoration(
                      color: AppColors.primaryGreen,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    labelColor: Colors.white,
                    unselectedLabelColor: AppColors.textPrimary,
                    labelStyle: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                    ),
                    unselectedLabelStyle: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                    dividerColor: Colors.transparent,
                    tabs: [
                      Tab(text: l10n.upcoming),
                      Tab(text: l10n.pastHistory),
                    ],
                  ),
                ),

                // Tab Views
                Expanded(
                  child: historyAsync.when(
                    data: (consultations) {
                      final upcoming = consultations
                          .where((c) =>
                              c.status == ConsultationStatus.upcoming ||
                              c.status == ConsultationStatus.inProgress)
                          .toList();

                      final past = consultations
                          .where((c) =>
                              c.status == ConsultationStatus.completed ||
                              c.status == ConsultationStatus.cancelled)
                          .toList();

                      return TabBarView(
                        controller: _tabController,
                        children: [
                          // Tab 1: Upcoming
                          RefreshIndicator(
                            color: AppColors.primaryGreen,
                            onRefresh: () async {
                              ref.invalidate(consultationsHistoryProvider);
                            },
                            child: upcoming.isEmpty
                                ? _buildEmptyState(
                                    l10n.noScheduledConsultations, l10n)
                                : ListView.builder(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 20, vertical: 12),
                                    itemCount: upcoming.length,
                                    itemBuilder: (context, index) =>
                                        _buildConsultationCard(upcoming[index]),
                                  ),
                          ),

                          // Tab 2: Past History
                          RefreshIndicator(
                            color: AppColors.primaryGreen,
                            onRefresh: () async {
                              ref.invalidate(consultationsHistoryProvider);
                            },
                            child: past.isEmpty
                                ? _buildEmptyState(
                                    l10n.noConsultationsFound, l10n)
                                : ListView.builder(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 20, vertical: 12),
                                    itemCount: past.length,
                                    itemBuilder: (context, index) =>
                                        _buildConsultationCard(past[index]),
                                  ),
                          ),
                        ],
                      );
                    },
                    loading: () => const Center(
                      child: CircularProgressIndicator(
                          color: AppColors.primaryGreen),
                    ),
                    error: (err, _) => Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline_rounded,
                                color: Colors.redAccent, size: 48),
                            const SizedBox(height: 12),
                            Text('Failed to load consultations: $err'),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primaryGreen,
                                foregroundColor: Colors.white,
                              ),
                              onPressed: () =>
                                  ref.invalidate(consultationsHistoryProvider),
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      ),
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
}
