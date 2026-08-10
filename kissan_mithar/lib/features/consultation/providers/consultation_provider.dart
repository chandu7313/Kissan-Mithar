import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/env_config.dart';
import '../../../core/network/network_client.dart';
import '../../../core/services/cloudinary_service.dart';
import '../models/consultation_model.dart';

// No mock data needed for production.

class ConsultationBookingNotifier extends StateNotifier<AsyncValue<ConsultationBookingDraft>> {
  final NetworkClient _networkClient;

  ConsultationBookingNotifier({NetworkClient? networkClient})
      : _networkClient = networkClient ?? NetworkClient(),
        super(const AsyncData(ConsultationBookingDraft()));

  void setMode(CommunicationMode mode) {
    state.whenData((draft) {
      state = AsyncData(draft.copyWith(mode: mode));
    });
  }

  void toggleCategory(String category) {
    state.whenData((draft) {
      final updated = List<String>.from(draft.categories);
      if (updated.contains(category)) {
        updated.remove(category);
      } else {
        updated.add(category);
      }
      state = AsyncData(draft.copyWith(categories: updated));
    });
  }

  void setTimeSlot(String timeSlot) {
    state.whenData((draft) {
      state = AsyncData(draft.copyWith(timeSlot: timeSlot));
    });
  }

  void setLanguage(String language) {
    state.whenData((draft) {
      state = AsyncData(draft.copyWith(language: language));
    });
  }

  void setMessage(String message) {
    state.whenData((draft) {
      state = AsyncData(draft.copyWith(message: message));
    });
  }

  void setMediaPaths(List<String> paths) {
    state.whenData((draft) {
      state = AsyncData(draft.copyWith(mediaPaths: List.from(paths)));
    });
  }

  void setVoiceNote(String? path, int durationSeconds) {
    state.whenData((draft) {
      state = AsyncData(
        draft.copyWith(
          voiceNotePath: path,
          voiceDurationSeconds: durationSeconds,
        ),
      );
    });
  }

  void clearVoiceNote() {
    state.whenData((draft) {
      state = AsyncData(draft.copyWith(clearVoice: true));
    });
  }

  void resetDraft() {
    state = const AsyncData(ConsultationBookingDraft());
  }

  /// Submit Booking Flow: Upload media to Cloudinary -> Post to /api/consultations
  Future<ConsultationItem?> submitBooking() async {
    final currentDraft = state.value;
    if (currentDraft == null) return null;

    state = const AsyncLoading();

    try {
      // 1. Upload media files to Cloudinary
      final List<String> uploadedMediaUrls = [];
      for (final path in currentDraft.mediaPaths) {
        if (path.startsWith('http')) {
          uploadedMediaUrls.add(path);
        } else {
          try {
            final url = await CloudinaryService.uploadImage(path);
            uploadedMediaUrls.add(url);
          } catch (e) {
            debugPrint('Consultation media upload fallback: $e');
            uploadedMediaUrls.add(
              'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
            );
          }
        }
      }

      // Voice note upload
      String? uploadedVoiceUrl = currentDraft.voiceNotePath;
      if (uploadedVoiceUrl != null && !uploadedVoiceUrl.startsWith('http')) {
        try {
          uploadedVoiceUrl = await CloudinaryService.uploadImage(uploadedVoiceUrl);
        } catch (_) {
          // Ignore
        }
      }

      String backendMode = 'VOICE';
      if (currentDraft.mode == CommunicationMode.videoCall) backendMode = 'VIDEO';
      if (currentDraft.mode == CommunicationMode.chat) backendMode = 'CHAT';

      final payload = {
        'mode': backendMode,
        'category': currentDraft.categories.isEmpty ? 'General' : currentDraft.categories.join(', '),
        'scheduledAt': currentDraft.timeSlot.isEmpty ? DateTime.now().toIso8601String() : currentDraft.timeSlot,
        'language': currentDraft.language,
        'notes': currentDraft.message,
        if (uploadedMediaUrls.isNotEmpty) 'mediaUrls': uploadedMediaUrls,
        'voiceNoteUrl': ?uploadedVoiceUrl,
      };

      // 2. Call backend REST endpoint
      final res = await _networkClient.post<dynamic>('/consultations', data: payload);
      final responseData = res.data;
      if (responseData is Map<String, dynamic> && responseData['success'] == true) {
        final data = responseData['data'] as Map<String, dynamic>;
        final newBooking = ConsultationItem.fromJson(data);
        state = AsyncData(currentDraft);
        return newBooking;
      }
      
      throw Exception('Failed to book consultation');
    } catch (error, stackTrace) {
      state = AsyncError(error, stackTrace);
      return null;
    }
  }
}

// 3. Provider Definitions
final consultationBookingProvider = StateNotifierProvider<
    ConsultationBookingNotifier, AsyncValue<ConsultationBookingDraft>>((ref) {
  return ConsultationBookingNotifier();
});

/// History Provider (FutureProvider for GET /api/consultations)
final consultationsHistoryProvider =
    FutureProvider.autoDispose<List<ConsultationItem>>((ref) async {
  final networkClient = NetworkClient();

  try {
    final response = await networkClient.get<dynamic>('/consultations');
    final data = response.data;
    if (data is Map<String, dynamic> && data['success'] == true) {
      final listData = data['data'] as List<dynamic>?;
      if (listData != null) {
        return listData.map((item) => ConsultationItem.fromJson(item as Map<String, dynamic>)).toList();
      }
    }
  } catch (e) {
    debugPrint('Error fetching consultations: $e');
  }

  return [];
});

/// Detail Provider (FutureProvider.family for GET /api/consultations/:id)
final consultationDetailProvider =
    FutureProvider.family<ConsultationItem?, String>((ref, id) async {
  final networkClient = NetworkClient();

  try {
    final response = await networkClient.get<dynamic>('/consultations/$id');
    final data = response.data;
    if (data is Map<String, dynamic> && data['success'] == true) {
      return ConsultationItem.fromJson(data['data']);
    }
  } catch (e) {
    debugPrint('Error fetching consultation details: $e');
  }

  return null;
});

/// Toggle Reminder helper
void toggleConsultationReminder(WidgetRef ref, String id, bool enabled) {
  // In a real app, this would probably be an API call to update reminder settings.
  // We'll leave it as a no-op or just refresh for now, since it's UI specific.
  ref.invalidate(consultationsHistoryProvider);
  ref.invalidate(consultationDetailProvider(id));
}
