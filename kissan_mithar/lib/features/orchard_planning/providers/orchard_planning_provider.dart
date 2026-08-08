import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/config/env_config.dart';
import '../../../core/network/network_client.dart';
import '../../../core/services/cloudinary_service.dart';
import '../../../core/services/offline_sync_service.dart';

class OrchardDraftState {
  final int currentStep; // 0: Photos, 1: Location, 2: Land Details

  // Step 1: Photos
  final String? frontPhoto;
  final String? leftPhoto;
  final String? rightPhoto;
  final String? centerPhoto;
  final List<String> galleryPhotos;

  // Step 2: Location
  final double latitude;
  final double longitude;
  final String village;
  final String district;
  final String stateName;
  final bool isLocating;

  // Step 3: Land Details
  final String landSize; // '<1 Acre', '1-3 Acres', '3-5 Acres', 'Above 5 Acres'
  final List<String> waterSources; // 'Borewell', 'Canal', 'Drip', 'Rain'
  final String soilType; // 'Red Soil', 'Black Soil', 'Sandy Soil'
  final List<String> existingCrops; // 'Cotton', 'Soybean', 'Paddy', 'Sugarcane', 'Vegetables', 'None / Fallow'
  final bool hasElectricity;
  final bool hasDripIrrigation;
  final double budget; // ₹20,000 to ₹1,00,000+
  final List<String> preferredOrchards; // 'Mango (Kesar Variety)', 'Guava (Taiwan Pink)', etc.
  final bool needExpertSuggestion;
  final String expectedGoal; // 'Higher Profit', 'Less Water', 'Export Quality', 'Organic Farming', 'Long-Term Income'
  final String? voiceNotePath;
  final int voiceDurationSeconds;
  final bool isRecordingVoice;
  final bool isPlayingVoice;

  // Submission & Tracker
  final bool isSubmitting;
  final bool submissionSuccess;
  final String requestId;
  final int currentStage; // 0: Submitted, 1: Under Review, 2: Expert Assigned, 3: Plan Ready, 4: Completed
  final String submittedDate;
  final String? errorMessage;
  final Map<String, dynamic>? planReport;

  const OrchardDraftState({
    this.currentStep = 0,
    this.frontPhoto,
    this.leftPhoto,
    this.rightPhoto,
    this.centerPhoto,
    this.galleryPhotos = const [],
    this.latitude = 18.6725,
    this.longitude = 78.0944,
    this.village = 'Rampur',
    this.district = 'Nizamabad',
    this.stateName = 'Telangana',
    this.isLocating = false,
    this.landSize = '1-3 Acres',
    this.waterSources = const ['Borewell', 'Canal'],
    this.soilType = 'Red Soil (Lal Mitti)',
    this.existingCrops = const ['Cotton', 'Soybean'],
    this.hasElectricity = true,
    this.hasDripIrrigation = false,
    this.budget = 45000.0,
    this.preferredOrchards = const ['Mango (Kesar Variety)'],
    this.needExpertSuggestion = false,
    this.expectedGoal = 'Higher Profit',
    this.voiceNotePath,
    this.voiceDurationSeconds = 0,
    this.isRecordingVoice = false,
    this.isPlayingVoice = false,
    this.isSubmitting = false,
    this.submissionSuccess = false,
    this.requestId = 'KM-2023-8841',
    this.currentStage = 1, // Under Review default for demo
    this.submittedDate = '24 Oct 2023',
    this.errorMessage,
    this.planReport,
  });

  String get formattedAddress => 'Village: $village\nDistrict: $district\nState: $stateName';

  int get capturedPhotosCount {
    int count = 0;
    if (frontPhoto != null) count++;
    if (leftPhoto != null) count++;
    if (rightPhoto != null) count++;
    if (centerPhoto != null) count++;
    count += galleryPhotos.length;
    return count;
  }

  bool get isStep1Valid => capturedPhotosCount > 0;
  bool get isStep2Valid => village.isNotEmpty && district.isNotEmpty;
  bool get isStep3Valid => landSize.isNotEmpty && soilType.isNotEmpty;

