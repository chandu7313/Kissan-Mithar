import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../core/constants/app_colors.dart';

class CropBuyingSellingHomeScreen extends StatelessWidget {
  const CropBuyingSellingHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const FarmerAppBar(title: 'Crop Buying & Selling'),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Crop Buying & Selling',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Connect directly with buyers and farmers.',
                style: TextStyle(fontSize: 16, color: Colors.black87, height: 1.4),
              ),
              const SizedBox(height: 32),
              
              const Text(
                'I am a Farmer',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 16),
              
              _buildActionCard(
                context,
                title: 'Find Buyers',
                subtitle: 'Browse crop requirements posted by buyers.',
                icon: Icons.search,
                color: const Color(0xFF1B6327),
                isPrimary: true,
                onTap: () => context.push('/crop-buying-selling/find-buyers'),
              ),
              const SizedBox(height: 12),
              _buildActionCard(
                context,
                title: 'List My Crop',
                subtitle: 'Add your crop details for buyers to see.',
                icon: Icons.add_circle_outline,
                color: Colors.white,
                isPrimary: false,
                onTap: () => context.push('/crop-buying-selling/list-crop'),
              ),
              
              const SizedBox(height: 32),
              const Text(
                'I am a Buyer',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 16),
              
              _buildActionCard(
                context,
                title: 'Find Crops',
                subtitle: 'Browse crops listed by local farmers.',
                icon: Icons.agriculture,
                color: const Color(0xFFD67229), // A warm agricultural color for buyers
                isPrimary: true,
                onTap: () => context.push('/crop-buying-selling/find-crops'),
              ),
              const SizedBox(height: 12),
              _buildActionCard(
                context,
                title: 'Post Requirement',
                subtitle: 'Post what crop you are looking to buy.',
                icon: Icons.post_add,
                color: Colors.white,
                isPrimary: false,
                onTap: () => context.push('/crop-buying-selling/post-requirement'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required bool isPrimary,
    required VoidCallback onTap,
  }) {
    final textColor = isPrimary ? Colors.white : Colors.black87;
    final iconColor = isPrimary ? Colors.white : AppColors.primary;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(16),
          border: isPrimary ? null : Border.all(color: Colors.grey.shade300),
          boxShadow: isPrimary
              ? [BoxShadow(color: color.withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4))]
              : null,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isPrimary ? Colors.white.withOpacity(0.2) : color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: iconColor, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(color: textColor, fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(color: textColor.withOpacity(isPrimary ? 0.9 : 0.6), fontSize: 14),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, color: textColor.withOpacity(0.5), size: 16),
          ],
        ),
      ),
    );
  }
}
