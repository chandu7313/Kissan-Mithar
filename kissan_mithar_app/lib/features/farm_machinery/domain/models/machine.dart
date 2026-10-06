import '../../../../shared/location/models/location_data.dart';

enum ProviderType { individualOwner, serviceProvider }

class MachineryProviderProfile {
  final String id;
  final String name;
  final String phone;
  final String photoUrl;
  final ProviderType type;
  final SharedLocationData location;

  const MachineryProviderProfile({
    required this.id,
    required this.name,
    required this.phone,
    required this.photoUrl,
    required this.type,
    required this.location,
  });
}

class Machine {
  final String id;
  final MachineryProviderProfile provider;
  final String typeId;
  final String typeName;
  final String brand;
  final String model;
  final String year;
  final String photoUrl;
  final bool operatorIncluded;
  final String description;
  final SharedLocationData location;
  final bool isActive;

  const Machine({
    required this.id,
    required this.provider,
    required this.typeId,
    required this.typeName,
    required this.brand,
    required this.model,
    required this.year,
    required this.photoUrl,
    required this.operatorIncluded,
    required this.description,
    required this.location,
    this.isActive = true,
  });
}