  OrchardDraftState copyWith({
    int? currentStep,
    String? frontPhoto,
    String? leftPhoto,
    String? rightPhoto,
    String? centerPhoto,
    List<String>? galleryPhotos,
    double? latitude,
    double? longitude,
    String? village,
    String? district,
    String? stateName,
    bool? isLocating,
    String? landSize,
    List<String>? waterSources,
    String? soilType,
    List<String>? existingCrops,
    bool? hasElectricity,
    bool? hasDripIrrigation,
    double? budget,
    List<String>? preferredOrchards,
    bool? needExpertSuggestion,
    String? expectedGoal,
    String? voiceNotePath,
    int? voiceDurationSeconds,
    bool? isRecordingVoice,
    bool? isPlayingVoice,
    bool? isSubmitting,
    bool? submissionSuccess,
    String? requestId,
    int? currentStage,
    String? submittedDate,
    String? errorMessage,
    Map<String, dynamic>? planReport,
    bool clearVoiceNote = false,
  }) {
    return OrchardDraftState(
      currentStep: currentStep ?? this.currentStep,
      frontPhoto: frontPhoto ?? this.frontPhoto,
      leftPhoto: leftPhoto ?? this.leftPhoto,
      rightPhoto: rightPhoto ?? this.rightPhoto,
      centerPhoto: centerPhoto ?? this.centerPhoto,
      galleryPhotos: galleryPhotos ?? this.galleryPhotos,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      village: village ?? this.village,
      district: district ?? this.district,
      stateName: stateName ?? this.stateName,
      isLocating: isLocating ?? this.isLocating,
      landSize: landSize ?? this.landSize,
      waterSources: waterSources ?? this.waterSources,
      soilType: soilType ?? this.soilType,
      existingCrops: existingCrops ?? this.existingCrops,
      hasElectricity: hasElectricity ?? this.hasElectricity,
      hasDripIrrigation: hasDripIrrigation ?? this.hasDripIrrigation,
      budget: budget ?? this.budget,
      preferredOrchards: preferredOrchards ?? this.preferredOrchards,
      needExpertSuggestion: needExpertSuggestion ?? this.needExpertSuggestion,
      expectedGoal: expectedGoal ?? this.expectedGoal,
      voiceNotePath: clearVoiceNote ? null : (voiceNotePath ?? this.voiceNotePath),
      voiceDurationSeconds: clearVoiceNote ? 0 : (voiceDurationSeconds ?? this.voiceDurationSeconds),
      isRecordingVoice: isRecordingVoice ?? this.isRecordingVoice,
      isPlayingVoice: isPlayingVoice ?? this.isPlayingVoice,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      submissionSuccess: submissionSuccess ?? this.submissionSuccess,
      requestId: requestId ?? this.requestId,
      currentStage: currentStage ?? this.currentStage,
      submittedDate: submittedDate ?? this.submittedDate,
      errorMessage: errorMessage ?? this.errorMessage,
      planReport: planReport ?? this.planReport,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'currentStep': currentStep,
      'frontPhoto': frontPhoto,
      'leftPhoto': leftPhoto,
      'rightPhoto': rightPhoto,
      'centerPhoto': centerPhoto,
      'galleryPhotos': galleryPhotos,
      'latitude': latitude,
      'longitude': longitude,
      'village': village,
      'district': district,
      'stateName': stateName,
      'landSize': landSize,
      'waterSources': waterSources,
      'soilType': soilType,
      'existingCrops': existingCrops,
      'hasElectricity': hasElectricity,
      'hasDripIrrigation': hasDripIrrigation,
      'budget': budget,
      'preferredOrchards': preferredOrchards,
      'needExpertSuggestion': needExpertSuggestion,
      'expectedGoal': expectedGoal,
      'voiceNotePath': voiceNotePath,
      'voiceDurationSeconds': voiceDurationSeconds,
      'requestId': requestId,
      'currentStage': currentStage,
      'submittedDate': submittedDate,
    };
  }

