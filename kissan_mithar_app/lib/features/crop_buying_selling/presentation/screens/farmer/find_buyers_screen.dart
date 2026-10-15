import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../data/providers/crop_buying_selling_provider.dart';

class FindBuyersScreen extends ConsumerWidget {
  const FindBuyersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final buyersAsync = ref.watch(buyerRequirementsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Track Requests'),
      body: SafeArea(
        child: Column(
          children: [
            // Header Info Banner
            Container(
              margin: const EdgeInsets.all(16.0),
              padding: const EdgeInsets.all(14.0),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE0E6E0)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.timeline, color: Color(0xFF1B6327), size: 24),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Managed Request Tracking',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1B3B22)),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Track sourcing progress from submission to doorstep delivery.',
                          style: TextStyle(fontSize: 12, color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: buyersAsync.when(
                data: (buyers) {
                  if (buyers.isEmpty) {
                    return _buildEmptyState(context);
                  }
                  return ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: buyers.length,
                    itemBuilder: (context, index) {
                      final req = buyers[index];
                      final statusColor = _getStatusColor(req.status);

                      return Card(
                        margin: const EdgeInsets.only(bottom: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 1,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFE8F5E9),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: const Icon(Icons.shopping_bag_outlined, color: Color(0xFF1B6327), size: 20),
                                      ),
                                      const SizedBox(width: 10),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            req.productName,
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF1B3B22)),
                                          ),
                                          if (req.variety != null && req.variety!.isNotEmpty)
                                            Text(
                                              req.variety!,
                                              style: const TextStyle(fontSize: 12, color: Colors.black54),
                                            ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  // Status Badge
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: statusColor.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: statusColor.withOpacity(0.3)),
                                    ),
                                    child: Text(
                                      req.statusDisplay,
                                      style: TextStyle(
                                        color: statusColor,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 20),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Required Quantity', style: TextStyle(color: Colors.black54, fontSize: 11)),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${req.requiredQuantity % 1 == 0 ? req.requiredQuantity.toInt() : req.requiredQuantity} ${req.quantityUnit}',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF1B3B22)),
                                      ),
                                    ],
                                  ),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      const Text('Target Price', style: TextStyle(color: Colors.black54, fontSize: 11)),
                                      const SizedBox(height: 2),
                                      Text(
                                        req.expectedPrice != null && req.expectedPrice! > 0
                                            ? '₹${req.expectedPrice! % 1 == 0 ? req.expectedPrice!.toInt() : req.expectedPrice!} ${req.priceUnit ?? ''}'
                                            : 'Coordinated by KM',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1B3B22)),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_outlined, size: 14, color: Colors.black54),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      req.locationName,
                                      style: const TextStyle(color: Colors.black54, fontSize: 12),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: const Color(0xFF1B6327),
                                    side: const BorderSide(color: Color(0xFF1B6327)),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                  ),
                                  onPressed: () {
                                    context.push('/crop-buying-selling/buyer-details/${req.id}');
                                  },
                                  child: const Text('View Sourcing Progress', style: TextStyle(fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stack) => Center(child: Text('Error: $error')),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'SUBMITTED':
      case 'Request Submitted':
        return Colors.blue;
      case 'UNDER_REVIEW':
      case 'Under Review':
        return Colors.amber.shade800;
      case 'SOURCING_IN_PROGRESS':
      case 'Sourcing in Progress':
        return Colors.orange;
      case 'SUPPLIER_IDENTIFIED':
      case 'Supplier Identified':
        return const Color(0xFF2E7D32);
      case 'VERIFICATION_IN_PROGRESS':
      case 'Verification in Progress':
        return Colors.purple;
      case 'PROCUREMENT_IN_PROGRESS':
      case 'Procurement in Progress':
        return Colors.teal;
      case 'DELIVERY_IN_PROGRESS':
      case 'Delivery in Progress':
        return Colors.indigo;
      case 'DELIVERED':
      case 'Delivered':
        return const Color(0xFF1B6327);
      case 'CANCELLED':
      case 'Cancelled':
        return Colors.red;
      default:
        return const Color(0xFF1B6327);
    }
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.inbox_outlined, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('No Active Product Requests', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              'Submit a product request and the Kissan Mithar team will source it for you.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1B6327),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () => context.push('/crop-buying-selling/post-requirement'),
              child: const Text('Request a Product'),
            ),
          ],
        ),
      ),
    );
  }
}
