class SharedLocationData {
  final double latitude;
  final double longitude;
  final String village;
  final String mandal;
  final String district;
  final String state;
  final String fullAddress;

  const SharedLocationData({
    required this.latitude,
    required this.longitude,
    required this.village,
    required this.mandal,
    required this.district,
    required this.state,
    required this.fullAddress,
  });

  factory SharedLocationData.empty() {
    return const SharedLocationData(
      latitude: 0,
      longitude: 0,
      village: '',
      mandal: '',
      district: '',
      state: '',
      fullAddress: 'No location selected',
    );
  }

  SharedLocationData copyWith({
    double? latitude,
    double? longitude,
    String? village,
    String? mandal,
    String? district,
    String? state,
    String? fullAddress,
  }) {
    return SharedLocationData(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      village: village ?? this.village,
      mandal: mandal ?? this.mandal,
      district: district ?? this.district,
      state: state ?? this.state,
      fullAddress: fullAddress ?? this.fullAddress,
    );
  }
}
