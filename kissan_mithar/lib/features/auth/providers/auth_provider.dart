import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/network/network_client.dart';
import '../../notifications/services/notification_service.dart';
import '../services/auth_service.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? userId;
  final String? phoneNumber;
  final String? userName;
  final String? photoUrl;
  final String? token;
  final String? languageCode;
  final String? errorMessage;

  const AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.userId,
    this.phoneNumber,
    this.userName,
    this.photoUrl,
    this.token,
    this.languageCode = 'en',
    this.errorMessage,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? userId,
    String? phoneNumber,
    String? userName,
    String? photoUrl,
    String? token,
    String? languageCode,
    String? errorMessage,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      userId: userId ?? this.userId,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      userName: userName ?? this.userName,
      photoUrl: photoUrl ?? this.photoUrl,
      token: token ?? this.token,
      languageCode: languageCode ?? this.languageCode,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  static const String _prefUserIdKey = 'kissan_auth_user_id';
  static const String _prefPhoneKey = 'kissan_auth_phone';
  static const String _prefNameKey = 'kissan_auth_name';
  static const String _prefPhotoKey = 'kissan_auth_photo';

  final AuthService _authService;
  final NetworkClient _networkClient;

  AuthNotifier({
    AuthService? authService,
    NetworkClient? networkClient,
  })  : _authService = authService ?? AuthService(),
        _networkClient = networkClient ?? NetworkClient(),
        super(const AuthState()) {
    _tryAutoLogin();
  }

  /// Attempts to restore a persisted session on app startup
  Future<void> _tryAutoLogin() async {
    state = state.copyWith(isLoading: true);
    try {
      await _networkClient.loadPersistedToken();
      if (_networkClient.hasToken) {
        final prefs = await SharedPreferences.getInstance();
        var userId = prefs.getString(_prefUserIdKey);
        var phone = prefs.getString(_prefPhoneKey);
        var name = prefs.getString(_prefNameKey);
        var photo = prefs.getString(_prefPhotoKey);
        var languageCode = state.languageCode;

        // Try to fetch latest profile from backend to sync admin edits
        try {
          final response = await _networkClient.get<dynamic>('/farmers/me');
          if (response.data is Map<String, dynamic>) {
            final data = response.data as Map<String, dynamic>;
            name = data['name'] as String? ?? name;
            photo = data['photoUrl'] as String? ?? photo;
            phone = data['phoneNumber'] as String? ?? phone;
            if (data['languageCode'] != null) {
              languageCode = data['languageCode'] as String;
            }

            // Update prefs with latest
            await prefs.setString(_prefNameKey, name ?? 'farmer');
            if (photo != null) await prefs.setString(_prefPhotoKey, photo);
          }
        } catch (e) {
          debugPrint('[AuthNotifier] Failed to sync profile on auto-login: $e');
        }

        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          userId: userId,
          phoneNumber: phone,
          userName: name ?? 'farmer',
          photoUrl: photo,
          languageCode: languageCode,
          token: _networkClient.authToken,
        );
        debugPrint('[AuthNotifier] Auto-login restored for $name ($phone)');
      } else {
        state = state.copyWith(isAuthenticated: false, isLoading: false);
      }
    } catch (e) {
      debugPrint('[AuthNotifier] Auto-login failed: $e');
      state = state.copyWith(isAuthenticated: false, isLoading: false);
    }
  }

  void setLanguage(String langCode) {
    state = state.copyWith(languageCode: langCode);
  }

  /// Sends OTP to the given phone number via backend
  Future<String?> sendOtp(String phoneNumber) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final devOtp = await _authService.sendPhoneOtp(phoneNumber: phoneNumber);
      state = state.copyWith(isLoading: false);
      return devOtp;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to send OTP. Please try again.',
      );
      return null;
    }
  }

  /// Verifies OTP with backend and completes login
  Future<bool> verifyOtpAndLogin({
    required String phoneNumber,
    required String otp,
    String? name,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final result = await _authService.verifyPhoneOtp(
        phoneNumber: phoneNumber,
        otp: otp,
        name: name,
        languageCode: state.languageCode,
      );

      // Persist user info locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefUserIdKey, result.userId);
      await prefs.setString(_prefPhoneKey, result.phoneNumber);
      await prefs.setString(_prefNameKey, result.name);
      if (result.photoUrl != null) {
        await prefs.setString(_prefPhotoKey, result.photoUrl!);
      }

      state = state.copyWith(
        isAuthenticated: true,
        isLoading: false,
        userId: result.userId,
        phoneNumber: result.phoneNumber,
        userName: result.name,
        photoUrl: result.photoUrl,
        token: result.token,
      );

      // Register FCM device token with backend
      NotificationService().registerDeviceToken(
        userId: result.userId,
        language: state.languageCode,
      );

      debugPrint('[AuthNotifier] Login successful: ${result.name}');
      return true;
    } catch (e) {
      debugPrint('[AuthNotifier] Login failed: $e');
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Invalid OTP. Please try again.',
      );
      return false;
    }
  }

  /// Legacy login method (kept for backward compatibility)
  void login(String phone, String name) {
    state = state.copyWith(
      isAuthenticated: true,
      phoneNumber: phone,
      userName: name,
    );

    NotificationService().registerDeviceToken(
      userId: phone,
      language: state.languageCode,
    );
  }

  /// Logs out the user, clears all persisted data
  Future<void> logout() async {
    await _authService.logout(userId: state.userId);

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefUserIdKey);
    await prefs.remove(_prefPhoneKey);
    await prefs.remove(_prefNameKey);
    await prefs.remove(_prefPhotoKey);

    state = const AuthState(isAuthenticated: false);
    debugPrint('[AuthNotifier] Logged out');
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
