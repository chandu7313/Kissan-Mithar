import 'package:flutter_riverpod/flutter_riverpod.dart';

class ActivityState {
  final int activeOrchardPlansCount;
  final int upcomingConsultationsCount;

  const ActivityState({
    this.activeOrchardPlansCount = 1,
    this.upcomingConsultationsCount = 1,
  });
}

class ActivityNotifier extends StateNotifier<ActivityState> {
  ActivityNotifier() : super(const ActivityState());
}

final activityProvider = StateNotifierProvider<ActivityNotifier, ActivityState>((ref) {
  return ActivityNotifier();
});
