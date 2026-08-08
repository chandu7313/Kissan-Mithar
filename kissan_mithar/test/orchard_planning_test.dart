import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kissan_mithar/features/orchard_planning/presentation/screens/orchard_guided_flow_screen.dart';
import 'package:kissan_mithar/features/orchard_planning/presentation/screens/orchard_plan_report_screen.dart';
import 'package:kissan_mithar/features/orchard_planning/presentation/screens/plan_tracker_screen.dart';
import 'package:kissan_mithar/features/orchard_planning/providers/orchard_planning_provider.dart';

import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('OrchardPlanning State & Notifier Tests', () {
    test('Initial OrchardDraftState defaults are correctly configured', () {
      const state = OrchardDraftState();
      expect(state.currentStep, 0);
      expect(state.landSize, '1-3 Acres');
      expect(state.soilType, 'Red Soil (Lal Mitti)');
      expect(state.budget, 45000.0);
      expect(state.needExpertSuggestion, false);
      expect(state.currentStage, 1);
    });

    test('OrchardDraftState JSON serialization and deserialization works', () {
      const originalState = OrchardDraftState(
        currentStep: 2,
        village: 'Khed',
        district: 'Pune',
        stateName: 'Maharashtra',
        landSize: '3-5 Acres',
        soilType: 'Black Soil (Kali Mitti)',
        budget: 65000.0,
      );

      final json = originalState.toJson();
      final reconstructed = OrchardDraftState.fromJson(json);

      expect(reconstructed.currentStep, 2);
      expect(reconstructed.village, 'Khed');
      expect(reconstructed.district, 'Pune');
      expect(reconstructed.stateName, 'Maharashtra');
      expect(reconstructed.landSize, '3-5 Acres');
      expect(reconstructed.soilType, 'Black Soil (Kali Mitti)');
      expect(reconstructed.budget, 65000.0);
    });

    test('Notifier handles Step 1 photo captures and gallery photos', () {
      final notifier = OrchardPlanningNotifier();
      notifier.setPhoto('front', '/local/front.jpg');
      notifier.setPhoto('left', '/local/left.jpg');
      notifier.addGalleryPhoto('/local/gallery1.jpg');

      expect(notifier.state.frontPhoto, '/local/front.jpg');
      expect(notifier.state.leftPhoto, '/local/left.jpg');
      expect(notifier.state.galleryPhotos, contains('/local/gallery1.jpg'));
      expect(notifier.state.capturedPhotosCount, 3);
      expect(notifier.state.isStep1Valid, true);

      notifier.clearPhoto('front');
      expect(notifier.state.frontPhoto, '');
    });

    test('Notifier handles Step 2 location updates', () {
      final notifier = OrchardPlanningNotifier();
      notifier.setLocationDetails(
        lat: 19.5,
        lng: 74.2,
        village: 'Sangamner',
        district: 'Ahmednagar',
        stateName: 'Maharashtra',
      );

      expect(notifier.state.latitude, 19.5);
      expect(notifier.state.longitude, 74.2);
      expect(notifier.state.village, 'Sangamner');
      expect(notifier.state.district, 'Ahmednagar');
      expect(notifier.state.stateName, 'Maharashtra');
      expect(notifier.state.formattedAddress, contains('Sangamner'));
    });

    test('Notifier handles Step 3 land details and expert suggestion mutual exclusivity', () {
      final notifier = OrchardPlanningNotifier();

      // Land size
      notifier.setLandSize('Above 5 Acres');
      expect(notifier.state.landSize, 'Above 5 Acres');

      // Soil type
      notifier.setSoilType('Sandy Soil (Balui Mitti)');
      expect(notifier.state.soilType, 'Sandy Soil (Balui Mitti)');

      // Water sources multi-select
      notifier.toggleWaterSource('Borewell');
      notifier.toggleWaterSource('Drip');
      expect(notifier.state.waterSources, contains('Drip'));

      // Budget
      notifier.setBudget(80000.0);
      expect(notifier.state.budget, 80000.0);

      // Preferred Orchard & Expert suggestion toggle
      notifier.togglePreferredOrchard('Guava (Taiwan Pink)');
      expect(notifier.state.preferredOrchards, contains('Guava (Taiwan Pink)'));

      // Selecting expert suggestion clears preferred orchards
      notifier.toggleExpertSuggestion();
      expect(notifier.state.needExpertSuggestion, true);
      expect(notifier.state.preferredOrchards, isEmpty);

      // Voice note
      notifier.setVoiceNote('/local/voice_note.m4a', 20);
      expect(notifier.state.voiceNotePath, '/local/voice_note.m4a');
      expect(notifier.state.voiceDurationSeconds, 20);

      notifier.clearVoiceNote();
      expect(notifier.state.voiceNotePath, isNull);
      expect(notifier.state.voiceDurationSeconds, 0);
    });

    test('Submission pipeline completes and updates stage to Submitted', () async {
      final notifier = OrchardPlanningNotifier();
      final success = await notifier.submitOrchardPlan();

      expect(success, true);
      expect(notifier.state.submissionSuccess, true);
      expect(notifier.state.requestId, startsWith('KM-2023-'));
      expect(notifier.state.currentStage, 0);

      notifier.advanceStage();
      expect(notifier.state.currentStage, 1);
    });
  });

  group('OrchardPlanning Widget Tests', () {
    testWidgets('OrchardGuidedFlowScreen renders step 1 photos view', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: OrchardGuidedFlowScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Take Photos of Your Land'), findsOneWidget);
      expect(find.text('Front View'), findsOneWidget);
      expect(find.text('Left View'), findsOneWidget);
      expect(find.text('Right View'), findsOneWidget);
      expect(find.text('Center View'), findsOneWidget);
      expect(find.text('Upload from Gallery instead'), findsOneWidget);
      expect(find.text('Next Step'), findsOneWidget);
    });

    testWidgets('PlanTrackerScreen renders 5-stage stepper and summary', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: PlanTrackerScreen(
              landSize: '2.5 Acres',
              soilType: 'Red Soil (Lal Mitti)',
              hasMap: true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Plan Status'), findsOneWidget);
      expect(find.text('Submitted'), findsOneWidget);
      expect(find.text('Under Review'), findsOneWidget);
      expect(find.text('Expert Assigned'), findsOneWidget);
      expect(find.text('Plan Ready'), findsOneWidget);
      expect(find.text('Completed'), findsOneWidget);
      expect(find.text('Submission Summary'), findsOneWidget);
      expect(find.text('Back to Home'), findsOneWidget);
    });

    testWidgets('OrchardPlanReportScreen renders stat tiles and actions', (tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: OrchardPlanReportScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Your Plan is Ready!'), findsOneWidget);
      expect(find.text('RECOMMENDED ORCHARD'), findsOneWidget);
      expect(find.text('Mango (Kesar Variety)'), findsOneWidget);
      expect(find.text('Estimated Cost'), findsOneWidget);
      expect(find.text('₹45,000'), findsOneWidget);
      expect(find.text('Timeline'), findsOneWidget);
      expect(find.text('12-14 Months'), findsOneWidget);
      expect(find.text('Annual ROI'), findsOneWidget);
      expect(find.text('25% - 30%'), findsOneWidget);
      expect(find.text('Soil Suitability'), findsOneWidget);
      expect(find.text('High'), findsOneWidget);
      expect(find.text('View Full Report'), findsOneWidget);
      expect(find.text('Download'), findsOneWidget);
      expect(find.text('Share'), findsOneWidget);
    });
  });
}
