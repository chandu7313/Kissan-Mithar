import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../core/constants/app_colors.dart';

class CropBuyingSellingHomeScreen extends StatelessWidget {
  const CropBuyingSellingHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Agri Bazaar'),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Brand Header Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22.0),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF144D1E), Color(0xFF1B6327), Color(0xFF2E7D32)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1B6327).withOpacity(0.25),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.verified, color: Colors.white, size: 14),
                          SizedBox(width: 5),
                          Text(
                            'MANAGED SOURCING SERVICE',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Agri Bazaar',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const Text(
                      'by Kissan Mithar',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFFC8E6C9),
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Your Agricultural Needs, Sourced and Delivered.',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Kissan Mithar manages procurement, quality verification, and logistics end-to-end between verified growers and buyers.',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withOpacity(0.9),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // Buyer Section Header
              const Row(
                children: [
                  Icon(Icons.shopping_bag_outlined, color: Color(0xFF1B6327), size: 22),
                  SizedBox(width: 8),
                  Text(
                    'Looking to Procure Produce?',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1B3B22),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Tell us what agricultural product you need in bulk or quantity.',
                style: TextStyle(fontSize: 13, color: Colors.black54),
              ),
              const SizedBox(height: 14),

              // Primary CTA: Request a Product
              _buildFeatureCard(
                context,
                title: 'Request a Product',
                subtitle: 'Submit your requirement. Kissan Mithar coordinates sourcing & delivery.',
                badgeText: 'PRIMARY ACTION',
                icon: Icons.post_add,
                cardColor: const Color(0xFF1B6327),
                isHighlight: true,
                onTap: () => context.push('/crop-buying-selling/post-requirement'),
              ),

              const SizedBox(height: 12),

              // Track Requests
              _buildFeatureCard(
                context,
                title: 'Track My Requests',
                subtitle: 'Monitor review, sourcing, verification, and delivery stages.',
                badgeText: 'LIVE TRACKING',
                icon: Icons.track_changes,
                cardColor: Colors.white,
                isHighlight: false,
                onTap: () => context.push('/crop-buying-selling/find-buyers'),
              ),

              const SizedBox(height: 30),

              // Seller Section Header
              const Row(
                children: [
                  Icon(Icons.agriculture, color: Color(0xFFD67229), size: 22),
                  SizedBox(width: 8),
                  Text(
                    'Are You a Grower / Supplier?',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1B3B22),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              const Text(
                'Register your harvest or stock to be connected with managed demand.',
                style: TextStyle(fontSize: 13, color: Colors.black54),
              ),
              const SizedBox(height: 14),

              // Secondary CTA: Register a Product
              _buildFeatureCard(
                context,
                title: 'Register a Product',
                subtitle: 'List your produce, available quantity range, and optional expected price.',
                badgeText: 'SUPPLIER REGISTRATION',
                icon: Icons.add_business,
                cardColor: const Color(0xFFD67229),
                isHighlight: true,
                onTap: () => context.push('/crop-buying-selling/list-crop'),
              ),

              const SizedBox(height: 12),

              // Browse Available Catalog
              _buildFeatureCard(
                context,
                title: 'Browse Available Products',
                subtitle: 'Explore current verified agricultural produce ready for procurement.',
                badgeText: 'CATALOGUE',
                icon: Icons.storefront,
                cardColor: Colors.white,
                isHighlight: false,
                onTap: () => context.push('/crop-buying-selling/find-crops'),
              ),

              const SizedBox(height: 32),

              // How Managed Sourcing Works Banner
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE0E6E0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.shield_outlined, color: Color(0xFF1B6327), size: 20),
                        SizedBox(width: 8),
                        Text(
                          'How Kissan Mithar Sourcing Works',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1B3B22),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildStepRow('1', 'Submit Request', 'Specify produce, fixed quantity, and delivery location.'),
                    const SizedBox(height: 8),
                    _buildStepRow('2', 'Internal Matching', 'KM team identifies verified suppliers and inspects quality.'),
                    const SizedBox(height: 8),
                    _buildStepRow('3', 'Procurement & Delivery', 'Transparent coordination and guaranteed delivery to you.'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepRow(String number, String title, String desc) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 22,
          height: 22,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: const Color(0xFFE8F5E9),
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0xFF81C784)),
          ),
          child: Text(
            number,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1B6327)),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: const TextStyle(fontSize: 13, color: Colors.black87),
              children: [
                TextSpan(text: '$title — ', style: const TextStyle(fontWeight: FontWeight.bold)),
                TextSpan(text: desc, style: const TextStyle(color: Colors.black54)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildFeatureCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required String badgeText,
    required IconData icon,
    required Color cardColor,
    required bool isHighlight,
    required VoidCallback onTap,
  }) {
    final textColor = isHighlight ? Colors.white : const Color(0xFF1B3B22);
    final subColor = isHighlight ? Colors.white.withOpacity(0.85) : Colors.black54;
    final iconBgColor = isHighlight ? Colors.white.withOpacity(0.2) : const Color(0xFFF1F5F1);
    final iconColor = isHighlight ? Colors.white : const Color(0xFF1B6327);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(16),
          border: isHighlight ? null : Border.all(color: const Color(0xFFE2E7E2)),
          boxShadow: isHighlight
              ? [
                  BoxShadow(
                    color: cardColor.withOpacity(0.28),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  )
                ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: iconBgColor,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: iconColor, size: 26),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          color: textColor,
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(color: subColor, fontSize: 13, height: 1.3),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(Icons.arrow_forward_ios, color: textColor.withOpacity(0.4), size: 16),
          ],
        ),
      ),
    );
  }
}
