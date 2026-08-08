import 'dart:math' as math;
import 'package:flutter/material.dart';

class ExpertIllustrationBanner extends StatelessWidget {
  const ExpertIllustrationBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 220,
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(12),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            // Custom painted Agronomist scene in farm field
            CustomPaint(
              size: const Size(double.infinity, 220),
              painter: _AgronomistScenePainter(),
              child: Container(),
            ),

            // Bottom overlay text badge
            Positioned(
              left: 16,
              bottom: 14,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withAlpha(140),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withAlpha(60), width: 1),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.timer_rounded,
                      color: Color(0xFFFFD54F),
                      size: 16,
                    ),
                    SizedBox(width: 6),
                    Text(
                      'Expert available in 15 mins',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                        letterSpacing: 0.1,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AgronomistScenePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // 1. Sky Gradient
    final skyRect = Rect.fromLTWH(0, 0, w, h * 0.55);
    final skyPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xFFB8DDF8),
          Color(0xFFD6EEFB),
          Color(0xFFF1F8E9),
        ],
      ).createShader(skyRect);
    canvas.drawRect(skyRect, skyPaint);

    // Soft clouds
    final cloudPaint = Paint()..color = Colors.white.withAlpha(200);
    canvas.drawCircle(Offset(w * 0.18, h * 0.15), 24, cloudPaint);
    canvas.drawCircle(Offset(w * 0.26, h * 0.14), 32, cloudPaint);
    canvas.drawCircle(Offset(w * 0.34, h * 0.16), 22, cloudPaint);

    canvas.drawCircle(Offset(w * 0.78, h * 0.18), 28, cloudPaint);
    canvas.drawCircle(Offset(w * 0.86, h * 0.17), 36, cloudPaint);

    // Distant farm hills
    final hillPaint = Paint()..color = const Color(0xFFC8E6C9);
    final hillPath = Path()
      ..moveTo(0, h * 0.38)
      ..quadraticBezierTo(w * 0.3, h * 0.32, w * 0.6, h * 0.36)
      ..quadraticBezierTo(w * 0.85, h * 0.34, w, h * 0.37)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(hillPath, hillPaint);

    // Farm Crop Rows (Perspective lines towards center horizon)
    final soilPaint = Paint()..color = const Color(0xFF5D4037);
    final cropGreen1 = Paint()..color = const Color(0xFF388E3C);
    final cropGreen2 = Paint()..color = const Color(0xFF4CAF50);
    final cropGreen3 = Paint()..color = const Color(0xFF2E7D32);

    final groundPath = Path()
      ..moveTo(0, h * 0.37)
      ..lineTo(w, h * 0.37)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(groundPath, soilPaint);

    // Left perspective crop rows
    for (int i = 0; i < 5; i++) {
      final p = Path()
        ..moveTo(w * 0.45, h * 0.37)
        ..lineTo(w * (0.45 - (i + 1) * 0.11), h)
        ..lineTo(w * (0.45 - i * 0.11), h)
        ..close();
      canvas.drawPath(p, (i % 2 == 0) ? cropGreen1 : cropGreen2);

      // Crop bush textures
      for (double y = h * 0.45; y < h; y += 22) {
        final scale = (y - h * 0.35) / (h * 0.65);
        final cx = w * 0.45 - (i * 0.10 + 0.05) * w * scale;
        canvas.drawCircle(Offset(cx, y), 8 * scale + 4, cropGreen3);
      }
    }

    // Right perspective crop rows
    for (int i = 0; i < 5; i++) {
      final p = Path()
        ..moveTo(w * 0.55, h * 0.37)
        ..lineTo(w * (0.55 + (i + 1) * 0.11), h)
        ..lineTo(w * (0.55 + i * 0.11), h)
        ..close();
      canvas.drawPath(p, (i % 2 == 0) ? cropGreen1 : cropGreen2);

      for (double y = h * 0.45; y < h; y += 22) {
        final scale = (y - h * 0.35) / (h * 0.65);
        final cx = w * 0.55 + (i * 0.10 + 0.05) * w * scale;
        canvas.drawCircle(Offset(cx, y), 8 * scale + 4, cropGreen3);
      }
    }

    // 2. Center Agronomist Expert Figure
    final cx = w * 0.50;
    final cy = h * 0.20;

    // Head / Hair (Grey/Black professional hair)
    final hairPaint = Paint()..color = const Color(0xFF4A4A4A);
    canvas.drawOval(
      Rect.fromCenter(center: Offset(cx, cy + 18), width: 44, height: 48),
      hairPaint,
    );

    // Face Skin
    final faceSkin = Paint()..color = const Color(0xFFE0A97C);
    canvas.drawOval(
      Rect.fromCenter(center: Offset(cx, cy + 24), width: 34, height: 40),
      faceSkin,
    );

    // Beard / Mustache
    final beard = Paint()..color = const Color(0xFF5A5A5A);
    canvas.drawOval(
      Rect.fromCenter(center: Offset(cx, cy + 34), width: 26, height: 18),
      beard,
    );

    // Eyes & Smile
    final featurePaint = Paint()
      ..color = const Color(0xFF212121)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    canvas.drawArc(
      Rect.fromCenter(center: Offset(cx - 6, cy + 20), width: 6, height: 4),
      math.pi,
      math.pi,
      false,
      featurePaint,
    );
    canvas.drawArc(
      Rect.fromCenter(center: Offset(cx + 6, cy + 20), width: 6, height: 4),
      math.pi,
      math.pi,
      false,
      featurePaint,
    );
    // Cheerful Smile
    canvas.drawArc(
      Rect.fromCenter(center: Offset(cx, cy + 30), width: 12, height: 6),
      0,
      math.pi,
      false,
      featurePaint,
    );

    // Neck
    canvas.drawRect(Rect.fromLTWH(cx - 7, cy + 42, 14, 12), faceSkin);

    // Shirt (Light Blue / Off-white)
    final shirtPaint = Paint()..color = const Color(0xFFE1EFF6);
    final shirtPath = Path()
      ..moveTo(cx - 26, cy + 52)
      ..lineTo(cx + 26, cy + 52)
      ..lineTo(cx + 34, cy + 140)
      ..lineTo(cx - 34, cy + 140)
      ..close();
    canvas.drawPath(shirtPath, shirtPaint);

    // Agronomist Field Vest (Olive / Khaki Green)
    final vestPaint = Paint()..color = const Color(0xFF556B2F);
    // Left Vest
    final leftVest = Path()
      ..moveTo(cx - 26, cy + 52)
      ..lineTo(cx - 8, cy + 52)
      ..lineTo(cx - 10, cy + 140)
      ..lineTo(cx - 36, cy + 140)
      ..close();
    canvas.drawPath(leftVest, vestPaint);

    // Right Vest
    final rightVest = Path()
      ..moveTo(cx + 26, cy + 52)
      ..lineTo(cx + 8, cy + 52)
      ..lineTo(cx + 10, cy + 140)
      ..lineTo(cx + 36, cy + 140)
      ..close();
    canvas.drawPath(rightVest, vestPaint);

    // Digital Tablet in Arm
    final tabletRect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: Offset(cx - 16, cy + 100), width: 34, height: 44),
      const Radius.circular(4),
    );
    final tabletPaint = Paint()..color = const Color(0xFF1E232A);
    final tabletScreen = Paint()..color = const Color(0xFFE8F5E9);
    canvas.drawRRect(tabletRect, tabletPaint);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(center: Offset(cx - 16, cy + 100), width: 28, height: 38),
        const Radius.circular(2),
      ),
      tabletScreen,
    );

    // Mini chart on tablet
    final chartBar1 = Paint()..color = const Color(0xFF4CAF50);
    final chartBar2 = Paint()..color = const Color(0xFFFFA000);
    canvas.drawRect(Rect.fromLTWH(cx - 26, cy + 96, 6, 14), chartBar1);
    canvas.drawRect(Rect.fromLTWH(cx - 18, cy + 90, 6, 20), chartBar2);
    canvas.drawRect(Rect.fromLTWH(cx - 10, cy + 86, 6, 24), chartBar1);

    // Phone to ear (Right Hand)
    final phoneRect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: Offset(cx + 22, cy + 26), width: 10, height: 20),
      const Radius.circular(2),
    );
    canvas.drawRRect(phoneRect, tabletPaint);

    // Hand holding phone
    canvas.drawCircle(Offset(cx + 22, cy + 36), 7, faceSkin);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
