import 'package:flutter/foundation.dart';
import '../../../../core/network/network_client.dart';
import '../models/disease_request_model.dart';

class DiseaseHelpRepository {
  final NetworkClient _networkClient;

  DiseaseHelpRepository({NetworkClient? networkClient})
      : _networkClient = networkClient ?? NetworkClient();

  /// Submit a new crop disease inquiry from farmer
  Future<DiseaseRequestModel> submitDiseaseRequest({
    String? cropType,
    String? cropAge,
    String? affectedPart,
    String? symptomDescription,
    String? voiceNoteUrl,
    String? voiceText,
    required List<String> photos,
    double? latitude,
    double? longitude,
    String? address,
    String? spreadRate,
    String? previousPesticides,
    String? notes,
  }) async {
    final payload = {
      if (cropType != null) 'cropType': cropType,
      if (cropAge != null) 'cropAge': cropAge,
      if (affectedPart != null) 'affectedPart': affectedPart,
      if (symptomDescription != null) 'symptomDescription': symptomDescription,
      if (voiceNoteUrl != null) 'voiceNoteUrl': voiceNoteUrl,
      if (voiceText != null) 'voiceText': voiceText,
      'photos': photos,
      if (latitude != null && longitude != null)
        'gps': {
          'latitude': latitude,
          'longitude': longitude,
          if (address != null) 'address': address,
        },
      if (spreadRate != null) 'spreadRate': spreadRate,
      if (previousPesticides != null) 'previousPesticides': previousPesticides,
      if (notes != null) 'notes': notes,
    };

    debugPrint('[DiseaseHelpRepository] Submitting inquiry with ${photos.length} photos');
    final response = await _networkClient.post<dynamic>(
      '/disease-requests',
      data: payload,
    );

    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] != null) {
      return DiseaseRequestModel.fromJson(data['data'] as Map<String, dynamic>);
    }

    throw Exception('Unexpected response format when submitting disease inquiry');
  }

  /// Fetch farmer's submitted disease inquiries
  Future<List<DiseaseRequestModel>> getMyDiseaseRequests() async {
    final response = await _networkClient.get<dynamic>('/disease-requests/my-requests');
    final data = response.data;

    if (data is Map<String, dynamic> && data['data'] is List) {
      final list = data['data'] as List;
      return list
          .map((item) => DiseaseRequestModel.fromJson(item as Map<String, dynamic>))
          .toList();
    }

    return [];
  }

  /// Get single disease inquiry with expert prescription
  Future<DiseaseRequestModel> getDiseaseRequestById(String id) async {
    final response = await _networkClient.get<dynamic>('/disease-requests/$id');
    final data = response.data;

    if (data is Map<String, dynamic> && data['data'] != null) {
      return DiseaseRequestModel.fromJson(data['data'] as Map<String, dynamic>);
    }

    throw Exception('Failed to load disease inquiry $id');
  }

  /// Fetch Plant Pathology Catalog
  Future<List<Map<String, dynamic>>> getDiseaseCatalog({String? crop}) async {
    final response = await _networkClient.get<dynamic>(
      '/disease-requests/catalog',
      queryParameters: crop != null ? {'crop': crop} : null,
    );
    final data = response.data;

    if (data is Map<String, dynamic> && data['data'] is List) {
      return (data['data'] as List).cast<Map<String, dynamic>>();
    }

    return [];
  }
}
