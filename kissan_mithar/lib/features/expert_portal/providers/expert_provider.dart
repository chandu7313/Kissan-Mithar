import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/network_client.dart';

final expertPortalProvider = StateNotifierProvider<ExpertPortalNotifier, ExpertPortalState>((ref) {
  return ExpertPortalNotifier();
});

class ExpertPortalState {
  final bool isLoading;
  final List<dynamic> orchardRequests;
  final List<dynamic> consultations;

  const ExpertPortalState({
    this.isLoading = false,
    this.orchardRequests = const [],
    this.consultations = const [],
  });

  ExpertPortalState copyWith({
    bool? isLoading,
    List<dynamic>? orchardRequests,
    List<dynamic>? consultations,
  }) {
    return ExpertPortalState(
      isLoading: isLoading ?? this.isLoading,
      orchardRequests: orchardRequests ?? this.orchardRequests,
      consultations: consultations ?? this.consultations,
    );
  }
}

class ExpertPortalNotifier extends StateNotifier<ExpertPortalState> {
  final NetworkClient _networkClient = NetworkClient();

  ExpertPortalNotifier() : super(const ExpertPortalState()) {
    fetchData();
  }

  Future<void> fetchData() async {
    state = state.copyWith(isLoading: true);
    try {
      final orchardRes = await _networkClient.get<dynamic>('/orchard-requests?viewAsExpert=true');
      final consultRes = await _networkClient.get<dynamic>('/consultations?viewAsExpert=true');

      List<dynamic> orchards = [];
      List<dynamic> consults = [];

      if (orchardRes.data is Map && orchardRes.data['success'] == true) {
        orchards = orchardRes.data['data'] as List<dynamic>? ?? [];
      }
      
      if (consultRes.data is Map && consultRes.data['success'] == true) {
        consults = consultRes.data['data'] as List<dynamic>? ?? [];
      }

      state = state.copyWith(
        isLoading: false,
        orchardRequests: orchards,
        consultations: consults,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }
}
