import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../data/providers/crop_buying_selling_provider.dart';

class CropDetailsScreen extends ConsumerWidget {
  final String listingId;

  const CropDetailsScreen({super.key, required this.listingId});

  Future<void> _callPhone(String phone) async {
    final Uri url = Uri.parse('tel:$phone');
    if (!await launchUrl(url)) {
      debugPrint('Could not launch phone dialer');
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listingsAsync = ref.watch(cropListingsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Crop Details'),
      body: listingsAsync.when(
        data: (listings) {
          final listing = listings.firstWhere((l) => l.id == listingId, orElse: () => listings.first);

          return SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Image gallery placeholder
                Container(
                  height: 250,
                  color: Colors.grey.shade300,
                  child: Center(
                    child: Icon(Icons.image, size: 80, color: Colors.grey.shade400),
                  ),
                ),
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            listing.cropName,
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFD67229).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Text(
                              listing.cropStage,
                              style: const TextStyle(color: Color(0xFFD67229), fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          const Icon(Icons.person, color: Colors.grey),
                          const SizedBox(width: 8),
                          Text(listing.farmerName, style: const TextStyle(fontSize: 16)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: Colors.grey),
                          const SizedBox(width: 8),
                          Text(listing.locationName, style: const TextStyle(fontSize: 16, color: Colors.grey)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  color: Colors.white,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Listing Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      _buildDetailRow('Expected Quantity', '${listing.expectedQuantity} ${listing.quantityUnit}'),
                      const Divider(height: 24),
                      _buildDetailRow('Expected Harvest', '${listing.expectedHarvestDate.toLocal()}'.split(' ')[0]),
                      const Divider(height: 24),
                      _buildDetailRow('Land Area', '${listing.landArea} ${listing.landAreaUnit}'),
                      const Divider(height: 24),
                      const Text('Description', style: TextStyle(color: Colors.grey)),
                      const SizedBox(height: 8),
                      Text(listing.description, style: const TextStyle(height: 1.4)),
                    ],
                  ),
                ),
                const SizedBox(height: 100), // Space for bottom button
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(16),
        color: Colors.white,
        child: SafeArea(
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD67229),
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(56),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.call),
            label: const Text('Call Farmer', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            onPressed: () {
              listingsAsync.whenData((listings) {
                final listing = listings.firstWhere((l) => l.id == listingId, orElse: () => listings.first);
                _callPhone(listing.farmerPhone);
              });
            },
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
      ],
    );
  }
}
