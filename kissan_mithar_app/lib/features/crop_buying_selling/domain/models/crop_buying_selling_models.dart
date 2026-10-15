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

/// Seller Product Listing in Agri Bazaar
class CropListing {
  final String id;
  final String farmerId;
  final String farmerName;
  final String? productName;
  final String? variety;
  final double? minQuantity;
  final double? maxQuantity;
  final String quantityUnit;
  final double? price;
  final String? priceUnit;
  final String locationType; // 'CURRENT' or 'MANUAL'
  final String locationName;
  final String? village;
  final String? mandal;
  final String? district;
  final String? state;
  final String? pincode;
  final double? latitude;
  final double? longitude;
  final List<String> photoUrls;
  final String? description;
  final String status; // 'Active', 'In Negotiation', 'Procured', 'Inactive'
  final String? farmerPhone; // Only present for admin

  // Backward compatibility fields
  final String cropId;
  final String cropImageUrl;
  final String locationId;
  final double landArea;
  final String landAreaUnit;
  final DateTime expectedHarvestDate;
  final String cropStage;

  CropListing({
    required this.id,
    required this.farmerId,
    this.farmerName = 'Verified Supplier',
    this.productName,
    this.variety,
    this.minQuantity,
    this.maxQuantity,
    this.quantityUnit = 'kg',
    this.price,
    this.priceUnit,
    this.locationType = 'MANUAL',
    required this.locationName,
    this.village,
    this.mandal,
    this.district,
    this.state,
    this.pincode,
    this.latitude,
    this.longitude,
    this.photoUrls = const [],
    this.description,
    this.status = 'Active',
    this.farmerPhone,
    this.cropId = '',
    this.cropImageUrl = 'assets/images/crop_buying_selling.png',
    this.locationId = '',
    this.landArea = 0,
    this.landAreaUnit = 'Acres',
    DateTime? expectedHarvestDate,
    this.cropStage = 'Ready for Harvest',
    double? expectedQuantity,
  })  : expectedHarvestDate = expectedHarvestDate ?? DateTime.now(),
        _expectedQuantity = expectedQuantity;

  final double? _expectedQuantity;

  // Backward compatibility getter
  String get cropName => productName ?? 'Agricultural Produce';
  double get expectedQuantity => _expectedQuantity ?? maxQuantity ?? minQuantity ?? 0.0;

  String get quantityDisplay {
    if (minQuantity != null && maxQuantity != null) {
      return '${minQuantity!.toStringAsFixed(minQuantity! % 1 == 0 ? 0 : 1)} - ${maxQuantity!.toStringAsFixed(maxQuantity! % 1 == 0 ? 0 : 1)} $quantityUnit';
    } else if (minQuantity != null) {
      return 'Min ${minQuantity!.toStringAsFixed(minQuantity! % 1 == 0 ? 0 : 1)} $quantityUnit';
    } else if (maxQuantity != null) {
      return 'Up to ${maxQuantity!.toStringAsFixed(maxQuantity! % 1 == 0 ? 0 : 1)} $quantityUnit';
    }
    return 'Quantity on request';
  }

  String get priceDisplay {
    if (price != null && price! > 0) {
      final unit = priceUnit != null && priceUnit!.isNotEmpty ? ' $priceUnit' : '';
      return '₹${price!.toStringAsFixed(price! % 1 == 0 ? 0 : 2)}$unit';
    }
    return 'Price on inquiry';
  }

  factory CropListing.fromJson(Map<String, dynamic> json) {
    return CropListing(
      id: json['id']?.toString() ?? '',
      farmerId: json['sellerId']?.toString() ?? json['farmerId']?.toString() ?? '',
      farmerName: json['seller']?['name']?.toString() ?? json['farmerName']?.toString() ?? 'Verified Supplier',
      productName: json['productName']?.toString(),
      variety: json['variety']?.toString(),
      minQuantity: json['minQuantity'] != null ? (json['minQuantity'] as num).toDouble() : null,
      maxQuantity: json['maxQuantity'] != null ? (json['maxQuantity'] as num).toDouble() : null,
      quantityUnit: json['quantityUnit']?.toString() ?? 'kg',
      price: json['price'] != null ? (json['price'] as num).toDouble() : null,
      priceUnit: json['priceUnit']?.toString(),
      locationType: json['locationType']?.toString() ?? 'MANUAL',
      locationName: json['locationName']?.toString() ?? json['village']?.toString() ?? 'Local Region',
      village: json['village']?.toString(),
      mandal: json['mandal']?.toString(),
      district: json['district']?.toString(),
      state: json['state']?.toString(),
      pincode: json['pincode']?.toString(),
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      photoUrls: json['photos'] != null ? List<String>.from(json['photos']) : [],
      description: json['notes']?.toString() ?? json['description']?.toString(),
      status: json['status']?.toString() ?? 'Active',
      farmerPhone: json['seller']?['phoneNumber']?.toString(),
    );
  }
}

