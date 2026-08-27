import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppLanguage {
  english('en', 'English', 'English'),
  hindi('hi', 'हिंदी', 'Hindi'),
  telugu('te', 'తెలుగు', 'Telugu'),
  kannada('kn', 'ಕನ್ನಡ', 'Kannada');

  final String code;
  final String nativeName;
  final String englishName;

  const AppLanguage(this.code, this.nativeName, this.englishName);

  Locale get locale => Locale(code);
  String get label => nativeName;
  String get nativeLabel => nativeName;
  String get englishLabel => englishName;

  static AppLanguage fromCode(String code) {
    return AppLanguage.values.firstWhere(
      (lang) => lang.code == code,
      orElse: () => AppLanguage.english,
    );
  }
}

class LanguageProvider extends ChangeNotifier {
  static final LanguageProvider _instance = LanguageProvider._internal();
  factory LanguageProvider() => _instance;
  LanguageProvider._internal();

  AppLanguage _currentLanguage = AppLanguage.english;
  AppLanguage get currentLanguage => _currentLanguage;

  void setLanguage(AppLanguage language) {
    _currentLanguage = language;
    notifyListeners();
  }
}

// Riverpod Provider for Language
final languageNotifierProvider = StateNotifierProvider<LanguageStateNotifier, AppLanguage>((ref) {
  return LanguageStateNotifier();
});
final languageProvider = languageNotifierProvider;

class LanguageStateNotifier extends StateNotifier<AppLanguage> {
  static const String _prefLanguageKey = 'kissan_auth_language';

  LanguageStateNotifier() : super(AppLanguage.english) {
    _loadPersistedLanguage();
  }

  /// Restores the previously selected language from SharedPreferences
  Future<void> _loadPersistedLanguage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final langCode = prefs.getString(_prefLanguageKey);
      if (langCode != null && langCode.isNotEmpty) {
        final lang = AppLanguage.fromCode(langCode);
        state = lang;
        LanguageProvider().setLanguage(lang);
      }
    } catch (e) {
      debugPrint('[LanguageStateNotifier] Failed to load persisted language: $e');
    }
  }

  void setLanguage(AppLanguage lang) {
    state = lang;
    LanguageProvider().setLanguage(lang);
    // Persist language choice
    SharedPreferences.getInstance().then((prefs) {
      prefs.setString(_prefLanguageKey, lang.code);
    });
  }
}

