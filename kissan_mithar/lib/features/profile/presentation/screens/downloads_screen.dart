import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_language.dart';

/// Represents a locally cached PDF file for the Downloads screen.
class CachedDownload {
  final String id;
  final String title;
  final String subtitle;
  final String filePath;
  final String fileSize;
  final DateTime downloadedAt;
  final DownloadType type;

  const CachedDownload({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.filePath,
    required this.fileSize,
    required this.downloadedAt,
    required this.type,
  });

  String get formattedDate {
    final now = DateTime.now();
    final diff = now.difference(downloadedAt);
    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return '${downloadedAt.day}/${downloadedAt.month}/${downloadedAt.year}';
  }

  IconData get icon {
    switch (type) {
      case DownloadType.orchardPlan:
        return Icons.park_rounded;
      case DownloadType.consultationReport:
        return Icons.medical_services_rounded;
      case DownloadType.invoice:
        return Icons.receipt_long_rounded;
      case DownloadType.general:
        return Icons.picture_as_pdf_rounded;
    }
  }

  Color get iconColor {
    switch (type) {
      case DownloadType.orchardPlan:
        return const Color(0xFF2E7D32);
      case DownloadType.consultationReport:
        return const Color(0xFF1565C0);
      case DownloadType.invoice:
        return const Color(0xFFE65100);
      case DownloadType.general:
        return const Color(0xFF546E7A);
    }
  }

  Color get iconBgColor {
    switch (type) {
      case DownloadType.orchardPlan:
        return const Color(0xFFE8F5E9);
      case DownloadType.consultationReport:
        return const Color(0xFFE3F2FD);
      case DownloadType.invoice:
        return const Color(0xFFFFF3E0);
      case DownloadType.general:
        return const Color(0xFFECEFF1);
    }
  }
}

enum DownloadType { orchardPlan, consultationReport, invoice, general }

class DownloadsScreen extends StatelessWidget {
  const DownloadsScreen({super.key});

  static List<CachedDownload> get _mockDownloads => [
        CachedDownload(
          id: 'DL-001',
          title: 'Orchard Plantation Plan — 2.5 Acres',
          subtitle: 'Khed, Pune • Mango & Guava Layout',
          filePath: '/downloads/KM-Orchard-Plan-2023.pdf',
          fileSize: '2.3 MB',
          downloadedAt: DateTime.now().subtract(const Duration(days: 2)),
          type: DownloadType.orchardPlan,
        ),
        CachedDownload(
          id: 'DL-002',
          title: 'Consultation Report — Dr. Sunil Rao',
          subtitle: 'Leaf spot disease • Follow-up in 7 days',
          filePath: '/downloads/KM-Consultation-Report-8921.pdf',
          fileSize: '1.1 MB',
          downloadedAt: DateTime.now().subtract(const Duration(days: 5)),
          type: DownloadType.consultationReport,
        ),
        CachedDownload(
          id: 'DL-003',
          title: 'Service Invoice — July 2026',
          subtitle: 'Orchard Planning Service • ₹2,499',
          filePath: '/downloads/KM-Invoice-Jul-2026.pdf',
          fileSize: '450 KB',
          downloadedAt: DateTime.now().subtract(const Duration(days: 14)),
          type: DownloadType.invoice,
        ),
      ];

  @override
  Widget build(BuildContext context) {
    final downloads = _mockDownloads;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Downloads',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            letterSpacing: -0.5,
          ),
        ),
        actions: [
          _buildLanguagePill(context),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 600),
            child: downloads.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    itemCount: downloads.length + 1, // +1 for storage info
                    itemBuilder: (context, index) {
                      if (index == downloads.length) {
                        return _buildStorageInfo(downloads);
                      }
                      return _buildDownloadCard(context, downloads[index]);
                    },
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildLanguagePill(BuildContext context) {
    final currentLang = LanguageProvider().currentLanguage;
    return Container(
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
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Color(0xFFE8F5E9),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.download_done_rounded,
                size: 48,
                color: AppColors.primaryGreen,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'No Downloaded Files',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Your saved reports and PDFs\nwill appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDownloadCard(BuildContext context, CachedDownload item) {
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
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Opening ${item.title}...'),
                backgroundColor: AppColors.primaryGreen,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            );
          },
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // PDF Type Icon
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: item.iconBgColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(item.icon, color: item.iconColor, size: 24),
                ),
                const SizedBox(width: 14),

                // Title, Subtitle, Meta
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.title,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.subtitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today_rounded,
                              size: 12, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            item.formattedDate,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Icon(Icons.storage_rounded,
                              size: 12, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            item.fileSize,
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

                // Share button
                IconButton(
                  onPressed: () {
                    Share.share('Sharing ${item.title} from Kissan Mithar');
                  },
                  icon: const Icon(
                    Icons.share_rounded,
                    color: AppColors.primaryGreen,
                    size: 20,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStorageInfo(List<CachedDownload> downloads) {
    return Container(
      margin: const EdgeInsets.only(top: 8, bottom: 32),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F7F5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE0E4E0)),
      ),
      child: Row(
        children: [
          const Icon(Icons.folder_rounded,
              color: AppColors.textSecondary, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '${downloads.length} files cached locally',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          TextButton(
            onPressed: () {},
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              minimumSize: Size.zero,
            ),
            child: const Text(
              'Clear Cache',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Color(0xFFC62828),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