  factory OrchardDraftState.fromJson(Map<String, dynamic> json) {
    return OrchardDraftState(
      currentStep: json['currentStep'] ?? 0,
      frontPhoto: json['frontPhoto'],
      leftPhoto: json['leftPhoto'],
      rightPhoto: json['rightPhoto'],
      centerPhoto: json['centerPhoto'],
      galleryPhotos: List<String>.from(json['galleryPhotos'] ?? []),
      latitude: (json['latitude'] as num?)?.toDouble() ?? 18.6725,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 78.0944,
      village: json['village'] ?? 'Rampur',
      district: json['district'] ?? 'Nizamabad',
      stateName: json['stateName'] ?? 'Telangana',
      landSize: json['landSize'] ?? '1-3 Acres',
      waterSources: List<String>.from(json['waterSources'] ?? ['Borewell', 'Canal']),
      soilType: json['soilType'] ?? 'Red Soil (Lal Mitti)',
      existingCrops: List<String>.from(json['existingCrops'] ?? ['Cotton', 'Soybean']),
      hasElectricity: json['hasElectricity'] ?? true,
      hasDripIrrigation: json['hasDripIrrigation'] ?? false,
      budget: (json['budget'] as num?)?.toDouble() ?? 45000.0,
      preferredOrchards: List<String>.from(json['preferredOrchards'] ?? ['Mango (Kesar Variety)']),
      needExpertSuggestion: json['needExpertSuggestion'] ?? false,
      expectedGoal: json['expectedGoal'] ?? 'Higher Profit',
      voiceNotePath: json['voiceNotePath'],
      voiceDurationSeconds: json['voiceDurationSeconds'] ?? 0,
      requestId: json['requestId'] ?? 'KM-2023-8841',
      currentStage: json['currentStage'] ?? 1,
      submittedDate: json['submittedDate'] ?? '24 Oct 2023',
    );
  }
}

class OrchardPlanningNotifier extends StateNotifier<OrchardDraftState> {
  final NetworkClient _networkClient;
  static const String _storageKey = 'kissan_mithar_orchard_draft_v1';

  OrchardPlanningNotifier({NetworkClient? networkClient})
      : _networkClient = networkClient ?? NetworkClient(),
        super(const OrchardDraftState()) {
    loadDraftFromStorage();
  }

  // --- Step Navigation ---
  void setStep(int step) {
    if (step >= 0 && step <= 2) {
      state = state.copyWith(currentStep: step);
      saveDraftToStorage();
    }
  }

  void nextStep() {
    if (state.currentStep < 2) {
      state = state.copyWith(currentStep: state.currentStep + 1);
      saveDraftToStorage();
    }
  }

  void prevStep() {
    if (state.currentStep > 0) {
      state = state.copyWith(currentStep: state.currentStep - 1);
      saveDraftToStorage();
    }
  }

  // --- Step 1: Photos ---
  void setPhoto(String angle, String path) {
    switch (angle.toLowerCase()) {
      case 'front':
        state = state.copyWith(frontPhoto: path);
        break;
      case 'left':
        state = state.copyWith(leftPhoto: path);
        break;
      case 'right':
        state = state.copyWith(rightPhoto: path);
        break;
      case 'center':
        state = state.copyWith(centerPhoto: path);
        break;
    }
    saveDraftToStorage();
  }

  void clearPhoto(String angle) {
    switch (angle.toLowerCase()) {
      case 'front':
        state = state.copyWith(frontPhoto: '');
        break;
      case 'left':
        state = state.copyWith(leftPhoto: '');
        break;
      case 'right':
        state = state.copyWith(rightPhoto: '');
        break;
      case 'center':
        state = state.copyWith(centerPhoto: '');
        break;
    }
    saveDraftToStorage();
  }

  void addGalleryPhoto(String path) {
    final updated = List<String>.from(state.galleryPhotos)..add(path);
    state = state.copyWith(galleryPhotos: updated);
    saveDraftToStorage();
  }

  // --- Step 2: Location ---
  Future<void> autoDetectLocation() async {
    state = state.copyWith(isLocating: true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      Position? position;
      if (permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always) {
        position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 5),
        );
      }

      final lat = position?.latitude ?? 18.6725;
      final lng = position?.longitude ?? 78.0944;

      // Reverse geocoding simulated for local reliability
      String detectedVillage = 'Rampur';
      String detectedDistrict = 'Nizamabad';
      String detectedState = 'Telangana';

      if (lat > 19.0) {
        detectedVillage = 'Khed';
        detectedDistrict = 'Pune';
        detectedState = 'Maharashtra';
      } else if (lat < 16.0) {
        detectedVillage = 'Gubbi';
        detectedDistrict = 'Tumakuru';
        detectedState = 'Karnataka';
      }

