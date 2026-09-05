import 'package:flutter/foundation.dart';
import '../network/network_client.dart';

/// SMS OTP service — sends OTP requests through the backend API.
/// The backend handles actual SMS delivery via Fast2SMS.
/// No SMS API keys are stored on the client.
class SmsService {
  SmsService._();

  /// Requests the backend to send an OTP to the given phone number.
  /// Returns true if the request was accepted by the backend.
  static Future<bool> sendOtp({
    required String phoneNumber,
    required String otp, // Not used — backend generates its own OTP
  }) async {
    final cleanPhone = phoneNumber.replaceAll(RegExp(r'\D'), '');
    final number10Digit = cleanPhone.length > 10
        ? cleanPhone.substring(cleanPhone.length - 10)
        : cleanPhone;

    try {
      final client = NetworkClient();
      await client.post(
        '/auth/send-phone-otp',
        data: {'phoneNumber': number10Digit},
      );
      debugPrint('[SmsService] OTP send request sent for ***${number10Digit.substring(number10Digit.length - 4)}');
      return true;
    } catch (e) {
      debugPrint('[SmsService] Failed to request OTP: $e');
      return false;
    }
  }
}
