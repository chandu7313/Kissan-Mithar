import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/services/sms_service.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/farmer_illustration_banner.dart';
import '../../../../shared/widgets/large_button.dart';
import 'otp_verify_screen.dart';

class PhoneAuthScreen extends StatefulWidget {
  const PhoneAuthScreen({super.key});

  @override
  State<PhoneAuthScreen> createState() => _PhoneAuthScreenState();
}

class _PhoneAuthScreenState extends State<PhoneAuthScreen> {
  final TextEditingController _phoneController = TextEditingController();
  bool _isSending = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _onSendOtp() async {
    final phone = _phoneController.text.trim();
    final displayNumber = phone.isNotEmpty ? '+91 $phone' : '+91 98765 43210';
    final randomOtp = (100000 + Random().nextInt(900000)).toString();

    setState(() => _isSending = true);
    await SmsService.sendOtp(phoneNumber: displayNumber, otp: randomOtp);
    if (!mounted) return;
    setState(() => _isSending = false);

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => OtpVerifyScreen(
          phoneNumber: displayNumber,
          sentOtp: randomOtp,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: FarmerAppBar(
        onBackTap: () => Navigator.pop(context),
        showTractorIcon: true,
        showBrandTitle: true,
        showLanguagePill: true,
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 460),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),

                  // Farmer Illustration Banner
                  const FarmerIllustrationBanner(),

                  const SizedBox(height: 28),

                  // Headline
                  const Center(
                    child: Text(
                      'Enter Your Mobile\nNumber',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        height: 1.25,
                        letterSpacing: -0.4,
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  // Subtitle
                  const Center(
                    child: Text(
                      "We'll send a code to verify.",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Label
                  const Text(
                    'Mobile Number',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),

                  const SizedBox(height: 10),

                  // Compound Mobile Input Field
                  Container(
                    height: 62,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFC7CEC7), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(5),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // +91 Prefix Box
                        Container(
                          width: 78,
                          height: double.infinity,
                          decoration: const BoxDecoration(
                            color: Color(0xFFF1EFEA),
                            borderRadius: BorderRadius.horizontal(left: Radius.circular(12)),
                          ),
                          alignment: Alignment.center,
                          child: const Text(
                            '+91',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),

                        // Divider
                        Container(
                          width: 1.5,
                          height: double.infinity,
                          color: const Color(0xFFC7CEC7),
                        ),

                        // Phone Number Input
                        Expanded(
                          child: TextField(
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              LengthLimitingTextInputFormatter(10),
                            ],
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                              letterSpacing: 1.2,
                            ),
                            decoration: const InputDecoration(
                              hintText: '00000 00000',
                              hintStyle: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w500,
                                color: Color(0xFFA5ACA5),
                                letterSpacing: 1.2,
                              ),
                              contentPadding: EdgeInsets.symmetric(horizontal: 16),
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 44),

                  // Send OTP Button
                  LargeButton(
                    label: 'Send OTP',
                    leadingIcon: const Icon(
                      Icons.send_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                    onPressed: _onSendOtp,
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
