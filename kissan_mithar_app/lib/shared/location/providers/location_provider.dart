import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:geolocator/geolocator.dart';
import '../models/location_data.dart';

class SharedLocationNotifier extends StateNotifier<SharedLocationData> {
  SharedLocationNotifier() : super(SharedLocationData.empty());

  Future<void> setLocation(SharedLocationData location) async {
    state = location;
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('kissan_saved_farm_location', jsonEncode({
        'lat': location.latitude,
        'lng': location.longitude,
        'name': location.fullAddress.isNotEmpty ? location.fullAddress : location.village,
      }));
    } catch (e) {
      // Ignore
    }
  }

  Future<void> detectCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) throw Exception('Location services are disabled.');

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        throw Exception('Location permissions are permanently denied');
      }

      Position position = await Geolocator.getCurrentPosition();
      
      // In a real app, use geocoding to get village, mandal, district
      final newLoc = SharedLocationData(
        latitude: position.latitude,
        longitude: position.longitude,
        village: 'Gadwal', // Simulated reverse geocode
        mandal: 'Gadwal Mandal',
        district: 'Jogulamba Gadwal',
        state: 'Telangana',
        fullAddress: 'Gadwal, Telangana',
      );
      state = newLoc;
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('kissan_saved_farm_location', jsonEncode({
          'lat': newLoc.latitude,
          'lng': newLoc.longitude,
          'name': newLoc.fullAddress,
        }));
      } catch (_) {}
    } catch (e) {
      rethrow;
    }
  }
}

final sharedLocationProvider = StateNotifierProvider<SharedLocationNotifier, SharedLocationData>((ref) {
  return SharedLocationNotifier();
});
