import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/services/cloudinary_service.dart';
import '../../data/models/fertilizer_request_model.dart';
import '../../data/repositories/fertilizer_guide_repository.dart';

class FertilizerGuideState {
  final List<String> photos;
  final double latitude;
  final double longitude;
  final String address;
  final String? village;
  final String? district;
  final String? stateName;
  final String? cropType;
  final String? cropAge;
  final double? landAcres;
  final String? soilType;
  final String? problemCategory;
  final String voiceText;
  final String? voiceNotePath;
  final bool isSubmitting;
  final bool isSuccess;
  final String? submittedRequestId;
  final String? errorMessage;
  final List<FertilizerRequestModel> myRequests;
  final bool isLoadingHistory;

  const FertilizerGuideState({
    this.photos = const [],
    this.latitude = 16.2272,
    this.longitude = 77.8012,
    this.address = 'Gadwal, Telangana',
    this.village,
    this.district,
    this.stateName,
    this.cropType,
    this.cropAge,
    this.landAcres,
    this.soilType,
    this.problemCategory = 'Fertilizer Advisory',
    this.voiceText = '',
    this.voiceNotePath,
    this.isSubmitting = false,
    this.isSuccess = false,
    this.submittedRequestId,
    this.errorMessage,
    this.myRequests = const [],
    this.isLoadingHistory = false,
  });

  FertilizerGuideState copyWith({
    List<String>? photos,
    double? latitude,
    double? longitude,
    String? address,
    String? village,
    String? district,
    String? stateName,
    String? cropType,
    String? cropAge,
    double? landAcres,
    String? soilType,
    String? problemCategory,
    String? voiceText,
    String? voiceNotePath,
    bool? isSubmitting,
    bool? isSuccess,
    String? submittedRequestId,
    String? errorMessage,
    List<FertilizerRequestModel>? myRequests,
    bool? isLoadingHistory,
  }) {
    return FertilizerGuideState(
      photos: photos ?? this.photos,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      village: village ?? this.village,
      district: district ?? this.district,
      stateName: stateName ?? this.stateName,
      cropType: cropType ?? this.cropType,
      cropAge: cropAge ?? this.cropAge,
      landAcres: landAcres ?? this.landAcres,
      soilType: soilType ?? this.soilType,
      problemCategory: problemCategory ?? this.problemCategory,
      voiceText: voiceText ?? this.voiceText,
      voiceNotePath: voiceNotePath ?? this.voiceNotePath,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isSuccess: isSuccess ?? this.isSuccess,
      submittedRequestId: submittedRequestId ?? this.submittedRequestId,
      errorMessage: errorMessage ?? this.errorMessage,
      myRequests: myRequests ?? this.myRequests,
      isLoadingHistory: isLoadingHistory ?? this.isLoadingHistory,
    );
  }
}

class FertilizerGuideNotifier extends StateNotifier<FertilizerGuideState> {
  final FertilizerGuideRepository _repository;

  FertilizerGuideNotifier(this._repository) : super(const FertilizerGuideState());

  void setPhotos(List<String> photos) {
    state = state.copyWith(photos: photos);
  }

  void setLocation(
    double latitude,
    double longitude,
    String address, {
    String? village,
    String? district,
    String? stateName,
  }) {
    state = state.copyWith(
      latitude: latitude,
      longitude: longitude,
      address: address,
      village: village,
      district: district,
      stateName: stateName,
    );
  }

  void setVoiceQuery(String text, {String? audioPath}) {
    state = state.copyWith(
      voiceText: text,
      voiceNotePath: audioPath,
    );
  }

  void resetForm() {
    state = state.copyWith(
      photos: [],
      voiceText: '',
      voiceNotePath: null,
      isSubmitting: false,
      isSuccess: false,
      submittedRequestId: null,
      errorMessage: null,
    );
  }

  /// Uploads media and submits request to backend API & DB
  Future<FertilizerRequestModel?> submitRequest() async {
    state = state.copyWith(isSubmitting: true, errorMessage: null);

    try {
      // 1. Upload photos to Cloudinary if needed
      List<String> uploadedPhotoUrls = [];
      for (final p in state.photos) {
        if (!p.startsWith('http')) {
          try {
            final url = await CloudinaryService.uploadImage(p);
            uploadedPhotoUrls.add(url);
          } catch (e) {
            debugPrint('[FertilizerGuideProvider] Photo upload fallback: $e');
            uploadedPhotoUrls.add(p);
          }
        } else {
          uploadedPhotoUrls.add(p);
        }
      }

      // 2. Upload voice note directly
      String? uploadedVoiceUrl = state.voiceNotePath;
      if (uploadedVoiceUrl != null && !uploadedVoiceUrl.startsWith('http')) {
        try {
          uploadedVoiceUrl = await CloudinaryService.uploadAudio(uploadedVoiceUrl);
        } catch (e) {
          debugPrint('[FertilizerGuideProvider] Voice upload fallback: $e');
        }
      }

      final issueDesc = state.voiceText.isNotEmpty
          ? state.voiceText
          : (uploadedVoiceUrl != null ? 'Voice note recording attached by farmer' : 'Crop inquiry');

      // 3. Post to backend
      final result = await _repository.submitFertilizerRequest(
        cropType: state.cropType,
        cropAge: state.cropAge,
        landAcres: state.landAcres,
        soilType: state.soilType,
        problemCategory: state.problemCategory,
        issueDescription: issueDesc,
        voiceNoteUrl: uploadedVoiceUrl,
        voiceText: state.voiceText.isNotEmpty ? state.voiceText : (uploadedVoiceUrl != null ? 'Voice note attached' : null),
        photos: uploadedPhotoUrls,
        latitude: state.latitude,
        longitude: state.longitude,
        address: state.address,
        village: state.village,
        district: state.district,
        state: state.stateName,
      );

      state = state.copyWith(
        isSubmitting: false,
        isSuccess: true,
        submittedRequestId: result.id,
      );

      return result;
    } catch (e) {
      debugPrint('[FertilizerGuideProvider] Submit error: $e');
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: e.toString(),
      );
      return null;
    }
  }

  /// Load farmer history
  Future<void> fetchMyRequests() async {
    state = state.copyWith(isLoadingHistory: true);
    try {
      final list = await _repository.getMyFertilizerRequests();
      state = state.copyWith(myRequests: list, isLoadingHistory: false);
    } catch (e) {
      debugPrint('[FertilizerGuideProvider] Fetch history error: $e');
      state = state.copyWith(isLoadingHistory: false);
    }
  }
}

final fertilizerGuideRepositoryProvider = Provider<FertilizerGuideRepository>((ref) {
  return FertilizerGuideRepository();
});

final fertilizerGuideProvider =
    StateNotifierProvider<FertilizerGuideNotifier, FertilizerGuideState>((ref) {
  final repo = ref.watch(fertilizerGuideRepositoryProvider);
  return FertilizerGuideNotifier(repo);
});
