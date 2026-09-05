import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Authentication & Locale Validation Tests', () {
    test('Farmer phone number validation rules', () {
      bool isValidIndianPhone(String phone) {
        final digitsOnly = phone.replaceAll(RegExp(r'\D'), '');
        // Must be 10 digits and start with 6, 7, 8, or 9
        return digitsOnly.length == 10 && RegExp(r'^[6-9]').hasMatch(digitsOnly);
      }

      expect(isValidIndianPhone('9876543210'), isTrue);
      expect(isValidIndianPhone('8765432109'), isTrue);
      expect(isValidIndianPhone('7123456789'), isTrue);
      expect(isValidIndianPhone('6123456789'), isTrue);

      // Invalid cases
      expect(isValidIndianPhone('1234567890'), isFalse); // Starts with 1
      expect(isValidIndianPhone('98765'), isFalse); // Too short
      expect(isValidIndianPhone('9876543210123'), isFalse); // Too long
    });

    test('Supported 4 Indian languages codes and display names', () {
      final supportedLocales = {
        'te': 'తెలుగు (Telugu)',
        'hi': 'हिंदी (Hindi)',
        'en': 'English',
        'kn': 'ಕನ್ನಡ (Kannada)',
      };

      expect(supportedLocales.containsKey('te'), isTrue);
      expect(supportedLocales.containsKey('hi'), isTrue);
      expect(supportedLocales.containsKey('en'), isTrue);
      expect(supportedLocales.containsKey('kn'), isTrue);
      expect(supportedLocales.length, 4);
    });

    test('OTP length and formatting verification', () {
      bool isValidOtp(String otp) {
        return otp.length == 6 && int.tryParse(otp) != null;
      }

      expect(isValidOtp('123456'), isTrue);
      expect(isValidOtp('884123'), isTrue);
      expect(isValidOtp('12345'), isFalse);
      expect(isValidOtp('1234567'), isFalse);
      expect(isValidOtp('12345a'), isFalse);
    });
  });
}
