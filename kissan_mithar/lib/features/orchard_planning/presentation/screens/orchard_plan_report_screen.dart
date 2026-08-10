import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../../core/routing/app_router.dart';
import '../../providers/orchard_planning_provider.dart';

class OrchardPlanReportScreen extends ConsumerWidget {
  const OrchardPlanReportScreen({super.key});

  void _sharePlan(BuildContext context, OrchardDraftState state) {
    Share.share(
      '🌾 Kisan Mithar Orchard Plan for ${state.village}, ${state.district}\n\n'
      '🌱 Recommended Crop: Mango (Kesar Variety)\n'
      '💰 Estimated Cost: ₹45,000\n'
      '📅 Timeline: 12-14 Months\n'
      '📈 Annual ROI: 25% - 30%\n'
      '🌿 Soil Suitability: High (${state.soilTypes.join(', ')})\n\n'
      'Designed with expert agronomy guidance on Kisan Mithar app.',
      subject: 'Kisan Mithar - Orchard Plan Report',
    );
  }

  void _showDownloadDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.download_done_rounded, color: AppColors.primary),
            SizedBox(width: 8),
            Text(l10n.planDownloaded, style: TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Text(
          'Your detailed Orchard Plantation PDF Report (KM-Orchard-Plan-2023.pdf) has been saved to your downloads.',
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.ok),
          ),
        ],
      ),
    );
  }

  void _showFullReportModal(BuildContext context, OrchardDraftState state) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Comprehensive Agronomy Report',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  _buildReportSection(
                    title: '1. Land & Soil Preparation',
                    icon: Icons.terrain_rounded,
                    content:
                        'Deep ploughing up to 45cm followed by cross-harrowing. Dig 1m x 1m x 1m pits at 10m x 10m spacing (40 trees/acre). Fill each pit with 25kg FYM + 2kg Single Super Phosphate + 100g Chlorpyrifos dust.',
                  ),
                  const SizedBox(height: 16),
                  _buildReportSection(
                    title: '2. Variety & Plantation Technique',
                    icon: Icons.park_rounded,
                    content:
                        'Grafted Kesar Mango saplings from certified nursery. Plant during early monsoon (July-August). Stake with bamboo supports to protect from heavy winds.',
                  ),
                  const SizedBox(height: 16),
                  _buildReportSection(
                    title: '3. Irrigation & Water Management',
                    icon: Icons.water_drop_rounded,
                    content:
                        'Install online drip system with 2 emitters per tree (4 LPH each). Summer requirement: 25-30 Litres/day/tree. Winter requirement: 10-15 Litres/day/tree.',
                  ),
                  const SizedBox(height: 16),
                  _buildReportSection(
                    title: '4. Intercropping Opportunities',
                    icon: Icons.eco_rounded,
                    content:
                        'During the first 3 years before canopy closure, intercrop with Short-duration Pulses (Gram, Moong) or Vegetables (Chili, Tomato) to generate early cash flow of ₹30,000/acre.',
                  ),
                  const SizedBox(height: 16),
                  _buildReportSection(
                    title: '5. Expected Harvest & Financials',
                    icon: Icons.trending_up_rounded,
                    content:
                        'First commercial harvest begins in Year 3 (15-20 kg/tree). Peak yield at Year 6+ (80-100 kg/tree). Estimated annual gross income: ₹1,50,000 to ₹2,20,000 per acre at market rates.',
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReportSection({required String title, required IconData icon, required String content}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFBF9F2),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE9E8E1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.primary, size: 22),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.45),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(orchardPlanningProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFFBF9F2),
      appBar: FarmerAppBar(
        showBrandTitle: false,
        showTractorIcon: false,
        onBackTap: () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/home');
          }
        },
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Header Section with Badge
              Container(
                width: 72,
                height: 72,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.military_tech_rounded,
                  color: Colors.white,
                  size: 44,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Your Plan is Ready!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Here is the customized orchard plan based on your farm\'s data.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),

              // Summary Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE9E8E1)),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x0F6D4E45),
                      blurRadius: 12,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    // Recommended Orchard Heading
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFE0B2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.park_rounded, color: Color(0xFFE65100), size: 30),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'RECOMMENDED ORCHARD',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textSecondary,
                                  letterSpacing: 0.8,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Mango (Kesar Variety)',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),
                    const Divider(color: Color(0xFFE9E8E1)),
                    const SizedBox(height: 16),

                    // 4 Stat Grid
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatTile(
                            icon: Icons.currency_rupee_rounded,
                            iconColor: const Color(0xFF5D4037),
                            label: 'Estimated Cost',
                            value: '₹45,000',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildStatTile(
                            icon: Icons.calendar_month_rounded,
                            iconColor: const Color(0xFF0288D1),
                            label: 'Timeline',
                            value: '12-14 Months',
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildStatTile(
                            icon: Icons.trending_up_rounded,
                            iconColor: AppColors.primary,
                            label: 'Annual ROI',
                            value: '25% - 30%',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildStatTile(
                            icon: Icons.eco_rounded,
                            iconColor: AppColors.primary,
                            label: 'Soil Suitability',
                            value: 'High',
                            isHighlight: true,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Primary Action: View Full Report
              SizedBox(
                width: double.infinity,
                height: 64,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    elevation: 2,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () => _showFullReportModal(context, state),
                  icon: const Icon(Icons.description_rounded, size: 24),
                  label: const Text(
                    'View Full Report',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              ),

              const SizedBox(height: 14),

              // Secondary 2-Column Action Buttons: Download & Share
              Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 56,
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF5D4037),
                          side: const BorderSide(color: Color(0xFF5D4037), width: 1.5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () => _showDownloadDialog(context),
                        icon: const Icon(Icons.download_rounded, size: 22),
                        label: const Text(
                          'Download',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SizedBox(
                      height: 56,
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF5D4037),
                          side: const BorderSide(color: Color(0xFF5D4037), width: 1.5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: () => _sharePlan(context, state),
                        icon: const Icon(Icons.share_rounded, size: 22),
                        label: const Text(
                          'Share',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              TextButton.icon(
                onPressed: () => context.goNamed(AppRoutes.home),
                icon: const Icon(Icons.home_rounded, color: AppColors.primary),
                label: const Text(
                  'Back to Home Dashboard',
                  style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatTile({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    bool isHighlight = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F4ED),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: iconColor),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isHighlight ? AppColors.primary : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
