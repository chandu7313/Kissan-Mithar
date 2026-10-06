import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../shared/widgets/farmer_app_bar.dart';
import '../../../shared/widgets/large_button.dart';
import '../providers/location_provider.dart';
import '../models/location_data.dart';

class LocationSelectorScreen extends ConsumerStatefulWidget {
  final String nextRoute;
  final String title;

  const LocationSelectorScreen({
    super.key,
    required this.nextRoute,
    this.title = 'Select Location',
  });

  @override
  ConsumerState<LocationSelectorScreen> createState() => _LocationSelectorScreenState();
}

class _LocationSelectorScreenState extends ConsumerState<LocationSelectorScreen> {
  GoogleMapController? _mapController;
  LatLng _selectedLatLng = const LatLng(16.2272, 77.8012); // Gadwal default
  String _address = 'Gadwal, Telangana';
  bool _isLoading = false;

  void _handleCurrentLocation() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(sharedLocationProvider.notifier).detectCurrentLocation();
      final loc = ref.read(sharedLocationProvider);
      
      setState(() {
        _selectedLatLng = LatLng(loc.latitude, loc.longitude);
        _address = loc.fullAddress;
      });

      _mapController?.animateCamera(
        CameraUpdate.newLatLngZoom(_selectedLatLng, 15.0),
      );

      // Immediately navigate if current location successful
      if (mounted) {
        context.push(widget.nextRoute);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _confirmManualLocation() {
    ref.read(sharedLocationProvider.notifier).setLocation(SharedLocationData(
      latitude: _selectedLatLng.latitude,
      longitude: _selectedLatLng.longitude,
      village: 'Selected Area', // Fake geocode
      mandal: 'Unknown',
      district: 'Unknown',
      state: 'Unknown',
      fullAddress: _address,
    ));
    context.push(widget.nextRoute);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: FarmerAppBar(title: widget.title),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _isLoading ? null : _handleCurrentLocation,
                      icon: _isLoading 
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.my_location, color: Color(0xFF1B6327)),
                      label: const Text(
                        'Use Current Location',
                        style: TextStyle(color: Color(0xFF1B6327), fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: Color(0xFF1B6327), width: 2),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Text(
                'Or change location on map:',
                style: TextStyle(fontWeight: FontWeight.bold, color: Colors.black54),
              ),
            ),
            
            Expanded(
              child: Stack(
                children: [
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: GoogleMap(
                        initialCameraPosition: CameraPosition(target: _selectedLatLng, zoom: 12.0),
                        onMapCreated: (controller) => _mapController = controller,
                        onTap: (LatLng location) {
                          setState(() {
                            _selectedLatLng = location;
                            _address = 'Selected Location (${location.latitude.toStringAsFixed(2)}, ${location.longitude.toStringAsFixed(2)})';
                          });
                        },
                        markers: {
                          Marker(markerId: const MarkerId('selected'), position: _selectedLatLng),
                        },
                      ),
                    ),
                  ),
                  
                  Positioned(
                    top: 16,
                    left: 32,
                    right: 32,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8, offset: const Offset(0, 2))],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.location_on, color: Color(0xFF1B6327)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _address,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            Container(
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -4))],
              ),
              child: LargeButton(
                label: 'Confirm Location',
                onPressed: _confirmManualLocation,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
