class FarmerProfile {
  final String id;
  final String name;
  final String phoneNumber;
  final String? photoUrl;
  final String village;
  final String district;
  final String stateName;
  final double landAcres;
  final String primaryCrop;
  final String languageCode;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const FarmerProfile({
    required this.id,
    required this.name,
    required this.phoneNumber,
    this.photoUrl,
    required this.village,
    required this.district,
    required this.stateName,
    required this.landAcres,
    required this.primaryCrop,
    this.languageCode = 'en',
    this.createdAt,
    this.updatedAt,
  });

  factory FarmerProfile.initialMock() {
    return FarmerProfile(
      id: 'FARMER-9821',
      name: 'Ramesh Patel',
      phoneNumber: '+91 98765 43210',
      photoUrl: null,
      village: 'Khed',
      district: 'Pune',
      stateName: 'Maharashtra',
      landAcres: 0.0,
      primaryCrop: '',
      languageCode: 'en',
      createdAt: DateTime.now().subtract(const Duration(days: 90)),
      updatedAt: DateTime.now(),
    );
  }

  factory FarmerProfile.fromJson(Map<String, dynamic> json) {
    return FarmerProfile(
      id: json['id']?.toString() ?? 'FARMER-DEFAULT',
      name: json['name']?.toString() ?? 'Farmer',
      phoneNumber: json['phone_number']?.toString() ?? json['phone']?.toString() ?? '',
      photoUrl: json['photo_url']?.toString() ?? json['avatar_url']?.toString(),
      village: json['village']?.toString() ?? '',
      district: json['district']?.toString() ?? '',
      stateName: json['state']?.toString() ?? json['state_name']?.toString() ?? '',
      landAcres: (json['land_acres'] as num?)?.toDouble() ??
          (json['land_size'] as num?)?.toDouble() ??
          0.0,
      primaryCrop: json['primary_crop']?.toString() ?? '',
      languageCode: json['language_code']?.toString() ?? json['language']?.toString() ?? 'en',
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString())
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone_number': phoneNumber,
      'photo_url': photoUrl,
      'village': village,
      'district': district,
      'state': stateName,
      'land_acres': landAcres,
      'primary_crop': primaryCrop,
      'language_code': languageCode,
      'updated_at': DateTime.now().toIso8601String(),
    };
  }

  FarmerProfile copyWith({
    String? id,
    String? name,
    String? phoneNumber,
    String? photoUrl,
    String? village,
    String? district,
    String? stateName,
    double? landAcres,
    String? primaryCrop,
    String? languageCode,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return FarmerProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      photoUrl: photoUrl ?? this.photoUrl,
      village: village ?? this.village,
      district: district ?? this.district,
      stateName: stateName ?? this.stateName,
      landAcres: landAcres ?? this.landAcres,
      primaryCrop: primaryCrop ?? this.primaryCrop,
      languageCode: languageCode ?? this.languageCode,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
