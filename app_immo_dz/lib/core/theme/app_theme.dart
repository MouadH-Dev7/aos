import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

class AppTheme {
  const AppTheme._();

  static ThemeData get lightTheme {
    final baseTextTheme = GoogleFonts.interTextTheme();
    final textTheme = baseTextTheme.copyWith(
      displayLarge: GoogleFonts.manrope(textStyle: baseTextTheme.displayLarge),
      displayMedium: GoogleFonts.manrope(textStyle: baseTextTheme.displayMedium),
      displaySmall: GoogleFonts.manrope(textStyle: baseTextTheme.displaySmall),
      headlineLarge: GoogleFonts.manrope(textStyle: baseTextTheme.headlineLarge),
      headlineMedium: GoogleFonts.manrope(textStyle: baseTextTheme.headlineMedium),
      headlineSmall: GoogleFonts.manrope(textStyle: baseTextTheme.headlineSmall),
      titleLarge: GoogleFonts.manrope(textStyle: baseTextTheme.titleLarge),
      titleMedium: GoogleFonts.manrope(textStyle: baseTextTheme.titleMedium),
      titleSmall: GoogleFonts.manrope(textStyle: baseTextTheme.titleSmall),
    );

    return ThemeData(
      textTheme: textTheme,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: AppColors.surface,
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 18,
        ),
        hintStyle: textTheme.bodyMedium?.copyWith(
          color: AppColors.onSurfaceVariant,
          fontWeight: FontWeight.w500,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(20),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          textStyle: textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w700,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
        ),
      ),
      useMaterial3: true,
    );
  }
}
