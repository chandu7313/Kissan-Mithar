import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../auth/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  final VoidCallback? onSplashComplete;

  const SplashScreen({
    super.key,
    this.onSplashComplete,
  });

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.0, 0.8, curve: Curves.easeIn),
    );

    _scaleAnimation = Tween<double>(begin: 0.88, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.0, 0.8, curve: Curves.easeOutCubic),
      ),
    );

    _animationController.forward();

    // Wait for both the splash animation minimum duration AND for auth
    // state to finish loading before navigating.
    _navigateWhenReady();
  }

  /// Waits for both the minimum splash animation and auth state resolution,
  /// then navigates to the appropriate screen.
  Future<void> _navigateWhenReady() async {
    // Minimum splash display time for the animation to play
    final minSplashDelay = Future.delayed(const Duration(milliseconds: 2200));

    // Wait for auth state to finish loading (auto-login check)
    final authReady = Future.doWhile(() async {
      await Future.delayed(const Duration(milliseconds: 100));
      if (!mounted) return false; // Stop polling if widget is disposed
      final authState = ref.read(authProvider);
      return authState.isLoading; // Keep polling while still loading
    });

    // Wait for both to complete
    await Future.wait([minSplashDelay, authReady]);

    if (!mounted) return;

    if (widget.onSplashComplete != null) {
      widget.onSplashComplete!();
    } else {
      final authState = ref.read(authProvider);
      if (authState.isAuthenticated) {
        // User has a persisted session — skip language/phone/OTP, go straight home
        context.go('/home');
      } else {
        // No persisted session — start the login flow
        context.go('/language');
      }
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final minDim = math.min(size.width, size.height);
    final logoWidth = math.min(minDim * 0.72, 300.0);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Ambient soft background glows
          Positioned(
            top: -60,
            right: -60,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.accentSunGold.withAlpha(30),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            left: -80,
            child: Container(
              width: 340,
              height: 340,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primaryGreen.withAlpha(20),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Main Center Content
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                child: AnimatedBuilder(
                  animation: _animationController,
                  builder: (context, child) {
                    return FadeTransition(
                      opacity: _fadeAnimation,
                      child: ScaleTransition(
                        scale: _scaleAnimation,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24.0,
                            vertical: 32.0,
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.asset(
                                'assets/images/kissan_mithar_logo.PNG',
                                width: logoWidth,
                                fit: BoxFit.contain,
                                errorBuilder: (context, error, stackTrace) {
                                  return Icon(
                                    Icons.eco_rounded,
                                    size: logoWidth * 0.6,
                                    color: AppColors.primaryGreen,
                                  );
                                },
                              ),

                              const SizedBox(height: 16),

                              const Text(
                                'KISSAN MITHAR',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primaryGreen,
                                  letterSpacing: 1.2,
                                ),
                              ),

                              const SizedBox(height: 24),

                              // Tagline
                              const Text(
                                'Smart Farming, Simple Language.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.secondaryBrown,
                                  letterSpacing: 0.2,
                                  height: 1.3,
                                ),
                              ),

                              const SizedBox(height: 8),

                              const Text(
                                'సులభమైన వ్యవసాయం • सरल खेती',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.textSecondary,
                                  letterSpacing: 0.1,
                                ),
                              ),

                              const SizedBox(height: 40),

                              // Farmer-first loading indicator
                              const SizedBox(
                                width: 28,
                                height: 28,
                                child: CircularProgressIndicator(
                                  strokeWidth: 3,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    AppColors.primaryGreen,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
