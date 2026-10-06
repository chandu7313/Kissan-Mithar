import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../../shared/widgets/large_button.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../providers/machinery_provider.dart';

class MachineryDetailsScreen extends ConsumerWidget {
  final String id;
  const MachineryDetailsScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final machines = ref.watch(mockMachinesProvider);
    final machine = machines.firstWhere(
      (m) => m.id == id,
      orElse: () => machines.first,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const FarmerAppBar(title: 'Machine Details'),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: double.infinity,
                      height: 200,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.agriculture, size: 80, color: Colors.grey),
                    ),
                    const SizedBox(height: 24),
                    
                    Text(
                      machine.typeName,
                      style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 8),
                    
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildDetailRow('Brand', machine.brand),
                          const Divider(height: 24),
                          _buildDetailRow('Model', '${machine.model} (${machine.year})'),
                          const Divider(height: 24),
                          _buildDetailRow('Owner', machine.provider.name),
                          const Divider(height: 24),
                          _buildDetailRow('Location', machine.location.fullAddress),
                          if (machine.operatorIncluded) ...[
                            const Divider(height: 24),
                            _buildDetailRow('Operator', 'Included / Available'),
                          ],
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    const Text('Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Text(
                      machine.description,
                      style: const TextStyle(fontSize: 16, color: Colors.black87, height: 1.5),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -4)),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                child: LargeButton(
                  label: 'Call Owner',
                  backgroundColor: AppColors.tertiary,
                  leadingIcon: const Icon(Icons.phone, color: Colors.white),
                  onPressed: () {
                    // Simulate phone call action
                    showDialog(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Call Owner?'),
                        content: Text('Call ${machine.provider.name} at ${machine.provider.phone}?'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                          TextButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                            }, 
                            child: const Text('Call')
                          ),
                        ],
                      )
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(label, style: const TextStyle(color: Colors.black54, fontSize: 16)),
        ),
        Expanded(
          child: Text(value, style: const TextStyle(color: Colors.black87, fontSize: 16, fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }
}
