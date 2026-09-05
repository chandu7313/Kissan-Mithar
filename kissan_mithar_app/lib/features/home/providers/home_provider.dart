import 'package:flutter_riverpod/flutter_riverpod.dart';

class HomeState {
  final int selectedTabIndex;
  final String farmerName;
  final double currentTemp;
  final String weatherCondition;

  const HomeState({
    this.selectedTabIndex = 0,
    this.farmerName = 'Ramesh',
    this.currentTemp = 26.0,
    this.weatherCondition = 'Rain Expected',
  });

  HomeState copyWith({
    int? selectedTabIndex,
    String? farmerName,
    double? currentTemp,
    String? weatherCondition,
  }) {
    return HomeState(
      selectedTabIndex: selectedTabIndex ?? this.selectedTabIndex,
      farmerName: farmerName ?? this.farmerName,
      currentTemp: currentTemp ?? this.currentTemp,
      weatherCondition: weatherCondition ?? this.weatherCondition,
    );
  }
}

class HomeNotifier extends StateNotifier<HomeState> {
  HomeNotifier() : super(const HomeState());

  void setTabIndex(int index) {
    state = state.copyWith(selectedTabIndex: index);
  }
}

final homeProvider = StateNotifierProvider<HomeNotifier, HomeState>((ref) {
  return HomeNotifier();
});
