class CropModel {
  final String id;
  final String name;
  final String? category;
  final String imageUrl;
  final bool isActive;

  CropModel({
    required this.id,
    required this.name,
    this.category,
    required this.imageUrl,
    this.isActive = true,
  });
}

class CropListing {
  final String id;
  final String farmerId;
  final String farmerName;
  final String cropId;
  final String cropName;
  final String cropImageUrl;
  final String locationId;
  final String locationName;
  final double landArea;
  final String landAreaUnit;
  final DateTime expectedHarvestDate;
  final double expectedQuantity;
  final String quantityUnit;
  final String cropStage;
  final List<String> photoUrls;
  final String description;
  final String status; // Active, Inactive
  final String farmerPhone;

  CropListing({
    required this.id,
    required this.farmerId,
    required this.farmerName,
    required this.cropId,
    required this.cropName,
    required this.cropImageUrl,
    required this.locationId,
    required this.locationName,
    required this.landArea,
    required this.landAreaUnit,
    required this.expectedHarvestDate,
    required this.expectedQuantity,
    required this.quantityUnit,
    required this.cropStage,
    required this.photoUrls,
    required this.description,
    required this.status,
    required this.farmerPhone,
  });
}

class BuyerRequirement {
  final String id;
  final String buyerId;
  final String buyerName;
  final String companyName;
  final String companyType;
  final String cropId;
  final String cropName;
  final String cropImageUrl;
  final double requiredQuantity;
  final String quantityUnit;
  final String locationId;
  final String locationName;
  final String description;
  final String status;
  final String buyerPhone;

  BuyerRequirement({
    required this.id,
    required this.buyerId,
    required this.buyerName,
    required this.companyName,
    required this.companyType,
    required this.cropId,
    required this.cropName,
    required this.cropImageUrl,
    required this.requiredQuantity,
    required this.quantityUnit,
    required this.locationId,
    required this.locationName,
    required this.description,
    required this.status,
    required this.buyerPhone,
  });
}

class BuyerProfile {
  final String id;
  final String userId;
  final String companyName;
  final String? logoUrl;
  final String contactPerson;
  final String phone;
  final String? email;
  final String companyType;
  final String locationId;
  final String locationName;
  final String description;

  BuyerProfile({
    required this.id,
    required this.userId,
    required this.companyName,
    this.logoUrl,
    required this.contactPerson,
    required this.phone,
    this.email,
    required this.companyType,
    required this.locationId,
    required this.locationName,
    required this.description,
  });
}

class CropConnection {
  final String id;
  final String? cropListingId;
  final String? buyerRequirementId;
  final String initiatedBy; // 'FARMER' or 'BUYER'
  final String status; // 'Connection Made', 'Closed'
  final DateTime createdAt;
  
  // Helper data for display (in real app we might fetch this via relations)
  final String cropName;
  final String otherPartyName;
  final String otherPartyType; // 'Buyer' or 'Farmer'
  final String otherPartyPhone;

  CropConnection({
    required this.id,
    this.cropListingId,
    this.buyerRequirementId,
    required this.initiatedBy,
    required this.status,
    required this.createdAt,
    required this.cropName,
    required this.otherPartyName,
    required this.otherPartyType,
    required this.otherPartyPhone,
  });
}
