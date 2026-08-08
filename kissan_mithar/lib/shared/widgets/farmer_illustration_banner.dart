import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';

class FarmerIllustrationBanner extends StatelessWidget {
  const FarmerIllustrationBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 210,
      decoration: BoxDecoration(
        color: const Color(0xFFFBF4E8),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFEFE2CB), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: CustomPaint(
          painter: _FarmerScenePainter(),
          child: Container(),
        ),
      ),
    );
  }
}

class _FarmerScenePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    // 1. Sky & Sun Gradient
    final skyRect = Rect.fromLTWH(0, 0, w, h);
    final skyPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xFFFDEFD7),
          Color(0xFFFDF7EC),
          Color(0xFFE8F3DE),
        ],
      ).createShader(skyRect);
    canvas.drawRect(skyRect, skyPaint);

    // Sun
    final sunPaint = Paint()
      ..color = const Color(0xFFFFD56B).withAlpha(190)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);
    canvas.drawCircle(Offset(w * 0.48, h * 0.38), 38, sunPaint);

    final sunCorePaint = Paint()..color = const Color(0xFFFFF0B8);
    canvas.drawCircle(Offset(w * 0.48, h * 0.38), 24, sunCorePaint);

    // 2. Distant Hills
    final hillPaint1 = Paint()..color = const Color(0xFFD4E7BF);
    final hillPath1 = Path()
      ..moveTo(0, h * 0.52)
      ..quadraticBezierTo(w * 0.25, h * 0.45, w * 0.5, h * 0.50)
      ..quadraticBezierTo(w * 0.75, h * 0.55, w, h * 0.48)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(hillPath1, hillPaint1);

    // Midground green fields
    final fieldPaint = Paint()..color = const Color(0xFF9FC667);
    final fieldPath = Path()
      ..moveTo(0, h * 0.58)
      ..quadraticBezierTo(w * 0.3, h * 0.54, w * 0.65, h * 0.60)
      ..quadraticBezierTo(w * 0.85, h * 0.63, w, h * 0.57)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(fieldPath, fieldPaint);

    // Field furrows / stripes
    final furrowPaint = Paint()
      ..color = const Color(0xFF7EAC47)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    for (int i = 0; i < 4; i++) {
      final furrow = Path()
        ..moveTo(w * (0.45 + i * 0.12), h * 0.60)
        ..quadraticBezierTo(w * (0.6 + i * 0.1), h * 0.72, w * (0.8 + i * 0.08), h * 0.85);
      canvas.drawPath(furrow, furrowPaint);
    }

    // Ground soil foreground
    final groundPaint = Paint()..color = const Color(0xFFE4D5BE);
    final groundPath = Path()
      ..moveTo(0, h * 0.68)
      ..quadraticBezierTo(w * 0.5, h * 0.65, w, h * 0.69)
      ..lineTo(w, h)
      ..lineTo(0, h)
      ..close();
    canvas.drawPath(groundPath, groundPaint);

    // 3. Charpai (Wooden Cot)
    final woodPaint = Paint()
      ..color = const Color(0xFF8B5A2B)
      ..strokeWidth = 5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final cotLeft = w * 0.28;
    final cotRight = w * 0.92;
    final cotTop = h * 0.66;
    final cotBottom = h * 0.74;

    // Legs
    canvas.drawLine(Offset(cotLeft + 10, cotTop), Offset(cotLeft + 8, h * 0.88), woodPaint);
    canvas.drawLine(Offset(cotRight - 10, cotTop), Offset(cotRight - 8, h * 0.88), woodPaint);
    canvas.drawLine(Offset(w * 0.45, cotTop + 4), Offset(w * 0.44, h * 0.85), woodPaint);
    canvas.drawLine(Offset(w * 0.72, cotTop + 4), Offset(w * 0.71, h * 0.85), woodPaint);

    // Frame
    final framePaint = Paint()
      ..color = const Color(0xFFA06D3B)
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(Offset(cotLeft, cotTop + 2), Offset(cotRight, cotTop + 2), framePaint);

    // Woven Weave Mat on Cot
    final weavePaint = Paint()
      ..color = const Color(0xFFD49B5B)
      ..strokeWidth = 2.5;
    for (double x = cotLeft + 6; x < cotRight - 6; x += 7) {
      canvas.drawLine(Offset(x, cotTop - 2), Offset(x + 4, cotBottom), weavePaint);
    }
    for (double y = cotTop - 2; y < cotBottom; y += 5) {
      canvas.drawLine(Offset(cotLeft + 4, y), Offset(cotRight - 4, y + 2), weavePaint);
    }

    // 4. Farmer Figure
    final farmerCenterX = w * 0.58;
    final farmerY = h * 0.42;

    // Turban (Orange)
    final turbanPaint = Paint()..color = const Color(0xFFF2781E);
    canvas.drawOval(
      Rect.fromCenter(center: Offset(farmerCenterX, farmerY + 12), width: 34, height: 26),
      turbanPaint,
    );
    canvas.drawCircle(Offset(farmerCenterX + 4, farmerY + 8), 10, turbanPaint);

    // Face / Head
    final skinPaint = Paint()..color = const Color(0xFFD99B6A);
    canvas.drawOval(
      Rect.fromCenter(center: Offset(farmerCenterX, farmerY + 24), width: 22, height: 24),
      skinPaint,
    );

    // Beard / Mustache (White/Grey)
    final beardPaint = Paint()..color = const Color(0xFFE8ECE8);
    canvas.drawOval(
      Rect.fromCenter(center: Offset(farmerCenterX, farmerY + 30), width: 16, height: 12),
      beardPaint,
    );

    // Eyes & Smile
    final eyePaint = Paint()
      ..color = const Color(0xFF333333)
      ..strokeWidth = 1.8
      ..style = PaintingStyle.stroke;
    canvas.drawArc(
      Rect.fromCenter(center: Offset(farmerCenterX - 4, farmerY + 20), width: 4, height: 3),
      math.pi,
      math.pi,
      false,
      eyePaint,
    );
    canvas.drawArc(
      Rect.fromCenter(center: Offset(farmerCenterX + 4, farmerY + 20), width: 4, height: 3),
      math.pi,
      math.pi,
      false,
      eyePaint,
    );
    // Smile
    canvas.drawArc(
      Rect.fromCenter(center: Offset(farmerCenterX, farmerY + 26), width: 8, height: 4),
      0,
      math.pi,
      false,
      eyePaint,
    );

    // Kurta Body (Orange/Ochre)
    final kurtaPaint = Paint()..color = const Color(0xFFE87722);
    final kurtaPath = Path()
      ..moveTo(farmerCenterX - 14, farmerY + 34)
      ..quadraticBezierTo(farmerCenterX - 22, farmerY + 60, farmerCenterX - 26, farmerY + 76)
      ..lineTo(farmerCenterX + 26, farmerY + 76)
      ..quadraticBezierTo(farmerCenterX + 22, farmerY + 60, farmerCenterX + 14, farmerY + 34)
      ..close();
    canvas.drawPath(kurtaPath, kurtaPaint);

    // White Dhoti / Pajama Pants
    final dhotiPaint = Paint()..color = const Color(0xFFF7F5EE);
    final dhotiPath = Path()
      ..moveTo(farmerCenterX - 24, farmerY + 74)
      ..lineTo(farmerCenterX - 28, farmerY + 104)
      ..lineTo(farmerCenterX - 6, farmerY + 104)
      ..lineTo(farmerCenterX, farmerY + 84)
      ..lineTo(farmerCenterX + 6, farmerY + 104)
      ..lineTo(farmerCenterX + 28, farmerY + 104)
      ..lineTo(farmerCenterX + 24, farmerY + 74)
      ..close();
    canvas.drawPath(dhotiPath, dhotiPaint);

    // Feet
    canvas.drawOval(
      Rect.fromCenter(center: Offset(farmerCenterX - 16, farmerY + 106), width: 16, height: 7),
      skinPaint,
    );
    canvas.drawOval(
      Rect.fromCenter(center: Offset(farmerCenterX + 16, farmerY + 106), width: 16, height: 7),
      skinPaint,
    );

    // Arms & Hands holding Phone
    final armPaint = Paint()
      ..color = const Color(0xFFE87722)
      ..strokeWidth = 8
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    // Left Arm reaching to phone
    final leftArm = Path()
      ..moveTo(farmerCenterX - 14, farmerY + 44)
      ..quadraticBezierTo(farmerCenterX - 24, farmerY + 54, farmerCenterX - 18, farmerY + 64);
    canvas.drawPath(leftArm, armPaint);

    // Right Arm pointing
    final rightArm = Path()
      ..moveTo(farmerCenterX + 14, farmerY + 44)
      ..quadraticBezierTo(farmerCenterX + 4, farmerY + 56, farmerCenterX - 8, farmerY + 60);
    canvas.drawPath(rightArm, armPaint);

    // 5. Smartphone in hand
    final phoneRect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: Offset(farmerCenterX - 16, farmerY + 62), width: 22, height: 38),
      const Radius.circular(4),
    );
    final phoneBodyPaint = Paint()..color = const Color(0xFF1E261E);
    canvas.drawRRect(phoneRect, phoneBodyPaint);

    // Phone Screen (Green Kisan Mithra UI)
    final phoneScreenRect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: Offset(farmerCenterX - 16, farmerY + 62), width: 18, height: 32),
      const Radius.circular(2),
    );
    final phoneScreenPaint = Paint()..color = const Color(0xFFEBF7EB);
    canvas.drawRRect(phoneScreenRect, phoneScreenPaint);

    // Mini green header on phone
    final miniHeaderPaint = Paint()..color = AppColors.primaryGreen;
    canvas.drawRect(
      Rect.fromLTWH(farmerCenterX - 25, farmerY + 48, 18, 6),
      miniHeaderPaint,
    );

    // 6. Big Phone Screen Backdrop on Left (matches screenshot artwork)
    final bigPhoneRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(w * 0.08, h * 0.12, w * 0.38, h * 0.78),
      const Radius.circular(16),
    );
    final bigPhoneFramePaint = Paint()
      ..color = const Color(0xFF2B332B)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5;
    final bigPhoneBgPaint = Paint()..color = Colors.white;

    canvas.drawRRect(bigPhoneRRect, bigPhoneBgPaint);
    canvas.drawRRect(bigPhoneRRect, bigPhoneFramePaint);

    // Big phone app bar
    final miniTopBarPaint = Paint()..color = const Color(0xFF2E7D32);
    canvas.drawRRect(
      RRect.fromRectAndCorners(
        Rect.fromLTWH(w * 0.08, h * 0.12, w * 0.38, 20),
        topLeft: const Radius.circular(14),
        topRight: const Radius.circular(14),
      ),
      miniTopBarPaint,
    );

    // Mini text lines on big phone
    final miniTextPaint = Paint()
      ..color = const Color(0xFF333333)
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(
      Offset(w * 0.12, h * 0.28),
      Offset(w * 0.36, h * 0.28),
      miniTextPaint,
    );

    // Mini input box on big phone
    final miniBoxPaint = Paint()
      ..color = const Color(0xFFF1F1ED)
      ..style = PaintingStyle.fill;
    final miniBoxBorder = Paint()
      ..color = const Color(0xFFD6D3CB)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;
    final miniInputRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(w * 0.12, h * 0.36, w * 0.30, 22),
      const Radius.circular(4),
    );
    canvas.drawRRect(miniInputRRect, miniBoxPaint);
    canvas.drawRRect(miniInputRRect, miniBoxBorder);

    // Mini button on big phone
    final miniBtnPaint = Paint()..color = const Color(0xFF2E7D32);
    final miniBtnRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(w * 0.14, h * 0.54, w * 0.26, 16),
      const Radius.circular(4),
    );
    canvas.drawRRect(miniBtnRRect, miniBtnPaint);

    // 7. Foreground Wheat Stalks & Green Foliage Left & Right
    final wheatPaint = Paint()
      ..color = const Color(0xFFE2A745)
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    final wheatSpikePaint = Paint()..color = const Color(0xFFF5BE58);

    // Left Wheat Stalks
    for (int i = 0; i < 4; i++) {
      final sx = w * (0.02 + i * 0.05);
      final sy = h * 0.95;
      final topY = h * (0.50 + i * 0.08);
      canvas.drawLine(Offset(sx, sy), Offset(sx + 8, topY), wheatPaint);
      // Spikelets
      for (double sp = topY; sp < topY + 30; sp += 6) {
        canvas.drawOval(
          Rect.fromCenter(center: Offset(sx + 5, sp), width: 7, height: 4),
          wheatSpikePaint,
        );
      }
    }

    // Right Wheat Stalks
    for (int i = 0; i < 3; i++) {
      final sx = w * (0.86 + i * 0.04);
      final sy = h * 0.95;
      final topY = h * (0.55 + i * 0.06);
      canvas.drawLine(Offset(sx, sy), Offset(sx - 6, topY), wheatPaint);
      for (double sp = topY; sp < topY + 28; sp += 6) {
        canvas.drawOval(
          Rect.fromCenter(center: Offset(sx - 3, sp), width: 7, height: 4),
          wheatSpikePaint,
        );
      }
    }

    // Leaf border overlay corners
    final leafPaint = Paint()..color = const Color(0xFF4C7D38).withAlpha(180);
    for (int i = 0; i < 5; i++) {
      canvas.drawOval(
        Rect.fromCenter(center: Offset(w * (0.04 + i * 0.06), h * 0.04 + (i % 2) * 8), width: 14, height: 8),
        leafPaint,
      );
      canvas.drawOval(
        Rect.fromCenter(center: Offset(w * (0.76 + i * 0.05), h * 0.04 + (i % 2) * 6), width: 14, height: 8),
        leafPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
