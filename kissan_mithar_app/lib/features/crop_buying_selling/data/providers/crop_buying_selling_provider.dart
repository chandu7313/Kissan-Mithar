import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/network_client.dart';
import '../../domain/models/crop_buying_selling_models.dart';

final cropBuyingSellingProvider = Provider((ref) => CropBuyingSellingService());

final cropListingsProvider = FutureProvider<List<CropListing>>((ref) async {
  final service = ref.watch(cropBuyingSellingProvider);
  return service.getCropListings();
});

final buyerRequirementsProvider = FutureProvider<List<BuyerRequirement>>((ref) async {
  final service = ref.watch(cropBuyingSellingProvider);
  return service.getBuyerRequirements();
});

final myCropListingsProvider = FutureProvider<List<CropListing>>((ref) async {
  final service = ref.watch(cropBuyingSellingProvider);
  return service.getMyCropListings();
});

final myBuyerRequirementsProvider = FutureProvider<List<BuyerRequirement>>((ref) async {
  final service = ref.watch(cropBuyingSellingProvider);
  return service.getMyBuyerRequirements();
});

final cropCatalogProvider = FutureProvider<List<CropModel>>((ref) async {
  final service = ref.watch(cropBuyingSellingProvider);
  return service.getCropCatalog();
});

class CropBuyingSellingService {
  final NetworkClient _client = NetworkClient();

  // In-memory cache / fallback store for offline & instant responsiveness
  final List<CropListing> _localListings = [
    CropListing(
      id: 'l1',
      farmerId: 'f1',
      farmerName: 'Verified Supplier',
      productName: 'Cotton',
      variety: 'Bt Cotton Long Staple',
      minQuantity: 50,
      maxQuantity: 200,
      quantityUnit: 'Quintal',
      price: 7200,
      priceUnit: 'per Quintal',
      locationName: 'Warangal, Telangana',
      district: 'Warangal',
      state: 'Telangana',
      photoUrls: [],
      description: 'Well-maintained, sun-dried first picking cotton.',
      status: 'Active',
    ),
    CropListing(
      id: 'l2',
      farmerId: 'f2',
      farmerName: 'Verified Supplier',
      productName: 'Lemon',
      variety: 'Kagzi Lime',
      minQuantity: 500,
      maxQuantity: 1000,
      quantityUnit: 'kg',
      price: 40,
      priceUnit: 'per kg',
      locationName: 'Nalgonda, Telangana',
      district: 'Nalgonda',
      state: 'Telangana',
      photoUrls: [],
      description: 'Juicy, farm-fresh mature lemons ready for harvest.',
      status: 'Active',
    ),
    CropListing(
      id: 'l3',
      farmerId: 'f3',
      farmerName: 'Verified Supplier',
      productName: 'Chilli',
      variety: 'Teja Hot',
      minQuantity: 20,
      maxQuantity: 80,
      quantityUnit: 'Quintal',
      price: 18500,
      priceUnit: 'per Quintal',
      locationName: 'Khammam, Telangana',
      district: 'Khammam',
      state: 'Telangana',
      photoUrls: [],
      description: 'Bright red, high pungency export grade chilli.',
      status: 'Active',
    ),
  ];

  final List<BuyerRequirement> _localRequirements = [
    BuyerRequirement(
      id: 'r1',
      buyerId: 'b1',
      buyerName: 'Customer Request',
      productName: 'Lemon',
      variety: 'Kagzi Lime',
      requiredQuantity: 1,
      quantityUnit: 'tonne',
      expectedPrice: 38000,
      priceUnit: 'per tonne',
      locationName: 'Hyderabad Central Market',
      district: 'Hyderabad',
      state: 'Telangana',
      status: 'Sourcing in Progress',
      adminNotes: 'Contacting certified citrus growers in Nalgonda.',
    ),
    BuyerRequirement(
      id: 'r2',
      buyerId: 'b2',
      buyerName: 'Customer Request',
      productName: 'Cotton',
      variety: 'Medium to Long Staple',
      requiredQuantity: 150,
      quantityUnit: 'Quintal',
      expectedPrice: 7100,
      priceUnit: 'per Quintal',
      locationName: 'Adilabad Depot',
      district: 'Adilabad',
      state: 'Telangana',
      status: 'Supplier Identified',
      adminNotes: 'Identified 2 candidate growers; scheduling quality inspection.',
    ),
  ];

