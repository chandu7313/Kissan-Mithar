import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kissan_mithar/features/consultation/models/consultation_model.dart';
import 'package:kissan_mithar/features/consultation/presentation/screens/add_consultation_details_screen.dart';
import 'package:kissan_mithar/features/consultation/presentation/screens/book_consultation_screen.dart';
import 'package:kissan_mithar/features/consultation/presentation/screens/consultation_detail_screen.dart';
import 'package:kissan_mithar/features/consultation/presentation/screens/consultation_history_screen.dart';
import 'package:kissan_mithar/features/consultation/providers/consultation_provider.dart';

void main() {

  group('ConsultationBookingNotifier Unit Tests', () {
    test('Initial draft state has default values', () {
      final notifier = ConsultationBookingNotifier();
      final draft = notifier.state.value!;

      expect(draft.mode, CommunicationMode.voiceCall);
      expect(draft.category, 'Pest & Disease');
      expect(draft.timeSlot, 'Today, 4:00 PM');
      expect(draft.language, 'Telugu');
      expect(draft.mediaPaths, isEmpty);
      expect(draft.voiceNotePath, isNull);
    });

    test('Updating mode, category, timeSlot, and language', () {
      final notifier = ConsultationBookingNotifier();

      notifier.setMode(CommunicationMode.videoCall);
      expect(notifier.state.value!.mode, CommunicationMode.videoCall);

      notifier.setCategory('Soil & Fertilizer');
      expect(notifier.state.value!.category, 'Soil & Fertilizer');

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

    test('submitBooking creates and returns ConsultationItem', () async {
      final notifier = ConsultationBookingNotifier();
      notifier.setMode(CommunicationMode.videoCall);
      notifier.setCategory('Irrigation');
      notifier.setTimeSlot('Tomorrow, 2:30 PM');
      notifier.setMessage('Dripper clogging issue');

      final booked = await notifier.submitBooking();
      expect(booked, isNotNull);
      expect(booked!.category, 'Irrigation');
      expect(booked.mode, CommunicationMode.videoCall);
      expect(booked.status, ConsultationStatus.upcoming);
    });
  });

  group('Consultation Providers Unit Tests', () {
    test('consultationsHistoryProvider loads list of consultations', () async {
      final container = ProviderContainer();
      final history = await container.read(consultationsHistoryProvider.future);

      expect(history, isNotEmpty);
      expect(history.any((c) => c.status == ConsultationStatus.upcoming), isTrue);
      expect(history.any((c) => c.status == ConsultationStatus.completed), isTrue);
    });

    test('consultationDetailProvider loads specific consultation by id', () async {
      final container = ProviderContainer();
      final detail =
          await container.read(consultationDetailProvider('CNS-7412').future);

      expect(detail.id, 'CNS-7412');
      expect(detail.expertName, 'Dr. Ananya Reddy');
      expect(detail.prescriptions, isNotEmpty);
      expect(detail.expertNotes, isNotNull);
    });
  });

  group('Consultation Widget Tests', () {
    testWidgets('BookConsultationScreen renders modes, categories, and slots',
        (tester) async {
      tester.view.physicalSize = const Size(500, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: BookConsultationScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('Book an Expert'), findsOneWidget);
      expect(find.text('Step 1 of 2: Session Preference'), findsOneWidget);
      expect(find.text('Voice Call'), findsOneWidget);
      expect(find.text('Video Call'), findsOneWidget);
      expect(find.text('Chat Advisory'), findsOneWidget);

      expect(find.text('Pest & Disease'), findsWidgets);
      expect(find.text('Soil & Fertilizer'), findsOneWidget);
      expect(find.text('Today, 4:00 PM'), findsOneWidget);
      expect(find.text('Next: Add Crop Details'), findsOneWidget);

      // Select Video Call mode
      await tester.tap(find.text('Video Call'));
      await tester.pumpAndSettle();

      // Select another category
      await tester.tap(find.text('Soil & Fertilizer'));
      await tester.pumpAndSettle();
    });

    testWidgets('AddConsultationDetailsScreen renders and accepts inputs',
        (tester) async {
      tester.view.physicalSize = const Size(500, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: AddConsultationDetailsScreen(),
          ),
        ),
      );

      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      expect(find.text('Add Crop Issue Details'), findsOneWidget);
      expect(find.text('Step 2 of 2: Photos, Voice & Description'), findsOneWidget);
      expect(find.text('1. Describe the Problem (Optional)'), findsOneWidget);
      expect(find.text('Add Photos or Video of Crop Issue'), findsOneWidget);
      expect(find.text('Record Voice Note'), findsOneWidget);
      expect(find.text('Confirm & Book Expert'), findsOneWidget);

      // Enter text
      await tester.enterText(
          find.byType(TextField), 'Test crop issue description');
      await tester.pump();
      expect(find.text('Test crop issue description'), findsOneWidget);
    });

    testWidgets('ConsultationHistoryScreen renders upcoming and past tabs',
        (tester) async {
      tester.view.physicalSize = const Size(500, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: ConsultationHistoryScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('My Consultations'), findsOneWidget);
      expect(find.widgetWithText(Tab, 'Upcoming'), findsOneWidget);
      expect(find.widgetWithText(Tab, 'Past History'), findsOneWidget);
      expect(find.text('Dr. Rajesh Deshmukh'), findsWidgets);

      // Switch to Past History tab
      await tester.tap(find.widgetWithText(Tab, 'Past History'));
      await tester.pumpAndSettle();

      expect(find.text('Dr. Ananya Reddy'), findsOneWidget);
    });

    testWidgets('ConsultationDetailScreen renders expert, notes, and prescriptions',
        (tester) async {
      tester.view.physicalSize = const Size(500, 1000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: ConsultationDetailScreen(consultationId: 'CNS-7412'),
          ),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('CNS-7412'), findsOneWidget);
      expect(find.text('Dr. Ananya Reddy'), findsOneWidget);
      expect(find.text('Reported Crop Issue'), findsOneWidget);
      expect(find.text('Expert Diagnosis & Findings'), findsOneWidget);
      expect(find.text('Prescriptions & Spray Advisory'), findsOneWidget);
      expect(find.text('Chelated Zinc (Zn-EDTA 12%)'), findsOneWidget);
      expect(find.text('Follow-up & Session Reminder'), findsOneWidget);

      // Toggle reminder switch
      final switchFinder = find.byType(Switch);
      expect(switchFinder, findsOneWidget);
      await tester.ensureVisible(switchFinder);
      await tester.pumpAndSettle();
      await tester.tap(switchFinder);
      await tester.pumpAndSettle();
    });
  });
}
