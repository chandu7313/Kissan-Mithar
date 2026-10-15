import 'package:flutter/foundation.dart';
import '../../../../core/network/network_client.dart';
import '../models/fertilizer_request_model.dart';

class FertilizerGuideRepository {
  final NetworkClient _networkClient;

  FertilizerGuideRepository({NetworkClient? networkClient})
      : _networkClient = networkClient ?? NetworkClient();

  /// Submit a new fertilizer guide request from farmer
  Future<FertilizerRequestModel> submitFertilizerRequest({
    String? cropType,
    String? cropAge,
    double? landAcres,
    String? soilType,
    String? problemCategory,
    String? issueDescription,
    String? voiceNoteUrl,
    String? voiceText,
    required List<String> photos,
    required double latitude,
    required double longitude,
    String? address,
    String? village,
    String? district,
    String? state,
    String? previousFertilizers,
    String? irrigationType,
    String? notes,
  }) async {
    final payload = {
      if (cropType != null) 'cropType': cropType,
      if (cropAge != null) 'cropAge': cropAge,
      if (landAcres != null) 'landAcres': landAcres,
      if (soilType != null) 'soilType': soilType,
      if (problemCategory != null) 'problemCategory': problemCategory,
      if (issueDescription != null) 'issueDescription': issueDescription,
      if (voiceNoteUrl != null) 'voiceNoteUrl': voiceNoteUrl,
      if (voiceText != null) 'voiceText': voiceText,
      'photos': photos,
      'gps': {
        'latitude': latitude,
        'longitude': longitude,
        if (address != null) 'address': address,
        if (village != null) 'village': village,
        if (district != null) 'district': district,
        if (state != null) 'state': state,
      },
      if (previousFertilizers != null) 'previousFertilizers': previousFertilizers,
      if (irrigationType != null) 'irrigationType': irrigationType,
      if (notes != null) 'notes': notes,
    };

    debugPrint('[FertilizerGuideRepository] Submitting request with ${photos.length} photos');
    final response = await _networkClient.post<dynamic>(
      '/fertilizer-requests',
      data: payload,
    );

    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] != null) {
      return FertilizerRequestModel.fromJson(data['data'] as Map<String, dynamic>);
    }

    throw Exception('Unexpected response format when submitting fertilizer request');
  }

  /// Fetch farmer's own fertilizer guide requests
  Future<List<FertilizerRequestModel>> getMyFertilizerRequests() async {
    final response = await _networkClient.get<dynamic>('/fertilizer-requests/my-requests');
    final data = response.data;

    if (data is Map<String, dynamic> && data['data'] is List) {
      final list = data['data'] as List;
      return list
          .map((item) => FertilizerRequestModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    return [];
  }

  /// Fetch a single fertilizer request with its expert diagnosis and plan
  Future<FertilizerRequestModel> getFertilizerRequestById(String id) async {
    final response = await _networkClient.get<dynamic>('/fertilizer-requests/$id');
    final data = response.data;

    if (data is Map<String, dynamic> && data['data'] != null) {
      return FertilizerRequestModel.fromJson(data['data'] as Map<String, dynamic>);
    }

    throw Exception('Failed to load fertilizer request $id');
  }

  /// Fetch agronomy standard catalog for a crop
  Future<List<Map<String, dynamic>>> getFertilizerCatalog({String? crop}) async {
    final response = await _networkClient.get<dynamic>(
      '/fertilizer-requests/catalog',
      queryParameters: crop != null ? {'crop': crop} : null,
    );
    final data = response.data;

    if (data is Map<String, dynamic> && data['data'] is List) {
      return (data['data'] as List).cast<Map<String, dynamic>>();
    }

    return [];
  }
}
