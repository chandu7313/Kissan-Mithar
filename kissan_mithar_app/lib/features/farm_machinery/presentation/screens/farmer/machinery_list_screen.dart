import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../shared/location/providers/location_provider.dart';
import '../../../providers/machinery_provider.dart';

class MachineryListScreen extends ConsumerWidget {
  const MachineryListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = ref.watch(sharedLocationProvider);
    final machines = ref.watch(filteredMachineryProvider);
    final machineTypes = ref.watch(machineTypesProvider);
    final selectedType = ref.watch(machinerySelectedTypeProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const FarmerAppBar(title: 'Nearby Machinery'),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                InkWell(
                  onTap: () {
                    context.push('/farm-machinery/location?next=/farm-machinery/list');
                  },
                  child: Row(
                    children: [
                      const Icon(Icons.location_on, color: AppColors.tertiary, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          location.fullAddress.isEmpty ? 'Select Location' : location.fullAddress,
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.tertiary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(Icons.edit, size: 16, color: Colors.grey),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  onChanged: (value) => ref.read(machinerySearchQueryProvider.notifier).state = value,
                  decoration: InputDecoration(
                    hintText: 'Search machine or location...',
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: Colors.grey.shade100,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  height: 40,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: machineTypes.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        final isSelected = selectedType == null;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: const Text('All'),
                            selected: isSelected,
                            onSelected: (val) => ref.read(machinerySelectedTypeProvider.notifier).state = null,
                            selectedColor: AppColors.tertiary,
                            labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black87),
                          ),
                        );
                      }
                      
                      final type = machineTypes[index - 1];
                      final isSelected = selectedType == type.id;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text('${type.iconPath} ${type.name}'),
                          selected: isSelected,
                          onSelected: (val) => ref.read(machinerySelectedTypeProvider.notifier).state = val ? type.id : null,
                          selectedColor: AppColors.tertiary,
                          labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black87),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
          
          // List of Machines
          Expanded(
            child: machines.isEmpty
                ? const Center(child: Text('No machinery found near this location.'))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: machines.length,
                    itemBuilder: (context, index) {
                      final machine = machines[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 2,
                        child: InkWell(
                          onTap: () {
                            context.push('/farm-machinery/details/${machine.id}');
                          },
                          borderRadius: BorderRadius.circular(16),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      width: 60, height: 60,
                                      decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(8)),
                                      child: const Icon(Icons.agriculture, size: 32, color: Colors.grey),
                                    ),
                                    const SizedBox(width: 16),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(machine.typeName, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                          const SizedBox(height: 4),
                                          Text(machine.provider.name, style: TextStyle(color: Colors.grey.shade700)),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on, size: 16, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Text(machine.location.village, style: const TextStyle(color: Colors.black87)),
                                    const SizedBox(width: 16),
                                    const Icon(Icons.settings, size: 16, color: Colors.grey),
                                    const SizedBox(width: 4),
                                    Text('${machine.brand} • ${machine.model}', style: const TextStyle(color: Colors.black87)),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Calling ${machine.provider.phone}...')));
                                    },
                                    icon: const Icon(Icons.phone),
                                    label: const Text('Call Owner'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.tertiary,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
