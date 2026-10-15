import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../data/providers/crop_buying_selling_provider.dart';

class CropDetailsScreen extends ConsumerWidget {
  final String listingId;

  const CropDetailsScreen({super.key, required this.listingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listingsAsync = ref.watch(cropListingsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Product Details'),
      body: listingsAsync.when(
        data: (listings) {
          final listing = listings.firstWhere(
            (l) => l.id == listingId,
            orElse: () => listings.first,
          );

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Visual Banner
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(Icons.eco, size: 52, color: Color(0xFF1B6327)),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        listing.cropName,
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
                      ),
                      if (listing.variety != null && listing.variety!.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Variety: ${listing.variety}',
                          style: const TextStyle(fontSize: 15, color: Colors.black54),
                        ),
                      ],
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF81C784)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.shield_outlined, color: Color(0xFF1B6327), size: 16),
                            SizedBox(width: 6),
                            Text(
                              'Verified Sourcing by Kissan Mithar',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1B6327)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Specs Card
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E7E2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Product Specifications', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22))),
                      const SizedBox(height: 16),
                      _buildDetailRow('Available Quantity Range', listing.quantityDisplay),
                      const Divider(height: 24),
                      _buildDetailRow('Price Guide', listing.priceDisplay),
                      const Divider(height: 24),
                      _buildDetailRow('Region / State', listing.locationName),
                      if (listing.description != null && listing.description!.isNotEmpty) ...[
                        const Divider(height: 24),
                        const Text('Produce Notes', style: TextStyle(color: Colors.black54, fontSize: 13)),
                        const SizedBox(height: 6),
                        Text(listing.description!, style: const TextStyle(fontSize: 14, height: 1.4, color: Colors.black87)),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // How KM Handles Procurement
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F8E9),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFC8E6C9)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.verified, color: Color(0xFF1B6327), size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Kissan Mithar Managed Guarantee',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1B3B22)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        '1. We verify quantity and quality directly at the grower farm.\n'
                        '2. We coordinate sorting, packaging, and cold-chain logistics where required.\n'
                        '3. Delivery is scheduled directly to your business or doorstep.',
                        style: TextStyle(fontSize: 12, color: Colors.black87, height: 1.5),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 100),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(16),
        color: Colors.white,
        child: SafeArea(
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1B6327),
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(54),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.shopping_bag_outlined),
            label: const Text(
              'Request Kissan Mithar to Source This',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            onPressed: () {
              context.push('/crop-buying-selling/post-requirement');
            },
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.black54, fontSize: 13)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1B3B22))),
      ],
    );
  }
}
