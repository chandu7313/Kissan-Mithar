import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:kissan_mithar/features/orchard_planning/providers/orchard_planning_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('OrchardPlanningNotifier Multi-Step State Tests', () {
    late OrchardPlanningNotifier notifier;

    setUp(() {
      SharedPreferences.setMockInitialValues({});
      notifier = OrchardPlanningNotifier();
    });

    test('Initial state has default step 0 and empty photo slots', () {
      expect(notifier.state.currentStep, 0);
      expect(notifier.state.frontPhoto, isNull);
      expect(notifier.state.leftPhoto, isNull);
      expect(notifier.state.rightPhoto, isNull);
      expect(notifier.state.centerPhoto, isNull);
      expect(notifier.state.capturedPhotosCount, 0);
    });

    test('Updating individual land photos updates photo count and state', () {
      notifier.setPhoto('front', 'file:///data/front.jpg');
      expect(notifier.state.frontPhoto, 'file:///data/front.jpg');
      expect(notifier.state.capturedPhotosCount, 1);

      notifier.setPhoto('left', 'file:///data/left.jpg');
      notifier.setPhoto('right', 'file:///data/right.jpg');
      notifier.setPhoto('center', 'file:///data/center.jpg');
      expect(notifier.state.capturedPhotosCount, 4);
    });

    test('Multi-step navigation allows valid step transitions (0, 1, 2)', () {
      notifier.nextStep();
      expect(notifier.state.currentStep, 1);

      notifier.nextStep();
      expect(notifier.state.currentStep, 2);

      // Cannot advance past step 2
      notifier.nextStep();
      expect(notifier.state.currentStep, 2);

      notifier.prevStep();
      expect(notifier.state.currentStep, 1);

      notifier.prevStep();
      expect(notifier.state.currentStep, 0);

      // Cannot go below step 0
      notifier.prevStep();
      expect(notifier.state.currentStep, 0);
    });

    test('Updating land specifications correctly modifies state', () {
      notifier.setLandSize('Above 5 Acres');
      expect(notifier.state.landSize, 'Above 5 Acres');

      notifier.setSoilType('Black Cotton Soil (Kali Mitti)');
      expect(notifier.state.soilType, 'Black Cotton Soil (Kali Mitti)');

      notifier.setBudget(85000.0);
      expect(notifier.state.budget, 85000.0);

      notifier.setElectricity(true);
      expect(notifier.state.hasElectricity, isTrue);

      notifier.setDripIrrigation(true);
      expect(notifier.state.hasDripIrrigation, isTrue);
    });

    test('Toggling water sources and crops adds and removes items', () {
      // Toggle Borewell
      notifier.toggleWaterSource('Borewell');
      notifier.toggleWaterSource('Farm Pond');
      expect(notifier.state.waterSources.contains('Farm Pond'), isTrue);

      // Preferred Orchards toggle
      notifier.togglePreferredOrchard('Guava (Taiwan Pink)');
      expect(notifier.state.preferredOrchards.contains('Guava (Taiwan Pink)'), isTrue);

      notifier.togglePreferredOrchard('Guava (Taiwan Pink)');
      expect(notifier.state.preferredOrchards.contains('Guava (Taiwan Pink)'), isFalse);
    });

    test('Stage progression advances through review pipeline', () {
      notifier.setStage(0); // Submitted
      expect(notifier.state.currentStage, 0);

      notifier.advanceStage(); // Under Review
      expect(notifier.state.currentStage, 1);

      notifier.advanceStage(); // Expert Assigned
      expect(notifier.state.currentStage, 2);

      notifier.advanceStage(); // Plan Ready
      expect(notifier.state.currentStage, 3);
    });
  });
}
