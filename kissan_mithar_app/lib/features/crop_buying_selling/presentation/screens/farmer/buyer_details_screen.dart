import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../data/providers/crop_buying_selling_provider.dart';
import '../../../domain/models/crop_buying_selling_models.dart';

class BuyerDetailsScreen extends ConsumerWidget {
  final String reqId;

  const BuyerDetailsScreen({super.key, required this.reqId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final buyersAsync = ref.watch(buyerRequirementsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Sourcing Progress'),
      body: buyersAsync.when(
        data: (buyers) {
          final req = buyers.firstWhere(
            (b) => b.id == reqId,
            orElse: () => buyers.first,
          );

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Produce Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFE2E7E2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  req.productName,
                                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
                                ),
                                if (req.variety != null && req.variety!.isNotEmpty) ...[
                                  const SizedBox(height: 2),
                                  Text(
                                    'Variety: ${req.variety}',
                                    style: const TextStyle(fontSize: 14, color: Colors.black54),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE8F5E9),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFF81C784)),
                            ),
                            child: Text(
                              req.statusDisplay,
                              style: const TextStyle(
                                color: Color(0xFF1B6327),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Required Quantity', style: TextStyle(fontSize: 12, color: Colors.black54)),
                              const SizedBox(height: 2),
                              Text(
                                '${req.requiredQuantity % 1 == 0 ? req.requiredQuantity.toInt() : req.requiredQuantity} ${req.quantityUnit}',
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              const Text('Target Price', style: TextStyle(fontSize: 12, color: Colors.black54)),
                              const SizedBox(height: 2),
                              Text(
                                req.expectedPrice != null && req.expectedPrice! > 0
                                    ? '₹${req.expectedPrice! % 1 == 0 ? req.expectedPrice!.toInt() : req.expectedPrice!} ${req.priceUnit ?? ''}'
                                    : 'Coordinated by KM',
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.location_on_outlined, size: 16, color: Colors.black54),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              'Delivery: ${req.locationName}',
                              style: const TextStyle(fontSize: 13, color: Colors.black54),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Managed Sourcing Timeline
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFE2E7E2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.hub_outlined, color: Color(0xFF1B6327), size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Sourcing & Delivery Timeline',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'End-to-end tracking managed by Kissan Mithar.',
                        style: TextStyle(fontSize: 12, color: Colors.black54),
                      ),
                      const SizedBox(height: 18),

                      _buildTimelineItem(
                        stage: 1,
                        currentStage: _getStageIndex(req.status),
                        title: 'Request Submitted',
                        subtitle: 'Received at Kissan Mithar sourcing desk.',
                      ),
                      _buildTimelineItem(
                        stage: 2,
                        currentStage: _getStageIndex(req.status),
                        title: 'Under Review',
                        subtitle: 'Specs, quantity, and delivery parameters verified.',
                      ),
                      _buildTimelineItem(
                        stage: 3,
                        currentStage: _getStageIndex(req.status),
                        title: 'Sourcing in Progress',
                        subtitle: 'KM field team contacting certified growers.',
                      ),
                      _buildTimelineItem(
                        stage: 4,
                        currentStage: _getStageIndex(req.status),
                        title: 'Supplier Identified',
                        subtitle: 'Matching growers with required volume identified.',
                      ),
                      _buildTimelineItem(
                        stage: 5,
                        currentStage: _getStageIndex(req.status),
                        title: 'Quantity & Quality Verification',
                        subtitle: 'Physical inspection and grade check at farm gate.',
                      ),
                      _buildTimelineItem(
                        stage: 6,
                        currentStage: _getStageIndex(req.status),
                        title: 'Procurement in Progress',
                        subtitle: 'Harvesting, sorting, packaging, and loading.',
                      ),
                      _buildTimelineItem(
                        stage: 7,
                        currentStage: _getStageIndex(req.status),
                        title: 'Delivery in Progress',
                        subtitle: 'Produce in transit to delivery destination.',
                      ),
                      _buildTimelineItem(
                        stage: 8,
                        currentStage: _getStageIndex(req.status),
                        title: 'Delivered',
                        subtitle: 'Consignment handed over and signed off.',
                        isLast: true,
                      ),
                    ],
                  ),
                ),

                if (req.adminNotes != null && req.adminNotes!.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFDE7),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFFFF59D)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.notes, color: Color(0xFFF57F17), size: 18),
                            SizedBox(width: 8),
                            Text('Sourcing Desk Update', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFFF57F17))),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(req.adminNotes!, style: const TextStyle(fontSize: 13, color: Colors.black87, height: 1.3)),
                      ],
                    ),
                  ),
                ],

                const SizedBox(height: 20),

                // Privacy assurance box
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.lock_outline, color: Color(0xFF1B6327), size: 18),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Direct buyer-supplier contact is restricted to preserve confidentiality and quality guarantees.',
                          style: TextStyle(fontSize: 12, color: Colors.black54),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
    );
  }

  int _getStageIndex(String status) {
    switch (status) {
      case 'SUBMITTED':
      case 'Request Submitted':
        return 1;
      case 'UNDER_REVIEW':
      case 'Under Review':
        return 2;
      case 'SOURCING_IN_PROGRESS':
      case 'Sourcing in Progress':
        return 3;
      case 'SUPPLIER_IDENTIFIED':
      case 'Supplier Identified':
        return 4;
      case 'VERIFICATION_IN_PROGRESS':
      case 'Verification in Progress':
        return 5;
      case 'PROCUREMENT_IN_PROGRESS':
      case 'Procurement in Progress':
        return 6;
      case 'DELIVERY_IN_PROGRESS':
      case 'Delivery in Progress':
        return 7;
      case 'DELIVERED':
      case 'Delivered':
        return 8;
      default:
        return 1;
    }
  }

  Widget _buildTimelineItem({
    required int stage,
    required int currentStage,
    required String title,
    required String subtitle,
    bool isLast = false,
  }) {
    final isDone = stage < currentStage;
    final isCurrent = stage == currentStage;

    final dotColor = isDone || isCurrent ? const Color(0xFF1B6327) : const Color(0xFFCFD8DC);
    final lineColor = isDone ? const Color(0xFF1B6327) : const Color(0xFFECEFF1);

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Dot and vertical line
          Column(
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: isCurrent ? const Color(0xFF1B6327) : (isDone ? const Color(0xFF1B6327) : Colors.white),
                  shape: BoxShape.circle,
                  border: Border.all(color: dotColor, width: 2),
                ),
                child: isDone
                    ? const Icon(Icons.check, color: Colors.white, size: 14)
                    : (isCurrent
                        ? Container(
                            margin: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                          )
                        : null),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: lineColor,
                    margin: const EdgeInsets.symmetric(vertical: 2),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          // Content
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isCurrent ? FontWeight.w800 : (isDone ? FontWeight.bold : FontWeight.w500),
                      color: isCurrent || isDone ? const Color(0xFF1B3B22) : Colors.black45,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: isCurrent ? Colors.black87 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
