import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/services/cloudinary_service.dart';
import '../../data/models/disease_request_model.dart';
import '../../data/repositories/disease_help_repository.dart';

class DiseaseHelpState {
  final List<String> photos;
  final String cropType;
  final String cropAge;
  final String affectedPart;
  final String spreadRate;
  final String symptomDescription;
  final String? voiceNotePath;
  final double? latitude;
  final double? longitude;
  final String? address;
  final bool isSubmitting;
  final bool isSuccess;
  final String? submittedRequestId;
  final String? errorMessage;
  final List<DiseaseRequestModel> myRequests;
  final bool isLoadingHistory;

  const DiseaseHelpState({
    this.photos = const [],
    this.cropType = 'Chilli',
    this.cropAge = 'Flowering Stage',
    this.affectedPart = 'Leaves',
    this.spreadRate = 'Spreading fast (2-3 days)',
    this.symptomDescription = '',
    this.voiceNotePath,
    this.latitude = 16.2272,
    this.longitude = 77.8012,
    this.address = 'Gadwal, Telangana',
    this.isSubmitting = false,
    this.isSuccess = false,
    this.submittedRequestId,
    this.errorMessage,
    this.myRequests = const [],
    this.isLoadingHistory = false,
  });

  DiseaseHelpState copyWith({
    List<String>? photos,
    String? cropType,
    String? cropAge,
    String? affectedPart,
    String? spreadRate,
    String? symptomDescription,
    String? voiceNotePath,
    double? latitude,
    double? longitude,
    String? address,
    bool? isSubmitting,
    bool? isSuccess,
    String? submittedRequestId,
    String? errorMessage,
    List<DiseaseRequestModel>? myRequests,
    bool? isLoadingHistory,
  }) {
    return DiseaseHelpState(
      photos: photos ?? this.photos,
      cropType: cropType ?? this.cropType,
      cropAge: cropAge ?? this.cropAge,
      affectedPart: affectedPart ?? this.affectedPart,
      spreadRate: spreadRate ?? this.spreadRate,
      symptomDescription: symptomDescription ?? this.symptomDescription,
      voiceNotePath: voiceNotePath ?? this.voiceNotePath,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      isSuccess: isSuccess ?? this.isSuccess,
      submittedRequestId: submittedRequestId ?? this.submittedRequestId,
      errorMessage: errorMessage ?? this.errorMessage,
      myRequests: myRequests ?? this.myRequests,
      isLoadingHistory: isLoadingHistory ?? this.isLoadingHistory,
    );
  }
}

class DiseaseHelpNotifier extends StateNotifier<DiseaseHelpState> {
  final DiseaseHelpRepository _repository;

  DiseaseHelpNotifier(this._repository) : super(const DiseaseHelpState());

  void setPhotos(List<String> photos) {
    state = state.copyWith(photos: photos);
  }

  void setCropDetails({
    String? cropType,
    String? cropAge,
    String? affectedPart,
    String? spreadRate,
  }) {
    state = state.copyWith(
      cropType: cropType,
      cropAge: cropAge,
      affectedPart: affectedPart,
      spreadRate: spreadRate,
    );
  }

  void setVoiceQuery(String text, {String? audioPath}) {
    state = state.copyWith(
      symptomDescription: text,
      voiceNotePath: audioPath,
    );
  }

  void resetForm() {
    state = state.copyWith(
      photos: [],
      symptomDescription: '',
      voiceNotePath: null,
      isSubmitting: false,
      isSuccess: false,
      submittedRequestId: null,
      errorMessage: null,
    );
  }

  /// Uploads media and submits disease inquiry to backend API & DB
  Future<DiseaseRequestModel?> submitRequest() async {
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
            debugPrint('[DiseaseHelpProvider] Photo upload fallback: $e');
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
          debugPrint('[DiseaseHelpProvider] Voice upload fallback: $e');
        }
      }

      final symptoms = state.symptomDescription.isNotEmpty
          ? state.symptomDescription
          : (uploadedVoiceUrl != null ? 'Voice note recording attached by farmer' : 'Disease symptoms inquiry');

      // 3. Post to backend
      final result = await _repository.submitDiseaseRequest(
        cropType: state.cropType,
        cropAge: state.cropAge,
        affectedPart: state.affectedPart,
        symptomDescription: symptoms,
        voiceNoteUrl: uploadedVoiceUrl,
        voiceText: state.symptomDescription.isNotEmpty ? state.symptomDescription : (uploadedVoiceUrl != null ? 'Voice note attached' : null),
        photos: uploadedPhotoUrls,
        latitude: state.latitude,
        longitude: state.longitude,
        address: state.address,
        spreadRate: state.spreadRate,
      );

      state = state.copyWith(
        isSubmitting: false,
        isSuccess: true,
        submittedRequestId: result.id,
      );

      return result;
    } catch (e) {
      debugPrint('[DiseaseHelpProvider] Submit error: $e');
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: e.toString(),
      );
      return null;
    }
  }

  /// Load farmer disease inquiry history
  Future<void> fetchMyRequests() async {
    state = state.copyWith(isLoadingHistory: true);
    try {
      final list = await _repository.getMyDiseaseRequests();
      state = state.copyWith(myRequests: list, isLoadingHistory: false);
    } catch (e) {
      debugPrint('[DiseaseHelpProvider] Fetch history error: $e');
      state = state.copyWith(isLoadingHistory: false);
    }
  }
}

final diseaseHelpRepositoryProvider = Provider<DiseaseHelpRepository>((ref) {
  return DiseaseHelpRepository();
});

final diseaseHelpProvider =
    StateNotifierProvider<DiseaseHelpNotifier, DiseaseHelpState>((ref) {
  final repo = ref.watch(diseaseHelpRepositoryProvider);
  return DiseaseHelpNotifier(repo);
});
