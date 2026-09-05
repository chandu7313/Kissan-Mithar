import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class LegalScreen extends StatefulWidget {
  final int initialTabIndex; // 0: Privacy Policy, 1: Terms of Use

  const LegalScreen({
    super.key,
    this.initialTabIndex = 0,
  });

  @override
  State<LegalScreen> createState() => _LegalScreenState();
}

class _LegalScreenState extends State<LegalScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this, initialIndex: widget.initialTabIndex);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Legal & Privacy Policy',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.accentSunGold,
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          tabs: const [
            Tab(text: 'Privacy Policy'),
            Tab(text: 'Terms of Use'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildPrivacyPolicyTab(),
          _buildTermsOfUseTab(),
        ],
      ),
    );
  }

  Widget _buildPrivacyPolicyTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeroCard(
            icon: Icons.shield_outlined,
            title: 'Your Farm Data is 100% Private & Protected',
            subtitle: 'Kisan Mithar is committed to farmer confidentiality. We do not sell your personal or farm data.',
          ),
          const SizedBox(height: 16),
          _buildSectionTitle('1. Information We Collect'),
          _buildBodyText(
            '• Phone Number & Name: For login and consultation authentication.\n'
            '• Land Coordinates (GPS): Solely used to determine local soil classification, agro-climatic zone, and micro-weather forecasts.\n'
            '• Land & Crop Photos: Analyzed by certified agronomists and AI models to inspect soil texture, slope, and plant health.\n'
            '• Voice Notes: Transcribed and shared with your assigned horticulturist to understand specific farm requirements.',
          ),
          const SizedBox(height: 16),
          _buildSectionTitle('2. How We Use Your Data'),
          _buildBodyText(
            'Your data is exclusively utilized to construct customized Orchard Feasibility Reports, schedule live agronomist calls, and deliver timely weather/pest alerts. We do not share your land records with unauthorized commercial third parties.',
          ),
          const SizedBox(height: 16),
          _buildSectionTitle('3. Security & Cloud Storage'),
          _buildBodyText(
            'All communications are encrypted via HTTPS/TLS. Uploaded media is securely stored in access-controlled Cloudinary/Supabase repositories.',
          ),
          const SizedBox(height: 16),
          _buildSectionTitle('4. Farmer Rights & Data Deletion'),
          _buildBodyText(
            'You may request complete erasure of your account, land surveys, and consultation history at any time by contacting support@kissanmithar.com or through Profile > Settings.',
          ),
          const SizedBox(height: 24),
          _buildFooterContact(),
        ],
      ),
    );
  }

  Widget _buildTermsOfUseTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeroCard(
            icon: Icons.gavel_outlined,
            title: 'Terms of Use & Agronomic Advisory',
            subtitle: 'Guidelines governing the Kisan Mithar horticulture platform.',
          ),
          const SizedBox(height: 16),
          _buildSectionTitle('1. Agronomy & Advisory Disclaimer'),
          _buildBodyText(
            'Orchard plans, fertilizer dosages, and pest management schedules provided by Kisan Mithar are formulated using scientific horticultural principles. However, actual crop yields may vary based on weather extremes, water availability, and seed/nursery quality. Farmers are encouraged to follow localized best practices.',
          ),
          const SizedBox(height: 16),
          _buildSectionTitle('2. Expert Consultations'),
          _buildBodyText(
            'Consultation sessions (Voice/Video) are intended for professional agricultural guidance. Respectful communication is required during all interactions with agronomists.',
          ),
          const SizedBox(height: 16),
          _buildSectionTitle('3. Subsidies & Government Schemes'),
          _buildBodyText(
            'Information regarding MIDH, PMKSY, and state horticulture subsidies is compiled from official government portals for farmer awareness. Final subsidy approval rests with respective state agriculture departments.',
          ),
          const SizedBox(height: 24),
          _buildFooterContact(),
        ],
      ),
    );
  }

  Widget _buildHeroCard({required IconData icon, required String title, required String subtitle}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFA5D6A7)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.primary, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String text) {
    return Text(
      text,
      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.primary),
    );
  }

  Widget _buildBodyText(String text) {
    return Padding(
      padding: const EdgeInsets.only(top: 6.0),
      child: Text(
        text,
        style: const TextStyle(fontSize: 13, height: 1.5, color: AppColors.textPrimary),
      ),
    );
  }

  Widget _buildFooterContact() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: const [
          Text('Support: support@kissanmithar.com', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          Text('v1.0.0 Release', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primary)),
        ],
      ),
    );
  }
}
