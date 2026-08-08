import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static const Color primaryGreen = Color(0xFF2E7D32);
  static const Color primaryDarkGreen = Color(0xFF1B6327);
  static const Color backgroundLight = Color(0xFFF9F7F2);
  static const Color textDark = Color(0xFF1B2A1C);
  static const Color textSecondaryDark = Color(0xFF4A554A);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryGreen,
      scaffoldBackgroundColor: backgroundLight,
      colorScheme: const ColorScheme.light(
        primary: primaryGreen,
        onPrimary: Colors.white,
        secondary: Color(0xFFE89A3C),
        onSecondary: Colors.white,
        surface: Colors.white,
        onSurface: textDark,
        error: Color(0xFFD32F2F),
        onError: Colors.white,
      ),

      // Touch targets: min 56dp for accessibility
      materialTapTargetSize: MaterialTapTargetSize.padded,
      
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(56), // Min 56dp touch target
          backgroundColor: primaryDarkGreen,
          foregroundColor: Colors.white,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.2,
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(56), // Min 56dp touch target
          foregroundColor: primaryDarkGreen,
          side: const BorderSide(color: primaryDarkGreen, width: 2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.2,
          ),
        ),
      ),

      // High-contrast Typography for Farmers
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          color: textDark,
          height: 1.2,
          letterSpacing: -0.5,
        ),
        headlineMedium: TextStyle(
          fontSize: 26,
          fontWeight: FontWeight.w800,
          color: textDark,
          height: 1.25,
          letterSpacing: -0.3,
        ),
        headlineSmall: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w800,
          color: textDark,
          letterSpacing: -0.2,
        ),
        titleLarge: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: textDark,
        ),
        titleMedium: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: textDark,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: textDark,
          height: 1.4,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: textSecondaryDark,
          height: 1.35,
        ),
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: backgroundLight,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: textDark, size: 26),
        titleTextStyle: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w800,
          color: textDark,
        ),
      ),
    );
  }
}