/// Buyer Product Request in Agri Bazaar
class BuyerRequirement {
  final String id;
  final String buyerId;
  final String buyerName;
  final String productName;
  final String? variety;
  final double requiredQuantity;
  final String quantityUnit;
  final double? expectedPrice;
  final String? priceUnit;
  final String locationType;
  final String locationName;
  final String? village;
  final String? mandal;
  final String? district;
  final String? state;
  final String? pincode;
  final double? latitude;
  final double? longitude;
  final List<String> photoUrls;
  final String status;
  final String? adminNotes;
  final double? verifiedQuantity;
  final String? verifiedQuality;
  final double? procurementCost;
  final double? finalQuotePrice;
  final DateTime createdAt;

  // Backward compatibility fields
  final String companyName;
  final String companyType;
  final String cropId;
  final String cropImageUrl;
  final String locationId;
  final String description;
  final String? buyerPhone;

  BuyerRequirement({
    required this.id,
    required this.buyerId,
    this.buyerName = 'Customer',
    required this.productName,
    this.variety,
    required this.requiredQuantity,
    required this.quantityUnit,
    this.expectedPrice,
    this.priceUnit,
    this.locationType = 'MANUAL',
    required this.locationName,
    this.village,
    this.mandal,
    this.district,
    this.state,
    this.pincode,
    this.latitude,
    this.longitude,
    this.photoUrls = const [],
    this.status = 'Request Submitted',
    this.adminNotes,
    this.verifiedQuantity,
    this.verifiedQuality,
    this.procurementCost,
    this.finalQuotePrice,
    DateTime? createdAt,
    this.companyName = 'Kissan Mithar Customer',
    this.companyType = 'Buyer',
    this.cropId = '',
    this.cropImageUrl = 'assets/images/crop_buying_selling.png',
    this.locationId = '',
    this.description = '',
    this.buyerPhone,
  }) : createdAt = createdAt ?? DateTime.now();

  // Backward compatibility getter
  String get cropName => productName;

  String get statusDisplay {
    switch (status) {
      case 'SUBMITTED':
      case 'Request Submitted':
        return 'Request Submitted';
      case 'UNDER_REVIEW':
      case 'Under Review':
        return 'Under Review';
      case 'SOURCING_IN_PROGRESS':
      case 'Sourcing in Progress':
        return 'Sourcing in Progress';
      case 'SUPPLIER_IDENTIFIED':
      case 'Supplier Identified':
        return 'Supplier Identified';
      case 'VERIFICATION_IN_PROGRESS':
      case 'Verification in Progress':
        return 'Verification in Progress';
      case 'PROCUREMENT_IN_PROGRESS':
      case 'Procurement in Progress':
        return 'Procurement in Progress';
      case 'DELIVERY_IN_PROGRESS':
      case 'Delivery in Progress':
        return 'Delivery in Progress';
      case 'DELIVERED':
      case 'Delivered':
        return 'Delivered';
      case 'CANCELLED':
      case 'Cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  factory BuyerRequirement.fromJson(Map<String, dynamic> json) {
    return BuyerRequirement(
      id: json['id']?.toString() ?? '',
      buyerId: json['buyerId']?.toString() ?? '',
      buyerName: json['buyer']?['name']?.toString() ?? 'Customer',
      productName: json['productName']?.toString() ?? json['cropName']?.toString() ?? 'Produce',
      variety: json['variety']?.toString(),
      requiredQuantity: json['requiredQuantity'] != null
          ? (json['requiredQuantity'] as num).toDouble()
          : 0.0,
      quantityUnit: json['quantityUnit']?.toString() ?? 'kg',
      expectedPrice: json['expectedPrice'] != null ? (json['expectedPrice'] as num).toDouble() : null,
      priceUnit: json['priceUnit']?.toString(),
      locationType: json['locationType']?.toString() ?? 'MANUAL',
      locationName: json['locationName']?.toString() ?? json['village']?.toString() ?? 'Delivery Location',
      village: json['village']?.toString(),
      mandal: json['mandal']?.toString(),
      district: json['district']?.toString(),
      state: json['state']?.toString(),
      pincode: json['pincode']?.toString(),
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
      photoUrls: json['photos'] != null ? List<String>.from(json['photos']) : [],
      status: json['status']?.toString() ?? 'SUBMITTED',
      adminNotes: json['adminNotes']?.toString(),
      verifiedQuantity: json['verifiedQuantity'] != null ? (json['verifiedQuantity'] as num).toDouble() : null,
      verifiedQuality: json['verifiedQuality']?.toString(),
      procurementCost: json['procurementCost'] != null ? (json['procurementCost'] as num).toDouble() : null,
      finalQuotePrice: json['finalQuotePrice'] != null ? (json['finalQuotePrice'] as num).toDouble() : null,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      buyerPhone: json['buyer']?['phoneNumber']?.toString(),
    );
  }
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
  final String initiatedBy;
  final String status;
  final DateTime createdAt;
  final String cropName;
  final String otherPartyName;
  final String otherPartyType;
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