  final List<CropModel> _crops = [
    CropModel(id: 'c1', name: 'Cotton', imageUrl: 'assets/images/cotton.png', category: 'Cash Crop'),
    CropModel(id: 'c2', name: 'Lemon', imageUrl: 'assets/images/orchard_planning.png', category: 'Fruits'),
    CropModel(id: 'c3', name: 'Paddy', imageUrl: 'assets/images/paddy.png', category: 'Cereal'),
    CropModel(id: 'c4', name: 'Chilli', imageUrl: 'assets/images/chilli.png', category: 'Spices'),
    CropModel(id: 'c5', name: 'Maize', imageUrl: 'assets/images/maize.png', category: 'Cereal'),
  ];

  Future<List<CropListing>> getCropListings() async {
    try {
      final response = await _client.get('/agri-bazaar/listings');
      if (response.statusCode == 200 && response.data != null) {
        final list = (response.data['data'] as List?)
            ?.map((item) => CropListing.fromJson(item as Map<String, dynamic>))
            .toList();
        if (list != null && list.isNotEmpty) {
          return list;
        }
      }
    } catch (_) {
      // Offline / fallback to local state
    }
    return _localListings;
  }

  Future<List<BuyerRequirement>> getBuyerRequirements() async {
    try {
      final response = await _client.get('/agri-bazaar/requests');
      if (response.statusCode == 200 && response.data != null) {
        final list = (response.data['data'] as List?)
            ?.map((item) => BuyerRequirement.fromJson(item as Map<String, dynamic>))
            .toList();
        if (list != null && list.isNotEmpty) {
          return list;
        }
      }
    } catch (_) {
      // Offline fallback
    }
    return _localRequirements;
  }

  Future<List<CropListing>> getMyCropListings() async {
    return _localListings;
  }

  Future<List<BuyerRequirement>> getMyBuyerRequirements() async {
    return _localRequirements;
  }

  Future<List<CropModel>> getCropCatalog() async {
    return _crops;
  }

  /// Register a new seller product listing
  Future<bool> createCropListing(Map<String, dynamic> data) async {
    try {
      final response = await _client.post('/agri-bazaar/listings', data: data);
      if (response.statusCode == 200 || response.statusCode == 201) {
        if (response.data != null && response.data['data'] != null) {
          _localListings.insert(0, CropListing.fromJson(response.data['data'] as Map<String, dynamic>));
        }
        return true;
      }
    } catch (_) {
      // If offline or network issue, insert into local listings for instant user feedback
      final newListing = CropListing(
        id: 'local_${DateTime.now().millisecondsSinceEpoch}',
        farmerId: 'my_farmer_id',
        farmerName: 'My Listing',
        productName: data['productName'] as String?,
        variety: data['variety'] as String?,
        minQuantity: data['minQuantity'] != null ? (data['minQuantity'] as num).toDouble() : null,
        maxQuantity: data['maxQuantity'] != null ? (data['maxQuantity'] as num).toDouble() : null,
        quantityUnit: data['quantityUnit'] as String? ?? 'kg',
        price: data['price'] != null ? (data['price'] as num).toDouble() : null,
        priceUnit: data['priceUnit'] as String?,
        locationName: data['locationName'] as String? ?? 'Registered Location',
        village: data['village'] as String?,
        mandal: data['mandal'] as String?,
        district: data['district'] as String?,
        state: data['state'] as String?,
        pincode: data['pincode'] as String?,
        description: data['notes'] as String?,
        status: 'Active',
      );
      _localListings.insert(0, newListing);
      return true;
    }
    return false;
  }

  /// Submit a buyer product request
  Future<bool> createBuyerRequirement(Map<String, dynamic> data) async {
    try {
      final response = await _client.post('/agri-bazaar/requests', data: data);
      if (response.statusCode == 200 || response.statusCode == 201) {
        if (response.data != null && response.data['data'] != null) {
          _localRequirements.insert(0, BuyerRequirement.fromJson(response.data['data'] as Map<String, dynamic>));
        }
        return true;
      }
    } catch (_) {
      // Local fallback
      final newReq = BuyerRequirement(
        id: 'local_${DateTime.now().millisecondsSinceEpoch}',
        buyerId: 'my_buyer_id',
        buyerName: 'My Request',
        productName: data['productName'] as String? ?? 'Produce',
        variety: data['variety'] as String?,
        requiredQuantity: (data['requiredQuantity'] as num).toDouble(),
        quantityUnit: data['quantityUnit'] as String? ?? 'kg',
        expectedPrice: data['expectedPrice'] != null ? (data['expectedPrice'] as num).toDouble() : null,
        priceUnit: data['priceUnit'] as String?,
        locationName: data['locationName'] as String? ?? 'Delivery Location',
        village: data['village'] as String?,
        mandal: data['mandal'] as String?,
        district: data['district'] as String?,
        state: data['state'] as String?,
        pincode: data['pincode'] as String?,
        status: 'Request Submitted',
      );
      _localRequirements.insert(0, newReq);
      return true;
    }
    return false;
  }
}
