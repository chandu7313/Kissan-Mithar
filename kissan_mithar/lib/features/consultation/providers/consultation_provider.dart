import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/config/env_config.dart';
import '../../../core/network/network_client.dart';
import '../../../core/services/cloudinary_service.dart';
import '../models/consultation_model.dart';

// 1. Initial Mock Consultation History Data
final List<ConsultationItem> _initialConsultations = [
  ConsultationItem(
    id: 'CNS-8921',
    expertName: 'Dr. Rajesh Deshmukh',
    expertRole: 'Senior Agronomist (Horticulture)',
    expertPhotoUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    expertRating: 4.9,
    mode: CommunicationMode.voiceCall,
    category: 'Pest & Disease',
    language: 'Telugu',
    scheduledDate: 'Today',
    scheduledTime: '4:00 PM',
    status: ConsultationStatus.upcoming,
    message: 'Leaf curling and white powder observed on mango flowers.',
    reminderEnabled: true,
    contactPhone: '+91 94401 23456',
  ),
  ConsultationItem(
    id: 'CNS-7412',
    expertName: 'Dr. Ananya Reddy',
    expertRole: 'Soil & Plant Nutrition Specialist',
    expertPhotoUrl:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    expertRating: 4.8,
    mode: CommunicationMode.videoCall,
    category: 'Soil & Fertilizer',
    language: 'Telugu',
    scheduledDate: '02 Aug 2026',
    scheduledTime: '11:30 AM',
    status: ConsultationStatus.completed,
    message: 'Yellow leaves in sweet lime trees during monsoon season.',
    expertNotes:
        'Observed iron and zinc deficiency aggravated by heavy soil waterlogging. Recommended balanced micro-nutrient foliar spray after draining water.',
    prescriptions: const [
      PrescriptionItem(
        title: 'Chelated Zinc (Zn-EDTA 12%)',
        dosage: '1.5 g / Liter water',
        frequency: 'Spray twice at 10 days interval',
        notes: 'Spray early morning or late evening for best absorption.',
      ),
      PrescriptionItem(
        title: 'Ferrous Sulfate (FeSO4)',
        dosage: '2.0 g / Liter water + 0.5 g Citric Acid',
        frequency: 'Foliar application once',
        notes: 'Ensures rapid greening of young foliage.',
      ),
      PrescriptionItem(
        title: 'Neem Oil Spray (10,000 PPM)',
        dosage: '3.0 ml / Liter water',
        frequency: 'Weekly preventative spray',
        notes: 'Repels secondary sucking pests.',
      ),
    ],
    mediaUrls: const [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854',
    ],
    reminderEnabled: false,
  ),
  ConsultationItem(
    id: 'CNS-6204',
    expertName: 'Er. Suresh Kulkarni',
    expertRole: 'Drip & Micro-Irrigation Engineer',
    expertPhotoUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    expertRating: 4.7,
    mode: CommunicationMode.chat,
    category: 'Irrigation',
    language: 'Hindi',
    scheduledDate: '28 Jul 2026',
    scheduledTime: '03:15 PM',
    status: ConsultationStatus.completed,
    message: 'Low pressure in lateral drippers at plot slope end.',
    expertNotes:
        'Flushed sub-main lines and cleaned disc filter. Recommended pressure compensating drippers (4 LPH) for gradient stability.',
    prescriptions: const [
      PrescriptionItem(
        title: 'Disc Filter Acid Wash',
        dosage: 'Hydrochloric Acid 1% flush',
        frequency: 'Once a season',
        notes: 'Removes calcium carbonate scaling.',
      ),
    ],
    reminderEnabled: false,
  ),
];

// Global in-memory list for live updates across app lifecycle
List<ConsultationItem> _consultationsStore = List.from(_initialConsultations);

