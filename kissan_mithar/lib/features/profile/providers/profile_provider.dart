import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/localization/app_language.dart';
import '../../../core/network/network_client.dart';
import '../../../core/services/cloudinary_service.dart';
import '../models/farmer_profile_model.dart';

class ProfileState {
  final FarmerProfile profile;
  final bool isLoading;
  final bool isUploadingPhoto;
  final String? errorMessage;
  final String? successMessage;

  const ProfileState({
    required this.profile,
    this.isLoading = false,
    this.isUploadingPhoto = false,
    this.errorMessage,
    this.successMessage,
  });

  // Convenience getters for backward compatibility
  String get name => profile.name;
  String get phone => profile.phoneNumber;
  String get village => profile.village;
  String get district => profile.district;
  String get stateName => profile.stateName;
  double get landAcres => profile.landAcres;
  String get primaryCrop => profile.primaryCrop;
  String? get photoUrl => profile.photoUrl;
  String get languageCode => profile.languageCode;

  ProfileState copyWith({
    FarmerProfile? profile,
    bool? isLoading,
    bool? isUploadingPhoto,
    String? errorMessage,
    String? successMessage,
  }) {
    return ProfileState(
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
      isUploadingPhoto: isUploadingPhoto ?? this.isUploadingPhoto,
      errorMessage: errorMessage,
      successMessage: successMessage,
    );
  }
}

class ProfileNotifier extends StateNotifier<ProfileState> {
  final NetworkClient _networkClient;
  static const String _prefProfileCacheKey = 'cached_farmer_profile';

  ProfileNotifier({NetworkClient? networkClient})
      : _networkClient = networkClient ?? NetworkClient(),
        super(ProfileState(profile: FarmerProfile.initialMock())) {
    _loadCachedProfileAndFetch();
  }

  Future<void> _loadCachedProfileAndFetch() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedJson = prefs.getString(_prefProfileCacheKey);
      if (cachedJson != null && cachedJson.isNotEmpty) {
        final data = jsonDecode(cachedJson) as Map<String, dynamic>;
        state = state.copyWith(profile: FarmerProfile.fromJson(data));
      }
    } catch (_) {
      // Continue safely
    }

    await fetchProfile();
  }

  Future<void> fetchProfile() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final response = await _networkClient.get<dynamic>('/farmers/me');
      final data = response.data;

      if (data is Map<String, dynamic>) {
        final fetched = FarmerProfile.fromJson(data);
        state = state.copyWith(profile: fetched, isLoading: false);
        _cacheProfile(fetched);

        try {
          final appLang = AppLanguage.values.firstWhere(
            (l) => l.code == fetched.languageCode,
            orElse: () => AppLanguage.english,
          );
          LanguageProvider().setLanguage(appLang);
        } catch (_) {}
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      debugPrint('Fetch farmer profile fallback: $e');
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> updateProfile({
    String? name,
    String? village,
    String? district,
    String? stateName,
    double? landAcres,
    String? primaryCrop,
  }) async {
    final updated = state.profile.copyWith(
      name: name,
      village: village,
      district: district,
      stateName: stateName,
      landAcres: landAcres,
      primaryCrop: primaryCrop,
    );

    state = state.copyWith(profile: updated, isLoading: true);
    _cacheProfile(updated);

    try {
      final payload = {
        'name': updated.name,
        'village': updated.village,
        'district': updated.district,
        'state': updated.stateName,
        'land_acres': updated.landAcres,
        'primary_crop': updated.primaryCrop,
      };

      await _networkClient.patch<dynamic>(
        '/farmers/me',
        data: payload,
      );

      state = state.copyWith(
        isLoading: false,
        successMessage: 'Profile updated successfully',
      );
      return true;
    } catch (e) {
      debugPrint('Update profile backend fallback: $e');
      state = state.copyWith(
        isLoading: false,
        successMessage: 'Profile updated locally',
      );
      return true;
    }
  }

  Future<bool> updateProfilePhoto(String localFilePath) async {
    state = state.copyWith(isUploadingPhoto: true, errorMessage: null);

    try {
      // 1. Upload to Cloudinary
      final uploadedUrl = await CloudinaryService.uploadImage(localFilePath);

      // 2. Update local state
      final updated = state.profile.copyWith(photoUrl: uploadedUrl);
      state = state.copyWith(profile: updated, isUploadingPhoto: false);
      _cacheProfile(updated);

      // 3. Sync with backend
      await _networkClient.patch<dynamic>(
        '/farmers/me',
        data: {'photo_url': uploadedUrl},
      );

      return true;
    } catch (e) {
      debugPrint('Profile photo upload error: $e');
      state = state.copyWith(
        isUploadingPhoto: false,
        errorMessage: 'Failed to upload photo. Please try again.',
      );
      return false;
    }
  }

  Future<void> setLanguage(AppLanguage language) async {
    // 1. Update app-wide language immediately
    LanguageProvider().setLanguage(language);

    // 2. Update profile state
    final updated = state.profile.copyWith(languageCode: language.code);
    state = state.copyWith(profile: updated);
    _cacheProfile(updated);

    // 3. Sync preference with backend
    try {
      await _networkClient.patch<dynamic>(
        '/farmers/me',
        data: {'language_code': language.code},
      );
    } catch (e) {
      debugPrint('Language preference sync fallback: $e');
    }
  }

  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    } catch (_) {}

    try {
      if (Supabase.instance.isInitialized) {
        await Supabase.instance.client.auth.signOut();
      }
    } catch (_) {}

    state = ProfileState(profile: FarmerProfile.initialMock());
  }

  Future<void> _cacheProfile(FarmerProfile profile) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefProfileCacheKey, jsonEncode(profile.toJson()));
    } catch (_) {}
  }
}

final profileProvider =
    StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  return ProfileNotifier();
});
