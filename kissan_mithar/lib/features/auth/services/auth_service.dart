import 'package:flutter/foundation.dart';
import '../../../core/network/network_client.dart';

class AuthResult {
  final String token;
  final String userId;
  final String phoneNumber;
  final String name;
  final String? photoUrl;
  final String role;

  const AuthResult({
    required this.token,
    required this.userId,
    required this.phoneNumber,
    required this.name,
    this.photoUrl,
    required this.role,
  });

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? {};
    return AuthResult(
      token: json['token'] as String? ?? '',
      userId: user['userId'] as String? ?? '',
      phoneNumber: user['phoneNumber'] as String? ?? '',
      name: user['name'] as String? ?? 'Farmer',
      photoUrl: user['photoUrl'] as String?,
      role: user['role'] as String? ?? 'FARMER',
    );
  }
}

class AuthService {
  final NetworkClient _networkClient;

  AuthService({NetworkClient? networkClient})
      : _networkClient = networkClient ?? NetworkClient();

  /// Sends OTP to a phone number via backend
  /// Returns the OTP in dev mode for convenience
  Future<String?> sendPhoneOtp({required String phoneNumber}) async {
    try {
      final response = await _networkClient.post<dynamic>(
        '/auth/send-phone-otp',
        data: {'phoneNumber': phoneNumber},
      );

      final data = response.data;
      if (data is Map<String, dynamic> && data['success'] == true) {
        final result = data['data'] as Map<String, dynamic>?;
        debugPrint('[AuthService] OTP sent successfully to $phoneNumber');
        // Return devOtp for local testing (backend sends it in dev mode)
        return result?['devOtp'] as String?;
      }
      return null;
    } catch (e) {
      debugPrint('[AuthService] Failed to send phone OTP: $e');
      rethrow;
    }
  }

  /// Verifies OTP and returns AuthResult with JWT token
  Future<AuthResult> verifyPhoneOtp({
    required String phoneNumber,
    required String otp,
    String? name,
  }) async {
    try {
      final response = await _networkClient.post<dynamic>(
        '/auth/verify-phone-otp',
        data: {
          'phoneNumber': phoneNumber,
          'otp': otp,
          if (name != null && name.isNotEmpty) 'name': name,
        },
      );

      final data = response.data;
      if (data is Map<String, dynamic> && data['success'] == true) {
        final resultData = data['data'] as Map<String, dynamic>;
        final authResult = AuthResult.fromJson(resultData);

        // Set the token on the network client for all subsequent API calls
        await _networkClient.setAuthToken(authResult.token);

        debugPrint('[AuthService] Login successful: ${authResult.name} (${authResult.userId})');
        return authResult;
      }

      throw Exception('Unexpected response format from verify-phone-otp');
    } catch (e) {
      debugPrint('[AuthService] Failed to verify phone OTP: $e');
      rethrow;
    }
  }

  /// Logs out the user and clears the token
  Future<void> logout({String? userId}) async {
    try {
      await _networkClient.post<dynamic>(
        '/auth/logout',
        data: {
          'userId': ?userId,
          'role': 'FARMER',
        },
      );
    } catch (e) {
      debugPrint('[AuthService] Logout API call failed (non-blocking): $e');
    }
    await _networkClient.clearAuthToken();
  }
}
