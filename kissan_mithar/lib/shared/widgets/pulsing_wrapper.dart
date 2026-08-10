import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class PulsingWrapper extends StatefulWidget {
  final Widget child;
  final bool isPulsing;
  final double scaleEnd;

  const PulsingWrapper({
    super.key,
    required this.child,
    this.isPulsing = true,
    this.scaleEnd = 1.05, // Slightly smaller pulse for larger buttons
  });

  @override
  State<PulsingWrapper> createState() => _PulsingWrapperState();
}

class _PulsingWrapperState extends State<PulsingWrapper>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 700),
      vsync: this,
    );
    _animation = Tween<double>(begin: 1.0, end: widget.scaleEnd).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    if (widget.isPulsing) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(PulsingWrapper oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPulsing != oldWidget.isPulsing) {
      if (widget.isPulsing) {
        _controller.repeat(reverse: true);
      } else {
        _controller.stop();
        _controller.animateTo(0.0, duration: const Duration(milliseconds: 200));
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        final double glowProgress = (_animation.value - 1.0) / (widget.scaleEnd - 1.0);
        
        return Transform.scale(
          scale: _animation.value,
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              boxShadow: widget.isPulsing
                  ? [
                      BoxShadow(
                        color: AppColors.primaryGreen.withOpacity(0.3 * glowProgress),
                        blurRadius: 10 * glowProgress,
                        spreadRadius: 3 * glowProgress,
                      ),
                    ]
                  : null,
            ),
            child: widget.child,
          ),
        );
      },
    );
  }
}
