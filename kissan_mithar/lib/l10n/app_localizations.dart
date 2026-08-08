import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_hi.dart';
import 'app_localizations_kn.dart';
import 'app_localizations_te.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('hi'),
    Locale('kn'),
    Locale('te'),
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'KISSAN MITHAR'**
  String get appName;

  /// No description provided for @tagline.
  ///
  /// In en, this message translates to:
  /// **'Farmer-First Mobile App'**
  String get tagline;

  /// No description provided for @home.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// No description provided for @notifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get notifications;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @myActivity.
  ///
  /// In en, this message translates to:
  /// **'My Activity'**
  String get myActivity;

  /// No description provided for @support.
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get support;

  /// No description provided for @goodMorning.
  ///
  /// In en, this message translates to:
  /// **'Good Morning'**
  String get goodMorning;

  /// No description provided for @goodAfternoon.
  ///
  /// In en, this message translates to:
  /// **'Good Afternoon'**
  String get goodAfternoon;

  /// No description provided for @goodEvening.
  ///
  /// In en, this message translates to:
  /// **'Good Evening'**
  String get goodEvening;

  /// No description provided for @todayForecast.
  ///
  /// In en, this message translates to:
  /// **'TODAY\'S FORECAST'**
  String get todayForecast;

  /// No description provided for @tapForForecast.
  ///
  /// In en, this message translates to:
  /// **'Tap to view full forecast'**
  String get tapForForecast;

  /// No description provided for @humidity.
  ///
  /// In en, this message translates to:
  /// **'Humidity'**
  String get humidity;

  /// No description provided for @wind.
  ///
  /// In en, this message translates to:
  /// **'Wind'**
  String get wind;

  /// No description provided for @rain.
  ///
  /// In en, this message translates to:
  /// **'Rain'**
  String get rain;

  /// No description provided for @quickActions.
  ///
  /// In en, this message translates to:
  /// **'Quick Services'**
  String get quickActions;

  /// No description provided for @orchardPlanning.
  ///
  /// In en, this message translates to:
  /// **'Orchard Planning'**
  String get orchardPlanning;

  /// No description provided for @orchardPlanningSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Custom layout & tree plantation roadmap'**
  String get orchardPlanningSubtitle;

  /// No description provided for @expertConsultation.
  ///
  /// In en, this message translates to:
  /// **'Expert Consultation'**
  String get expertConsultation;

  /// No description provided for @expertConsultationSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Talk 1-on-1 with certified agronomists'**
  String get expertConsultationSubtitle;

  /// No description provided for @liveWeather.
  ///
  /// In en, this message translates to:
  /// **'Live Weather'**
  String get liveWeather;

  /// No description provided for @liveWeatherSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Rain alerts, radar & farming advisory'**
  String get liveWeatherSubtitle;

  /// No description provided for @recentUpdates.
  ///
  /// In en, this message translates to:
  /// **'Recent Updates'**
  String get recentUpdates;

  /// No description provided for @noRecentUpdates.
  ///
  /// In en, this message translates to:
  /// **'No Recent Updates'**
  String get noRecentUpdates;

  /// No description provided for @noRecentUpdatesSubtitle.
  ///
  /// In en, this message translates to:
  /// **'You are all caught up with farming advisories.'**
  String get noRecentUpdatesSubtitle;

  /// No description provided for @loadingUpdates.
  ///
  /// In en, this message translates to:
  /// **'Loading latest farm updates...'**
  String get loadingUpdates;

  /// No description provided for @viewAll.
  ///
  /// In en, this message translates to:
  /// **'View All'**
  String get viewAll;

  /// No description provided for @landSizeTitle.
  ///
  /// In en, this message translates to:
  /// **'How much land do you have?'**
  String get landSizeTitle;

  /// No description provided for @acres.
  ///
  /// In en, this message translates to:
  /// **'ACRES'**
  String get acres;

  /// No description provided for @guntas.
  ///
  /// In en, this message translates to:
  /// **'Guntas'**
  String get guntas;

  /// No description provided for @cents.
  ///
  /// In en, this message translates to:
  /// **'Cents'**
  String get cents;

  /// No description provided for @extraGuntas.
  ///
  /// In en, this message translates to:
  /// **'EXTRA GUNTAS'**
  String get extraGuntas;

  /// No description provided for @extraCents.
  ///
  /// In en, this message translates to:
  /// **'EXTRA CENTS'**
  String get extraCents;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @continueText.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continueText;

  /// No description provided for @soilTypeTitle.
  ///
  /// In en, this message translates to:
  /// **'What is your soil type?'**
  String get soilTypeTitle;

  /// No description provided for @soilTypeSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Select the type that best matches your land to get accurate farming advice.'**
  String get soilTypeSubtitle;

  /// No description provided for @redSoil.
  ///
  /// In en, this message translates to:
  /// **'Red Soil'**
  String get redSoil;

  /// No description provided for @blackSoil.
  ///
  /// In en, this message translates to:
  /// **'Black Soil'**
  String get blackSoil;

  /// No description provided for @sandySoil.
  ///
  /// In en, this message translates to:
  /// **'Sandy Soil'**
  String get sandySoil;

  /// No description provided for @claySoil.
  ///
  /// In en, this message translates to:
  /// **'Clay Soil'**
  String get claySoil;

  /// No description provided for @notSure.
  ///
  /// In en, this message translates to:
  /// **'Not Sure?'**
  String get notSure;

  /// No description provided for @uploadDocument.
  ///
  /// In en, this message translates to:
  /// **'Upload Document'**
  String get uploadDocument;

  /// No description provided for @takePhoto.
  ///
  /// In en, this message translates to:
  /// **'Take Photo'**
  String get takePhoto;

  /// No description provided for @uploadPdf.
  ///
  /// In en, this message translates to:
  /// **'Upload PDF'**
  String get uploadPdf;

  /// No description provided for @fromGallery.
  ///
  /// In en, this message translates to:
  /// **'From Gallery'**
  String get fromGallery;

  /// No description provided for @skip.
  ///
  /// In en, this message translates to:
  /// **'I don\'t have this — Skip'**
  String get skip;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'hi', 'kn', 'te'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'hi':
      return AppLocalizationsHi();
    case 'kn':
      return AppLocalizationsKn();
    case 'te':
      return AppLocalizationsTe();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