      state = state.copyWith(
        latitude: lat,
        longitude: lng,
        village: detectedVillage,
        district: detectedDistrict,
        stateName: detectedState,
        isLocating: false,
      );
      saveDraftToStorage();
    } catch (e) {
      // Fallback cleanly
      state = state.copyWith(
        latitude: 18.6725,
        longitude: 78.0944,
        village: 'Rampur',
        district: 'Nizamabad',
        stateName: 'Telangana',
        isLocating: false,
      );
    }
  }

  void setLocationDetails({
    required double lat,
    required double lng,
    String? village,
    String? district,
    String? stateName,
  }) {
    state = state.copyWith(
      latitude: lat,
      longitude: lng,
      village: village ?? state.village,
      district: district ?? state.district,
      stateName: stateName ?? state.stateName,
    );
    saveDraftToStorage();
  }

  // --- Step 3: Land Details ---
  void setLandSize(String size) {
    state = state.copyWith(landSize: size);
    saveDraftToStorage();
  }

  void toggleWaterSource(String source) {
    final current = List<String>.from(state.waterSources);
    if (current.contains(source)) {
      if (current.length > 1) {
        current.remove(source);
      }
    } else {
      current.add(source);
    }
    state = state.copyWith(waterSources: current);
    saveDraftToStorage();
  }

  void setSoilType(String soil) {
    state = state.copyWith(soilType: soil);
    saveDraftToStorage();
  }

  void toggleExistingCrop(String crop) {
    final current = List<String>.from(state.existingCrops);
    if (crop == 'None / Fallow') {
      state = state.copyWith(existingCrops: ['None / Fallow']);
    } else {
      current.remove('None / Fallow');
      if (current.contains(crop)) {
        current.remove(crop);
      } else {
        current.add(crop);
      }
      state = state.copyWith(existingCrops: current.isEmpty ? ['None / Fallow'] : current);
    }
    saveDraftToStorage();
  }

  void setElectricity(bool value) {
    state = state.copyWith(hasElectricity: value);
    saveDraftToStorage();
  }

  void setDripIrrigation(bool value) {
    state = state.copyWith(hasDripIrrigation: value);
    saveDraftToStorage();
  }

  void setBudget(double budget) {
    state = state.copyWith(budget: budget);
    saveDraftToStorage();
  }

  void togglePreferredOrchard(String orchard) {
    final current = List<String>.from(state.preferredOrchards);
    if (current.contains(orchard)) {
      current.remove(orchard);
    } else {
      current.add(orchard);
    }
    state = state.copyWith(
      preferredOrchards: current,
      needExpertSuggestion: false,
    );
    saveDraftToStorage();
  }

  void toggleExpertSuggestion() {
    final currentSuggestion = !state.needExpertSuggestion;
    state = state.copyWith(
      needExpertSuggestion: currentSuggestion,
      preferredOrchards: currentSuggestion ? [] : ['Mango (Kesar Variety)'],
    );
    saveDraftToStorage();
  }

  void setExpectedGoal(String goal) {
    state = state.copyWith(expectedGoal: goal);
    saveDraftToStorage();
  }

  void setVoiceNote(String path, int durationSeconds) {
    state = state.copyWith(
      voiceNotePath: path,
      voiceDurationSeconds: durationSeconds,
      isRecordingVoice: false,
    );
    saveDraftToStorage();
  }

  void setRecordingVoice(bool recording) {
    state = state.copyWith(isRecordingVoice: recording);
  }

  void setPlayingVoice(bool playing) {
    state = state.copyWith(isPlayingVoice: playing);
  }

  void clearVoiceNote() {
    state = state.copyWith(clearVoiceNote: true);
    saveDraftToStorage();
  }

  // --- Submission Pipeline ---
  Future<bool> submitOrchardPlan() async {
    state = state.copyWith(isSubmitting: true, errorMessage: null);

    try {
      // 1. Upload photos to Cloudinary if available
      String? frontUrl = state.frontPhoto;
      String? leftUrl = state.leftPhoto;
      String? rightUrl = state.rightPhoto;
      String? centerUrl = state.centerPhoto;

      try {
        if (frontUrl != null && frontUrl.isNotEmpty && !frontUrl.startsWith('http')) {
          frontUrl = await CloudinaryService.uploadImage(frontUrl);
        }
        if (leftUrl != null && leftUrl.isNotEmpty && !leftUrl.startsWith('http')) {
          leftUrl = await CloudinaryService.uploadImage(leftUrl);
        }
        if (rightUrl != null && rightUrl.isNotEmpty && !rightUrl.startsWith('http')) {
          rightUrl = await CloudinaryService.uploadImage(rightUrl);
        }
        if (centerUrl != null && centerUrl.isNotEmpty && !centerUrl.startsWith('http')) {
          centerUrl = await CloudinaryService.uploadImage(centerUrl);
        }
      } catch (uploadError) {
        debugPrint('Image upload note: $uploadError');
      }

      final generatedId = 'KM-2023-${(1000 + (DateTime.now().millisecond * 7) % 9000).toInt()}';
      final now = DateTime.now();
      final dateStr = '${now.day} ${_monthName(now.month)} ${now.year}';

      final payload = {
        'request_id': generatedId,
        'photos': {
          'front': frontUrl ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
          'left': leftUrl ?? 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854',
          'right': rightUrl ?? 'https://images.unsplash.com/photo-1464226184884-fa280b87c399',
          'center': centerUrl ?? 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a07',
          'gallery': state.galleryPhotos,
        },
        'location': {
          'latitude': state.latitude,
          'longitude': state.longitude,
          'village': state.village,
          'district': state.district,
          'state': state.stateName,
        },
        'land_details': {
          'land_size': state.landSize,
          'soil_type': state.soilType,
          'water_sources': state.waterSources,
          'existing_crops': state.existingCrops,
          'has_electricity': state.hasElectricity,
          'has_drip_irrigation': state.hasDripIrrigation,
          'budget': state.budget,
          'preferred_orchards': state.needExpertSuggestion ? ['Expert Suggestion'] : state.preferredOrchards,
          'expected_goal': state.expectedGoal,
        },
        'status': 'submitted',
        'created_at': now.toIso8601String(),
      };

      // 2. Insert to Supabase if configured
      final supabase = EnvConfig.supabaseClient;
      if (supabase != null) {
        try {
          await supabase.from('orchard_requests').insert(payload);
          debugPrint('Orchard request synced to Supabase: $generatedId');
        } catch (supabaseError) {
          debugPrint('Supabase insert note (table may need creation): $supabaseError');
        }
      }

      // 3. Fallback network client call with offline queue fallback
      try {
        final res = await _networkClient.post('/api/orchard-requests', data: payload);
        if (res.statusCode != 200 && res.statusCode != 201) {
          await OfflineSyncService().enqueueRequest(
            requestId: generatedId,
            payload: payload,
          );
        }
      } catch (_) {
        // Enqueue to offline sync engine for automatic background upload
        await OfflineSyncService().enqueueRequest(
          requestId: generatedId,
          payload: payload,
        );
      }

      state = state.copyWith(
        isSubmitting: false,
        submissionSuccess: true,
        requestId: generatedId,
        currentStage: 0, // Submitted
        submittedDate: dateStr,
      );

      saveDraftToStorage();
      return true;
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: 'Unable to submit plan. Please try again.',
      );
      return false;
    }
  }

  void advanceStage() {
    if (state.currentStage < 4) {
      state = state.copyWith(currentStage: state.currentStage + 1);
      saveDraftToStorage();
    }
  }

  void setStage(int stage) {
    if (stage >= 0 && stage <= 4) {
      state = state.copyWith(currentStage: stage);
      saveDraftToStorage();
    }
  }

  static String _monthName(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[(month - 1).clamp(0, 11)];
  }

  // --- Persistence ---
  Future<void> saveDraftToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = jsonEncode(state.toJson());
      await prefs.setString(_storageKey, jsonString);
    } catch (e) {
      debugPrint('Failed to save orchard draft: $e');
    }
  }

  Future<void> loadDraftFromStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = prefs.getString(_storageKey);
      if (jsonString != null && jsonString.isNotEmpty) {
        final Map<String, dynamic> jsonMap = jsonDecode(jsonString);
        state = OrchardDraftState.fromJson(jsonMap);
      }
    } catch (e) {
      debugPrint('Failed to load orchard draft: $e');
    }
  }
}

final orchardPlanningProvider =
    StateNotifierProvider<OrchardPlanningNotifier, OrchardDraftState>((ref) {
  return OrchardPlanningNotifier();
});
