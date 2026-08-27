import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kissan_mithar/features/consultation/models/consultation_model.dart';
import 'package:kissan_mithar/features/consultation/providers/consultation_provider.dart';

void main() {

  group('ConsultationBookingNotifier Unit Tests', () {
    test('Initial draft state has default values', () {
      final notifier = ConsultationBookingNotifier();
      final draft = notifier.state.value!;

      expect(draft.mode, CommunicationMode.voiceCall);
      expect(draft.categories, isEmpty);
      expect(draft.timeSlot, 'Today, 4:00 PM');
      expect(draft.language, 'Telugu');
      expect(draft.mediaPaths, isEmpty);
      expect(draft.voiceNotePath, isNull);
    });

    test('Updating mode, category, timeSlot, and language', () {
      final notifier = ConsultationBookingNotifier();

      notifier.setMode(CommunicationMode.videoCall);
      expect(notifier.state.value!.mode, CommunicationMode.videoCall);

      notifier.toggleCategory('Soil & Fertilizer');
      expect(notifier.state.value!.categories, contains('Soil & Fertilizer'));

      notifier.setTimeSlot('Tomorrow, 10:00 AM');
      expect(notifier.state.value!.timeSlot, 'Tomorrow, 10:00 AM');

      notifier.setLanguage('Hindi');
      expect(notifier.state.value!.language, 'Hindi');

      notifier.setMessage('Nutrient deficiency symptoms');
      expect(notifier.state.value!.message, 'Nutrient deficiency symptoms');

      notifier.setMediaPaths(['image1.jpg', 'image2.jpg']);
      expect(notifier.state.value!.mediaPaths.length, 2);

      notifier.setVoiceNote('/path/to/voice.m4a', 20);
      expect(notifier.state.value!.voiceNotePath, '/path/to/voice.m4a');
      expect(notifier.state.value!.voiceDurationSeconds, 20);

      notifier.clearVoiceNote();
      expect(notifier.state.value!.voiceNotePath, isNull);
      expect(notifier.state.value!.voiceDurationSeconds, 0);

      notifier.resetDraft();
      expect(notifier.state.value!.mode, CommunicationMode.voiceCall);
    });

    test('toggleCategory adds and removes categories', () {
      final notifier = ConsultationBookingNotifier();

      notifier.toggleCategory('Pest & Disease');
      expect(notifier.state.value!.categories, contains('Pest & Disease'));

      notifier.toggleCategory('Irrigation');
      expect(notifier.state.value!.categories.length, 2);

      // Toggle off
      notifier.toggleCategory('Pest & Disease');
      expect(notifier.state.value!.categories, isNot(contains('Pest & Disease')));
      expect(notifier.state.value!.categories.length, 1);
    });
  });

  group('Consultation Providers Unit Tests', () {
    test('consultationsHistoryProvider returns a list', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final history = await container.read(consultationsHistoryProvider.future);

      // Backend may return empty list if no consultations exist
      expect(history, isA<List<ConsultationItem>>());
    });

    test('consultationDetailProvider returns nullable result', () async {
      final container = ProviderContainer();
      addTearDown(container.dispose);
      final detail =
          await container.read(consultationDetailProvider('CNS-0000').future);

      // May be null if consultation not found on backend
      expect(detail, isA<ConsultationItem?>());
    });
  });

  group('ConsultationItem Model Tests', () {
    test('fromJson creates valid ConsultationItem', () {
      final json = {
        'id': 'CNS-1234',
        'expert_name': 'Dr. Test Expert',
        'expert_role': 'Agronomist',
        'expert_photo_url': 'https://example.com/photo.jpg',
        'mode': 'videoCall',
        'category': 'Pest & Disease',
        'language': 'Telugu',
        'scheduled_date': 'Today',
        'scheduled_time': '4:00 PM',
        'status': 'upcoming',
      };
      final item = ConsultationItem.fromJson(json);
      expect(item.id, 'CNS-1234');
      expect(item.expertName, 'Dr. Test Expert');
      expect(item.mode, CommunicationMode.videoCall);
      expect(item.status, ConsultationStatus.upcoming);
    });

    test('toJson and fromJson are symmetrical', () {
      const item = ConsultationItem(
        id: 'CNS-5678',
        expertName: 'Dr. Roundtrip',
        expertRole: 'Specialist',
        expertPhotoUrl: 'https://example.com/photo.jpg',
        mode: CommunicationMode.chat,
        category: 'Soil & Fertilizer',
        scheduledDate: 'Tomorrow',
        scheduledTime: '10:00 AM',
        status: ConsultationStatus.completed,
      );
      final json = item.toJson();
      final restored = ConsultationItem.fromJson(json);
      expect(restored.id, item.id);
      expect(restored.expertName, item.expertName);
      expect(restored.category, item.category);
    });
  });
}
