import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models/labour_group_model.dart';

// Mock list of labour groups
final mockLabourGroups = [
  LabourGroup(
    id: '1',
    name: 'Ramesh Harvesters',
    memberCount: 15,
    workDescription: 'Specialists in cotton picking, paddy harvesting, and general farm labor. Available for multi-day contracts.',
    location: 'Gadwal, Telangana',
    phone: '+91 9876543210',
    rating: 4.8,
    wagePerDay: 500,
    leaderName: 'Ramesh Reddy',
  ),
  LabourGroup(
    id: '2',
    name: 'Sri Sai Workers',
    memberCount: 8,
    workDescription: 'Expert weeding and pesticide spraying team. Own equipment provided.',
    location: 'Gadwal, Telangana',
    phone: '+91 8765432109',
    rating: 4.5,
    wagePerDay: 450,
    leaderName: 'Sai Kumar',
  ),
  LabourGroup(
    id: '3',
    name: 'Venkateshwara Team',
    memberCount: 20,
    workDescription: 'Large team for quick sowing and transplantation of paddy and other crops.',
    location: 'Kurnool, AP',
    phone: '+91 7654321098',
    rating: 4.2,
    wagePerDay: 400,
    leaderName: 'Venkatesh',
  ),
];

final labourGroupsProvider = Provider<List<LabourGroup>>((ref) {
  return mockLabourGroups;
});

// StateNotifier for managing the registration of a new labour group
class RegisterLabourGroupNotifier extends StateNotifier<LabourGroup> {
  RegisterLabourGroupNotifier() : super(LabourGroup.empty());

  void updateName(String name, String leaderName) {
    state = state.copyWith(name: name, leaderName: leaderName);
  }

  void updateMembers(int count) {
    state = state.copyWith(memberCount: count);
  }

  void updateWorkDescription(String desc, double wage) {
    state = state.copyWith(workDescription: desc, wagePerDay: wage);
  }

  void updateLocation(String loc) {
    state = state.copyWith(location: loc);
  }

  void updateContact(String phone) {
    state = state.copyWith(phone: phone);
  }

  void completeRegistration() {
    // In a real app, you would make an API call here.
    // For now, we just assign a fake ID.
    state = state.copyWith(id: DateTime.now().millisecondsSinceEpoch.toString());
  }

  void reset() {
    state = LabourGroup.empty();
  }
}

final registerLabourGroupProvider = StateNotifierProvider<RegisterLabourGroupNotifier, LabourGroup>((ref) {
  return RegisterLabourGroupNotifier();
});
