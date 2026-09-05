import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kissan_mithar/core/localization/app_language.dart';
import 'package:kissan_mithar/l10n/app_localizations.dart';
import 'package:kissan_mithar/features/profile/models/farmer_profile_model.dart';
import 'package:kissan_mithar/features/profile/presentation/screens/downloads_screen.dart';
import 'package:kissan_mithar/features/profile/presentation/screens/profile_screen.dart';
import 'package:kissan_mithar/features/profile/providers/profile_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('FarmerProfile Model Tests', () {
    test('initialMock() returns valid default farmer', () {
      final farmer = FarmerProfile.initialMock();
      expect(farmer.id, 'FARMER-9821');
      expect(farmer.name, 'Ramesh Patel');
      expect(farmer.phoneNumber, '+91 98765 43210');
      expect(farmer.village, 'Khed');
      expect(farmer.district, 'Pune');
      expect(farmer.stateName, 'Maharashtra');
      expect(farmer.landAcres, 2.5);
      expect(farmer.primaryCrop, 'Mango & Guava');
      expect(farmer.languageCode, 'en');
    });

    test('JSON roundtrip serialization/deserialization works', () {
      final original = FarmerProfile(
        id: 'F-123',
        name: 'Suresh Kumar',
        phoneNumber: '+91 99999 12345',
        photoUrl: 'https://example.com/photo.jpg',
        village: 'Nandyal',
        district: 'Kurnool',
        stateName: 'Andhra Pradesh',
        landAcres: 5.0,
        primaryCrop: 'Cotton & Paddy',
        languageCode: 'te',
        createdAt: DateTime(2026, 1, 1),
        updatedAt: DateTime(2026, 6, 15),
      );

      final json = original.toJson();
      expect(json['id'], 'F-123');
      expect(json['name'], 'Suresh Kumar');
      expect(json['photo_url'], 'https://example.com/photo.jpg');
      expect(json['village'], 'Nandyal');
      expect(json['district'], 'Kurnool');
      expect(json['state'], 'Andhra Pradesh');
      expect(json['land_acres'], 5.0);
      expect(json['primary_crop'], 'Cotton & Paddy');
      expect(json['language_code'], 'te');

      final parsed = FarmerProfile.fromJson(json);
      expect(parsed.id, 'F-123');
      expect(parsed.name, 'Suresh Kumar');
      expect(parsed.photoUrl, 'https://example.com/photo.jpg');
      expect(parsed.village, 'Nandyal');
      expect(parsed.district, 'Kurnool');
      expect(parsed.stateName, 'Andhra Pradesh');
      expect(parsed.landAcres, 5.0);
      expect(parsed.primaryCrop, 'Cotton & Paddy');
      expect(parsed.languageCode, 'te');
    });

    test('fromJson handles missing optional fields gracefully', () {
      final json = {
        'name': 'Test Farmer',
        'phone': '+91 12345 67890',
      };

      final parsed = FarmerProfile.fromJson(json);
      expect(parsed.name, 'Test Farmer');
      expect(parsed.phoneNumber, '+91 12345 67890');
      expect(parsed.photoUrl, isNull);
      expect(parsed.village, '');
      expect(parsed.district, '');
      expect(parsed.languageCode, 'en');
    });

    test('copyWith creates modified copy preserving other fields', () {
      final original = FarmerProfile.initialMock();
      final modified = original.copyWith(
        name: 'New Name',
        village: 'New Village',
        landAcres: 10.0,
      );

      expect(modified.name, 'New Name');
      expect(modified.village, 'New Village');
      expect(modified.landAcres, 10.0);
      expect(modified.district, original.district); // Preserved
      expect(modified.phoneNumber, original.phoneNumber); // Preserved
      expect(modified.primaryCrop, original.primaryCrop); // Preserved
    });
  });

  group('ProfileNotifier State Tests', () {
    test('Initial state has valid mock profile', () {
      final notifier = ProfileNotifier();
      expect(notifier.state.name, 'Ramesh Patel');
      expect(notifier.state.village, 'Khed');
      expect(notifier.state.district, 'Pune');
      expect(notifier.state.landAcres, 2.5);
      expect(notifier.state.isLoading, false);
      expect(notifier.state.isUploadingPhoto, false);
    });

    test('updateProfile updates state correctly', () async {
      final notifier = ProfileNotifier();
      final result = await notifier.updateProfile(
        name: 'Updated Name',
        village: 'Updated Village',
        district: 'Updated District',
        landAcres: 4.5,
        primaryCrop: 'Rice',
      );

      expect(result, true);
      expect(notifier.state.name, 'Updated Name');
      expect(notifier.state.village, 'Updated Village');
      expect(notifier.state.district, 'Updated District');
      expect(notifier.state.landAcres, 4.5);
      expect(notifier.state.primaryCrop, 'Rice');
    });

    test('setLanguage updates language code in profile', () async {
      final notifier = ProfileNotifier();
      await notifier.setLanguage(AppLanguage.telugu);

      expect(notifier.state.languageCode, 'te');
    });

    test('logout resets profile to initial mock state', () async {
      final notifier = ProfileNotifier();
      await notifier.updateProfile(name: 'Changed Name');
      expect(notifier.state.name, 'Changed Name');

      await notifier.logout();
      expect(notifier.state.name, 'Ramesh Patel');
      expect(notifier.state.isLoading, false);
    });

    test('ProfileState backward compatibility getters work', () {
      final notifier = ProfileNotifier();
      final state = notifier.state;

      // Check convenience getters match profile fields
      expect(state.name, state.profile.name);
      expect(state.phone, state.profile.phoneNumber);
      expect(state.village, state.profile.village);
      expect(state.district, state.profile.district);
      expect(state.stateName, state.profile.stateName);
      expect(state.landAcres, state.profile.landAcres);
      expect(state.primaryCrop, state.profile.primaryCrop);
    });
  });

  group('CachedDownload Model Tests', () {
    test('formattedDate returns Today for recent downloads', () {
      final download = CachedDownload(
        id: 'DL-T',
        title: 'Test',
        subtitle: 'Sub',
        filePath: '/test.pdf',
        fileSize: '1 MB',
        downloadedAt: DateTime.now(),
        type: DownloadType.orchardPlan,
      );
      expect(download.formattedDate, 'Today');
    });

    test('formattedDate returns Yesterday for 1-day old', () {
      final download = CachedDownload(
        id: 'DL-Y',
        title: 'Test',
        subtitle: 'Sub',
        filePath: '/test.pdf',
        fileSize: '1 MB',
        downloadedAt: DateTime.now().subtract(const Duration(days: 1)),
        type: DownloadType.consultationReport,
      );
      expect(download.formattedDate, 'Yesterday');
    });

    test('Each download type has distinct icon and color', () {
      final orchardDl = CachedDownload(
        id: 'O',
        title: 'T',
        subtitle: 'S',
        filePath: '/a.pdf',
        fileSize: '1 MB',
        downloadedAt: DateTime.now(),
        type: DownloadType.orchardPlan,
      );
      expect(orchardDl.icon, Icons.park_rounded);
      expect(orchardDl.iconColor, const Color(0xFF2E7D32));

      final invoiceDl = CachedDownload(
        id: 'I',
        title: 'T',
        subtitle: 'S',
        filePath: '/b.pdf',
        fileSize: '1 MB',
        downloadedAt: DateTime.now(),
        type: DownloadType.invoice,
      );
      expect(invoiceDl.icon, Icons.receipt_long_rounded);
      expect(invoiceDl.iconColor, const Color(0xFFE65100));
    });
  });

  group('Profile UI Widget Tests', () {
    testWidgets('ProfileScreen renders farmer details and menu items',
        (tester) async {
      tester.view.physicalSize = const Size(500, 2000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            localizationsDelegates: [
              AppLocalizations.delegate,
            ],
            home: ProfileScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Check farmer name
      expect(find.text('Ramesh Patel'), findsOneWidget);

      // Check location
      expect(find.text('Khed, Pune'), findsOneWidget);
      expect(find.text('Maharashtra'), findsOneWidget);

      // Check farm stats
      expect(find.text('2.5 Acres'), findsOneWidget);
      expect(find.text('Mango & Guava'), findsOneWidget);

      // Check language preference section
      expect(find.text('Language Preference'), findsOneWidget);

      // Check 4 language chips exist
      for (final lang in AppLanguage.values) {
        expect(find.text(lang.nativeLabel), findsOneWidget);
      }

      // Check menu items
      expect(find.text('Saved Orchard Plans'), findsOneWidget);
      expect(find.text('Call History'), findsOneWidget);
      expect(find.text('Downloads'), findsOneWidget);
      expect(find.text('Settings'), findsOneWidget);
      expect(find.text('Logout'), findsOneWidget);

      // Check footer
      expect(find.text('KISSAN MITHAR v1.0.0'), findsOneWidget);
    });

    testWidgets('DownloadsScreen renders cached PDF cards', (tester) async {
      tester.view.physicalSize = const Size(500, 2000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(
            home: DownloadsScreen(),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Check header
      expect(find.text('Downloads'), findsOneWidget);

      // Check mock download items
      expect(find.text('Orchard Plantation Plan — 2.5 Acres'), findsOneWidget);
      expect(
          find.text('Consultation Report — Dr. Sunil Rao'), findsOneWidget);
      expect(find.text('Service Invoice — July 2026'), findsOneWidget);

      // Check storage info
      expect(find.text('3 files cached locally'), findsOneWidget);
      expect(find.text('Clear Cache'), findsOneWidget);
    });
  });
}
