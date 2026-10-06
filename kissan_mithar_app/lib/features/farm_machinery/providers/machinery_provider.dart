import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models/machine_type.dart';
import '../domain/models/machine.dart';
import '../../../../shared/location/models/location_data.dart';

final machineTypesProvider = Provider<List<MachineType>>((ref) {
  return [
    const MachineType(id: '1', name: 'Tractor', iconPath: '🚜'),
    const MachineType(id: '2', name: 'Paddy Harvester', iconPath: '🌾'),
    const MachineType(id: '3', name: 'Combine Harvester', iconPath: '⚙️'),
    const MachineType(id: '4', name: 'Agricultural Drone', iconPath: '🚁'),
    const MachineType(id: '5', name: 'Sprayer', iconPath: '💦'),
    const MachineType(id: '6', name: 'Rotavator', iconPath: '⚙️'),
    const MachineType(id: '7', name: 'Seeder', iconPath: '🌱'),
  ];
});

final mockMachinesProvider = Provider<List<Machine>>((ref) {
  final provider1 = MachineryProviderProfile(
    id: 'p1',
    name: 'Ramesh Machinery Services',
    phone: '+91 9876543210',
    photoUrl: '',
    type: ProviderType.serviceProvider,
    location: const SharedLocationData(
      latitude: 16.2272, longitude: 77.8012,
      village: 'Gadwal', mandal: 'Gadwal Mandal', district: 'Jogulamba Gadwal', state: 'Telangana', fullAddress: 'Gadwal, Telangana',
    ),
  );

  final provider2 = MachineryProviderProfile(
    id: 'p2',
    name: 'Sri Sai Equipments',
    phone: '+91 8765432109',
    photoUrl: '',
    type: ProviderType.individualOwner,
    location: const SharedLocationData(
      latitude: 16.2272, longitude: 77.8012,
      village: 'Alampur', mandal: 'Alampur Mandal', district: 'Jogulamba Gadwal', state: 'Telangana', fullAddress: 'Alampur, Telangana',
    ),
  );

  return [
    Machine(
      id: 'm1',
      provider: provider1,
      typeId: '1',
      typeName: 'Tractor',
      brand: 'Swaraj',
      model: '744 XT',
      year: '2022',
      photoUrl: '',
      operatorIncluded: true,
      description: 'Well-maintained tractor suitable for ploughing and transport.',
      location: provider1.location,
    ),
    Machine(
      id: 'm2',
      provider: provider2,
      typeId: '2',
      typeName: 'Paddy Harvester',
      brand: 'Kubota',
      model: 'DC-68G',
      year: '2023',
      photoUrl: '',
      operatorIncluded: true,
      description: 'Fast and efficient paddy harvester with skilled operator.',
      location: provider2.location,
    ),
    Machine(
      id: 'm3',
      provider: provider1,
      typeId: '4',
      typeName: 'Agricultural Drone',
      brand: 'DJI',
      model: 'Agras T30',
      year: '2024',
      photoUrl: '',
      operatorIncluded: true,
      description: 'Precision spraying drone for large fields. Reduces chemical waste.',
      location: provider1.location,
    ),
  ];
});

final machinerySearchQueryProvider = StateProvider<String>((ref) => '');
final machinerySelectedTypeProvider = StateProvider<String?>((ref) => null);

final filteredMachineryProvider = Provider<List<Machine>>((ref) {
  final machines = ref.watch(mockMachinesProvider);
  final query = ref.watch(machinerySearchQueryProvider).toLowerCase();
  final selectedType = ref.watch(machinerySelectedTypeProvider);

  return machines.where((m) {
    if (selectedType != null && m.typeId != selectedType) return false;
    if (query.isEmpty) return true;
    
    return m.typeName.toLowerCase().contains(query) ||
           m.brand.toLowerCase().contains(query) ||
           m.provider.name.toLowerCase().contains(query) ||
           m.location.village.toLowerCase().contains(query) ||
           m.location.fullAddress.toLowerCase().contains(query);
  }).toList();
});
