import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/models/crop_buying_selling_models.dart';

final cropBuyingSellingProvider = Provider((ref) => CropBuyingSellingMockService());

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

class CropBuyingSellingMockService {
  final List<CropModel> _crops = [
    CropModel(id: 'c1', name: 'Cotton', imageUrl: 'assets/images/cotton.png', category: 'Cash Crop'),
    CropModel(id: 'c2', name: 'Paddy', imageUrl: 'assets/images/paddy.png', category: 'Cereal'),
    CropModel(id: 'c3', name: 'Maize', imageUrl: 'assets/images/maize.png', category: 'Cereal'),
    CropModel(id: 'c4', name: 'Chilli', imageUrl: 'assets/images/chilli.png', category: 'Spices'),
  ];

  final List<CropListing> _listings = [
    CropListing(
      id: 'l1',
      farmerId: 'f1',
      farmerName: 'Ramesh Reddy',
      cropId: 'c1',
      cropName: 'Cotton',
      cropImageUrl: 'assets/images/cotton.png',
      locationId: 'loc1',
      locationName: 'Warangal, Telangana',
      landArea: 5,
      landAreaUnit: 'Acres',
      expectedHarvestDate: DateTime.now().add(const Duration(days: 45)),
      expectedQuantity: 50,
      quantityUnit: 'Quintal',
      cropStage: 'Fruiting',
      photoUrls: [],
      description: 'Healthy cotton crop, high quality.',
      status: 'Active',
      farmerPhone: '+919876543210',
    ),
  ];

  final List<BuyerRequirement> _requirements = [
    BuyerRequirement(
      id: 'r1',
      buyerId: 'b1',
      buyerName: 'Suresh',
      companyName: 'ABC Textiles',
      companyType: 'Processor',
      cropId: 'c1',
      cropName: 'Cotton',
      cropImageUrl: 'assets/images/cotton.png',
      requiredQuantity: 200,
      quantityUnit: 'Quintal',
      locationId: 'loc2',
      locationName: 'Khammam, Telangana',
      description: 'Looking for premium grade cotton for processing.',
      status: 'Active',
      buyerPhone: '+919876543211',
    ),
  ];

  Future<List<CropListing>> getCropListings() async {
    await Future.delayed(const Duration(seconds: 1));
    return _listings;
  }

  Future<List<BuyerRequirement>> getBuyerRequirements() async {
    await Future.delayed(const Duration(seconds: 1));
    return _requirements;
  }

  Future<List<CropListing>> getMyCropListings() async {
    await Future.delayed(const Duration(seconds: 1));
    return _listings; // Simulate current user listings
  }

  Future<List<BuyerRequirement>> getMyBuyerRequirements() async {
    await Future.delayed(const Duration(seconds: 1));
    return []; 
  }

  Future<List<CropModel>> getCropCatalog() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _crops;
  }
}
