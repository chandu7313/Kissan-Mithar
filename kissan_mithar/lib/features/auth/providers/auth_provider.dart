import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../notifications/services/notification_service.dart';

class AuthState {
  final bool isAuthenticated;
  final String? phoneNumber;
  final String? userName;
  final String? languageCode;
  final bool isLoading;

  const AuthState({
    this.isAuthenticated = true,
    this.phoneNumber = '+91 98765 43210',
    this.userName = 'Ramesh Patel',
    this.languageCode = 'en',
    this.isLoading = false,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    String? phoneNumber,
    String? userName,
    String? languageCode,
    bool? isLoading,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      userName: userName ?? this.userName,
      languageCode: languageCode ?? this.languageCode,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState());

  void setLanguage(String langCode) {
    state = state.copyWith(languageCode: langCode);
  }

  void login(String phone, String name) {
    state = state.copyWith(
      isAuthenticated: true,
      phoneNumber: phone,
      userName: name,
    );

    // Register FCM device token with backend
    NotificationService().registerDeviceToken(
      userId: phone,
      language: state.languageCode,
    );
  }

  void logout() {
    state = const AuthState(isAuthenticated: false, phoneNumber: null, userName: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
