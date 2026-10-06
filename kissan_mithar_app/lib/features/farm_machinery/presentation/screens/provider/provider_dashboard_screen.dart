import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../providers/machinery_provider.dart';

class ProviderDashboardScreen extends ConsumerWidget {
  const ProviderDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // In a real app, this filters machines owned by the current provider.
    final myMachines = ref.watch(mockMachinesProvider).where((m) => m.provider.id == 'p1').toList();
    final provider = myMachines.isNotEmpty ? myMachines.first.provider : null;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: FarmerAppBar(
        title: 'My Machinery',
        onBackTap: () => context.go('/home'),
      ),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (provider != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                color: Colors.white,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(provider.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('${myMachines.length} Machines Registered', style: const TextStyle(fontSize: 16, color: AppColors.tertiary, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text(provider.location.fullAddress, style: const TextStyle(color: Colors.black54)),
                  ],
                ),
              ),
              const Divider(height: 1, color: Colors.black12),
            ],
            
            Expanded(
              child: myMachines.isEmpty 
                ? const Center(child: Text("You haven't added any machinery yet."))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: myMachines.length,
                    itemBuilder: (context, index) {
                      final machine = myMachines[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 1,
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          leading: Container(
                            width: 50, height: 50,
                            decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(8)),
                            child: const Icon(Icons.agriculture, color: Colors.grey),
                          ),
                          title: Text(machine.typeName, style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('${machine.brand} • ${machine.model}\n${machine.location.village}'),
                          isThreeLine: true,
                          trailing: const Icon(Icons.edit, color: Colors.grey),
                          onTap: () {
                            // Open edit machine screen
                          },
                        ),
                      );
                    },
                  ),
            ),
            
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    context.push('/farm-machinery/provider/add-machine');
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('Add Machine'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: AppColors.tertiary,
                    foregroundColor: Colors.white,
                    textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
