class LabourGroup {
  final String id;
  final String name;
  final int memberCount;
  final String workDescription;
  final String location;
  final String phone;
  final double rating;
  final double wagePerDay;
  final String leaderName;

  const LabourGroup({
    required this.id,
    required this.name,
    required this.memberCount,
    required this.workDescription,
    required this.location,
    required this.phone,
    required this.rating,
    required this.wagePerDay,
    required this.leaderName,
  });

  LabourGroup copyWith({
    String? id,
    String? name,
    int? memberCount,
    String? workDescription,
    String? location,
    String? phone,
    double? rating,
    double? wagePerDay,
    String? leaderName,
  }) {
    return LabourGroup(
      id: id ?? this.id,
      name: name ?? this.name,
      memberCount: memberCount ?? this.memberCount,
      workDescription: workDescription ?? this.workDescription,
      location: location ?? this.location,
      phone: phone ?? this.phone,
      rating: rating ?? this.rating,
      wagePerDay: wagePerDay ?? this.wagePerDay,
      leaderName: leaderName ?? this.leaderName,
    );
  }

  factory LabourGroup.empty() {
    return const LabourGroup(
      id: '',
      name: '',
      memberCount: 0,
      workDescription: '',
      location: '',
      phone: '',
      rating: 0.0,
      wagePerDay: 0.0,
      leaderName: '',
    );
  }
}