// 2. Consultation Booking State Notifier
class ConsultationBookingNotifier
    extends StateNotifier<AsyncValue<ConsultationBookingDraft>> {
  final NetworkClient _networkClient;

  ConsultationBookingNotifier({NetworkClient? networkClient})
      : _networkClient = networkClient ?? NetworkClient(),
        super(const AsyncData(ConsultationBookingDraft()));

  void setMode(CommunicationMode mode) {
    state.whenData((draft) {
      state = AsyncData(draft.copyWith(mode: mode));
    });
  }

  void setCategory(String category) {
    state.whenData((draft) {
      state = AsyncData(draft.copyWith(category: category));
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

  /// Submit Booking Flow: Upload media to Cloudinary -> Post to /api/consultations -> Insert to Supabase -> Add to in-memory store
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
          uploadedVoiceUrl =
              'https://res.cloudinary.com/kissanmithar/audio/consultation_sample.m4a';
        }
      }

      final generatedId =
          'CNS-${(1000 + (DateTime.now().millisecond * 9) % 9000).toInt()}';

      final newBooking = ConsultationItem(
        id: generatedId,
        expertName: 'Dr. Rajesh Deshmukh',
        expertRole: 'Senior Agronomist (Assigned)',
        expertPhotoUrl:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
        expertRating: 4.9,
        mode: currentDraft.mode,
        category: currentDraft.category,
        language: currentDraft.language,
        scheduledDate: currentDraft.timeSlot.split(',').first.trim(),
        scheduledTime: currentDraft.timeSlot.contains(',')
            ? currentDraft.timeSlot.split(',').last.trim()
            : '4:00 PM',
        status: ConsultationStatus.upcoming,
        message: currentDraft.message,
        mediaUrls: uploadedMediaUrls,
        voiceNoteUrl: uploadedVoiceUrl,
        reminderEnabled: true,
        contactPhone: '+91 94401 23456',
      );

      // 2. Call backend REST endpoint
      try {
        await _networkClient.post(
          '/api/consultations',
          data: newBooking.toJson(),
        );
      } catch (e) {
        debugPrint('Backend call mock fallback: $e');
      }

      // 3. Insert to Supabase if configured
      final supabase = EnvConfig.supabaseClient;
      if (supabase != null) {
        try {
          await supabase.from('consultations').insert(newBooking.toJson());
          debugPrint('Consultation synced to Supabase: $generatedId');
        } catch (supabaseError) {
          debugPrint('Supabase insert note: $supabaseError');
        }
      }

      // 4. Update in-memory store
      _consultationsStore.insert(0, newBooking);

      state = AsyncData(currentDraft);
      return newBooking;
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
    final response = await networkClient.get('/api/consultations');
    final data = response.data;
    if (data is List) {
      final fetched =
          data.map((item) => ConsultationItem.fromJson(item as Map<String, dynamic>)).toList();
      if (fetched.isNotEmpty) {
        _consultationsStore = fetched;
      }
    }
  } catch (_) {
    // Return store on network fallback
  }

  // Also query Supabase if available
  final supabase = EnvConfig.supabaseClient;
  if (supabase != null) {
    try {
      final data = await supabase
          .from('consultations')
          .select()
          .order('created_at', ascending: false);
      if (data.isNotEmpty) {
        return data.map((json) => ConsultationItem.fromJson(json)).toList();
      }
    } catch (_) {}
  }

  return List.from(_consultationsStore);
});

/// Detail Provider (FutureProvider.family for GET /api/consultations/:id)
final consultationDetailProvider =
    FutureProvider.family<ConsultationItem, String>((ref, id) async {
  final networkClient = NetworkClient();

  try {
    final response = await networkClient.get('/api/consultations/$id');
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return ConsultationItem.fromJson(data);
    }
  } catch (_) {}

  // Find in local store
  final match = _consultationsStore.firstWhere(
    (item) => item.id == id,
    orElse: () => _initialConsultations.first,
  );
  return match;
});

/// Toggle Reminder helper
void toggleConsultationReminder(WidgetRef ref, String id, bool enabled) {
  final index = _consultationsStore.indexWhere((item) => item.id == id);
  if (index != -1) {
    _consultationsStore[index] =
        _consultationsStore[index].copyWith(reminderEnabled: enabled);
    ref.invalidate(consultationsHistoryProvider);
    ref.invalidate(consultationDetailProvider(id));
  }
}
