import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../providers/auth_provider.dart';
import '../../../../l10n/app_localizations.dart';

class OtpVerifyScreen extends ConsumerStatefulWidget {
  final String phoneNumber;
  final String? devOtp; // Dev convenience — shows in console

  const OtpVerifyScreen({
    super.key,
    this.phoneNumber = '+91 98765 43210',
    this.devOtp,
  });

  @override
  ConsumerState<OtpVerifyScreen> createState() => _OtpVerifyScreenState();
}

class _OtpVerifyScreenState extends ConsumerState<OtpVerifyScreen> {
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());

  int _remainingSeconds = 43;
  Timer? _timer;
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _remainingSeconds = 43;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _resendOtp() async {
    _startTimer();
    final devOtp = await ref.read(authProvider.notifier).sendOtp(widget.phoneNumber);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(devOtp != null
            ? '${AppLocalizations.of(context)!.newOtpSent} (Dev: $devOtp)'
            : AppLocalizations.of(context)!.newOtpSent),
        backgroundColor: AppColors.primaryGreen,
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (var c in _controllers) {
      c.dispose();
    }
    for (var f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  Future<void> _onVerify() async {
    final enteredOtp = _controllers.map((c) => c.text).join();
    if (enteredOtp.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocalizations.of(context)!.pleaseEnterCompleteOtp),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isVerifying = true);

    // Call backend to verify OTP and get JWT token
    final success = await ref.read(authProvider.notifier).verifyOtpAndLogin(
      phoneNumber: widget.phoneNumber,
      otp: enteredOtp,
    );

    if (!mounted) return;
    setState(() => _isVerifying = false);

    if (success) {
      context.go('/notification-permission');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocalizations.of(context)!.invalidOtpTryAgain),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final timerText =
        '00:${_remainingSeconds.toString().padLeft(2, '0')}';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: FarmerAppBar(
        onBackTap: () => context.pop(),
        showTractorIcon: true,
        showBrandTitle: true,
        showLanguagePill: true,
        showGlobeInLanguagePill: true,
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const SizedBox(height: 20),

                  // Green Circular Icon Badge
                  Container(
                    width: 68,
                    height: 68,
                    decoration: const BoxDecoration(
                      color: AppColors.primaryGreen,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Color(0x331B6327),
                          blurRadius: 16,
                          offset: Offset(0, 6),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.sms_rounded,
                      color: Colors.white,
                      size: 32,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Header
                  Text(
                    l10n.verifyYourNumber,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.4,
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Subtitle
                  Text(
                    l10n.enter6DigitCode,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                  ),

                  const SizedBox(height: 6),

                  // Phone Number
                  Text(
                    widget.phoneNumber,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppColors.primaryGreen,
                      letterSpacing: 0.2,
                    ),
                  ),

                  // Dev OTP hint
                  if (widget.devOtp != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF3E0),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Dev OTP: ${widget.devOtp}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFE65100),
                        ),
                      ),
                    ),
                  ],

                  const SizedBox(height: 36),

                  // 6 OTP Digit Boxes
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(6, (index) {
                      final hasFocus = _focusNodes[index].hasFocus;
                      final hasText = _controllers[index].text.isNotEmpty;

                      return Container(
                        width: 48,
                        height: 62,
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: (hasFocus || (index == 0 && !hasText))
                                ? AppColors.primaryGreen
                                : const Color(0xFFC7CEC7),
                            width: (hasFocus || (index == 0 && !hasText)) ? 2.5 : 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withAlpha(4),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        alignment: Alignment.center,
                        child: TextField(
                          controller: _controllers[index],
                          focusNode: _focusNodes[index],
                          textAlign: TextAlign.center,
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            LengthLimitingTextInputFormatter(1),
                          ],
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.zero,
                          ),
                          onChanged: (val) {
                            if (val.isNotEmpty && index < 5) {
                              _focusNodes[index + 1].requestFocus();
                            } else if (val.isEmpty && index > 0) {
                              _focusNodes[index - 1].requestFocus();
                            }
                            setState(() {});
                          },
                        ),
                      );
                    }),
                  ),

                  const SizedBox(height: 28),

                  // Timer / Resend OTP
                  if (_remainingSeconds > 0)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.timer_outlined,
                          size: 20,
                          color: AppColors.secondaryBrown,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          l10n.resendOtpIn,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                            color: AppColors.secondaryBrown,
                          ),
                        ),
                        Text(
                          timerText,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.secondaryBrown,
                          ),
                        ),
                      ],
                    )
                  else
                    TextButton.icon(
                      onPressed: _resendOtp,
                      icon: const Icon(Icons.refresh_rounded, color: AppColors.primaryGreen),
                      label: Text(
                        l10n.resendOtpNow,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryGreen,
                        ),
                      ),
                    ),

                  const SizedBox(height: 48),

                  // Verify Button
                  LargeButton(
                    label: _isVerifying ? l10n.verifying : l10n.verify,
                    leadingIcon: Icon(
                      _isVerifying ? Icons.hourglass_top_rounded : Icons.verified_outlined,
                      color: Colors.white,
                      size: 22,
                    ),
                    onPressed: _isVerifying ? null : _onVerify,
                  ),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
