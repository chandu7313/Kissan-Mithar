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

  /// No description provided for @selectLanguage.
  ///
  /// In en, this message translates to:
  /// **'Select Language / भाषा चुनें'**
  String get selectLanguage;

  /// No description provided for @popularBadge.
  ///
  /// In en, this message translates to:
  /// **'POPULAR'**
  String get popularBadge;

  /// No description provided for @askExperts.
  ///
  /// In en, this message translates to:
  /// **'Ask our experts to identify it for you.'**
  String get askExperts;

  /// No description provided for @editLocation.
  ///
  /// In en, this message translates to:
  /// **'Edit Location'**
  String get editLocation;

  /// No description provided for @villageTown.
  ///
  /// In en, this message translates to:
  /// **'Village / Town'**
  String get villageTown;

  /// No description provided for @district.
  ///
  /// In en, this message translates to:
  /// **'District'**
  String get district;

  /// No description provided for @state.
  ///
  /// In en, this message translates to:
  /// **'State'**
  String get state;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @selectFarmOnMap.
  ///
  /// In en, this message translates to:
  /// **'Select Farm on Map'**
  String get selectFarmOnMap;

  /// No description provided for @dragPinToMark.
  ///
  /// In en, this message translates to:
  /// **'Drag the pin to mark your farm boundary.'**
  String get dragPinToMark;

  /// No description provided for @interactiveMapCoords.
  ///
  /// In en, this message translates to:
  /// **'Interactive Map Coordinates'**
  String get interactiveMapCoords;

  /// No description provided for @farmCoordinatesUpdated.
  ///
  /// In en, this message translates to:
  /// **'Farm coordinates updated!'**
  String get farmCoordinatesUpdated;

  /// No description provided for @confirmLocation.
  ///
  /// In en, this message translates to:
  /// **'Confirm Location'**
  String get confirmLocation;

  /// No description provided for @surveyMapSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Have a survey map from your Panchayat Secretary? Add it here.'**
  String get surveyMapSubtitle;

  /// No description provided for @noFileSelected.
  ///
  /// In en, this message translates to:
  /// **'No file selected'**
  String get noFileSelected;

  /// No description provided for @pdfUploaded.
  ///
  /// In en, this message translates to:
  /// **'PDF Uploaded'**
  String get pdfUploaded;

  /// No description provided for @imageSelected.
  ///
  /// In en, this message translates to:
  /// **'Image Selected'**
  String get imageSelected;

  /// No description provided for @remove.
  ///
  /// In en, this message translates to:
  /// **'Remove'**
  String get remove;

  /// No description provided for @step.
  ///
  /// In en, this message translates to:
  /// **'Step'**
  String get step;

  /// No description provided for @ofText.
  ///
  /// In en, this message translates to:
  /// **'of'**
  String get ofText;

  /// No description provided for @submittingFarmDetails.
  ///
  /// In en, this message translates to:
  /// **'Submitting Farm Details...'**
  String get submittingFarmDetails;

  /// No description provided for @submitFarmPlan.
  ///
  /// In en, this message translates to:
  /// **'Submit Farm Plan'**
  String get submitFarmPlan;

  /// No description provided for @nextStep.
  ///
  /// In en, this message translates to:
  /// **'Next Step'**
  String get nextStep;

  /// No description provided for @takePhotosOfLand.
  ///
  /// In en, this message translates to:
  /// **'Take Photos of Your Land'**
  String get takePhotosOfLand;

  /// No description provided for @frontView.
  ///
  /// In en, this message translates to:
  /// **'Front View'**
  String get frontView;

  /// No description provided for @leftView.
  ///
  /// In en, this message translates to:
  /// **'Left View'**
  String get leftView;

  /// No description provided for @rightView.
  ///
  /// In en, this message translates to:
  /// **'Right View'**
  String get rightView;

  /// No description provided for @backView.
  ///
  /// In en, this message translates to:
  /// **'Back View'**
  String get backView;

  /// No description provided for @uploadFromGalleryInstead.
  ///
  /// In en, this message translates to:
  /// **'Upload from Gallery instead'**
  String get uploadFromGalleryInstead;

  /// No description provided for @additionalPhotosSelected.
  ///
  /// In en, this message translates to:
  /// **'additional photo(s) selected from gallery'**
  String get additionalPhotosSelected;

  /// No description provided for @voiceNote.
  ///
  /// In en, this message translates to:
  /// **'Voice Note (0:15)'**
  String get voiceNote;

  /// No description provided for @tapPlayToListen.
  ///
  /// In en, this message translates to:
  /// **'Tap play to listen'**
  String get tapPlayToListen;

  /// No description provided for @lalMitti.
  ///
  /// In en, this message translates to:
  /// **'Lal Mitti'**
  String get lalMitti;

  /// No description provided for @kaliMitti.
  ///
  /// In en, this message translates to:
  /// **'Kali Mitti'**
  String get kaliMitti;

  /// No description provided for @baluiMitti.
  ///
  /// In en, this message translates to:
  /// **'Balui Mitti'**
  String get baluiMitti;

  /// No description provided for @chikniMitti.
  ///
  /// In en, this message translates to:
  /// **'Chikni Mitti'**
  String get chikniMitti;

  /// No description provided for @planDownloaded.
  ///
  /// In en, this message translates to:
  /// **'Plan Downloaded'**
  String get planDownloaded;

  /// No description provided for @ok.
  ///
  /// In en, this message translates to:
  /// **'OK'**
  String get ok;

  /// No description provided for @changeFile.
  ///
  /// In en, this message translates to:
  /// **'Change File'**
  String get changeFile;

  /// No description provided for @demoNext.
  ///
  /// In en, this message translates to:
  /// **'Demo Next'**
  String get demoNext;

  /// No description provided for @planStatus.
  ///
  /// In en, this message translates to:
  /// **'Plan Status'**
  String get planStatus;

  /// No description provided for @trackProgress.
  ///
  /// In en, this message translates to:
  /// **'Track the progress of your customized orchard plan.'**
  String get trackProgress;

  /// No description provided for @stageSubmittedTitle.
  ///
  /// In en, this message translates to:
  /// **'Submitted'**
  String get stageSubmittedTitle;

  /// No description provided for @stageSubmittedSub.
  ///
  /// In en, this message translates to:
  /// **'Farm details and photos received'**
  String get stageSubmittedSub;

  /// No description provided for @stageReviewTitle.
  ///
  /// In en, this message translates to:
  /// **'Under Review'**
  String get stageReviewTitle;

  /// No description provided for @stageReviewSub.
  ///
  /// In en, this message translates to:
  /// **'Checking soil & climate requirements'**
  String get stageReviewSub;

  /// No description provided for @stageExpertTitle.
  ///
  /// In en, this message translates to:
  /// **'Expert Assigned'**
  String get stageExpertTitle;

  /// No description provided for @stageExpertSub.
  ///
  /// In en, this message translates to:
  /// **'An agronomist is working on it'**
  String get stageExpertSub;

  /// No description provided for @stageReadyTitle.
  ///
  /// In en, this message translates to:
  /// **'Plan Ready'**
  String get stageReadyTitle;

  /// No description provided for @stageReadySub.
  ///
  /// In en, this message translates to:
  /// **'Customized layout & roadmap ready'**
  String get stageReadySub;

  /// No description provided for @stageCompletedTitle.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get stageCompletedTitle;

  /// No description provided for @stageCompletedSub.
  ///
  /// In en, this message translates to:
  /// **'Final plan delivered & consultation active'**
  String get stageCompletedSub;

  /// No description provided for @submissionSummary.
  ///
  /// In en, this message translates to:
  /// **'Submission Summary'**
  String get submissionSummary;

  /// No description provided for @landSizeLabel.
  ///
  /// In en, this message translates to:
  /// **'Land Size'**
  String get landSizeLabel;

  /// No description provided for @submittedOn.
  ///
  /// In en, this message translates to:
  /// **'Submitted on'**
  String get submittedOn;

  /// No description provided for @viewYourReadyPlan.
  ///
  /// In en, this message translates to:
  /// **'View Your Ready Plan'**
  String get viewYourReadyPlan;

  /// No description provided for @backToHome.
  ///
  /// In en, this message translates to:
  /// **'Back to Home'**
  String get backToHome;

  /// No description provided for @landMeasurement.
  ///
  /// In en, this message translates to:
  /// **'Land Measurement'**
  String get landMeasurement;

  /// No description provided for @acreGuntaCent.
  ///
  /// In en, this message translates to:
  /// **'1 Acre = 40 Guntas = 100 Cents'**
  String get acreGuntaCent;

  /// No description provided for @whereIsYourLand.
  ///
  /// In en, this message translates to:
  /// **'Where is your land?'**
  String get whereIsYourLand;

  /// No description provided for @autoDetectLocation.
  ///
  /// In en, this message translates to:
  /// **'Auto-Detect Location'**
  String get autoDetectLocation;

  /// No description provided for @detectingLocation.
  ///
  /// In en, this message translates to:
  /// **'Detecting Location...'**
  String get detectingLocation;

  /// No description provided for @chooseOnMap.
  ///
  /// In en, this message translates to:
  /// **'Choose on Map'**
  String get chooseOnMap;

  /// No description provided for @tapToCapture.
  ///
  /// In en, this message translates to:
  /// **'Tap to capture'**
  String get tapToCapture;

  /// No description provided for @detectedLocation.
  ///
  /// In en, this message translates to:
  /// **'Detected Location'**
  String get detectedLocation;

  /// No description provided for @tellUsAboutYourLand.
  ///
  /// In en, this message translates to:
  /// **'Tell us about your land'**
  String get tellUsAboutYourLand;

  /// No description provided for @enterYourMobileNumber.
  ///
  /// In en, this message translates to:
  /// **'Enter Your Mobile\nNumber'**
  String get enterYourMobileNumber;

  /// No description provided for @weWillSendCode.
  ///
  /// In en, this message translates to:
  /// **'We\'ll send a code to verify.'**
  String get weWillSendCode;

  /// No description provided for @mobileNumber.
  ///
  /// In en, this message translates to:
  /// **'Mobile Number'**
  String get mobileNumber;

  /// No description provided for @mobileNumberHint.
  ///
  /// In en, this message translates to:
  /// **'00000 00000'**
  String get mobileNumberHint;

  /// No description provided for @sending.
  ///
  /// In en, this message translates to:
  /// **'Sending...'**
  String get sending;

  /// No description provided for @sendOtp.
  ///
  /// In en, this message translates to:
  /// **'Send OTP'**
  String get sendOtp;

  /// No description provided for @enterValidMobile.
  ///
  /// In en, this message translates to:
  /// **'Please enter a valid 10-digit mobile number'**
  String get enterValidMobile;

  /// No description provided for @failedToSendOtp.
  ///
  /// In en, this message translates to:
  /// **'Failed to send OTP. Please try again.'**
  String get failedToSendOtp;

  /// No description provided for @verifyYourNumber.
  ///
  /// In en, this message translates to:
  /// **'Verify your number'**
  String get verifyYourNumber;

  /// No description provided for @enter6DigitCode.
  ///
  /// In en, this message translates to:
  /// **'Enter the 6-digit code sent to'**
  String get enter6DigitCode;

  /// No description provided for @pleaseEnterCompleteOtp.
  ///
  /// In en, this message translates to:
  /// **'Please enter the complete 6-digit OTP'**
  String get pleaseEnterCompleteOtp;

  /// No description provided for @invalidOtpTryAgain.
  ///
  /// In en, this message translates to:
  /// **'Invalid OTP. Please try again.'**
  String get invalidOtpTryAgain;

  /// No description provided for @resendOtpIn.
  ///
  /// In en, this message translates to:
  /// **'Resend OTP in '**
  String get resendOtpIn;

  /// No description provided for @resendOtpNow.
  ///
  /// In en, this message translates to:
  /// **'Resend OTP Now'**
  String get resendOtpNow;

  /// No description provided for @verifying.
  ///
  /// In en, this message translates to:
  /// **'Verifying...'**
  String get verifying;

  /// No description provided for @verify.
  ///
  /// In en, this message translates to:
  /// **'Verify'**
  String get verify;

  /// No description provided for @newOtpSent.
  ///
  /// In en, this message translates to:
  /// **'A new OTP has been sent!'**
  String get newOtpSent;

  /// No description provided for @stayUpdatedOnYourFarm.
  ///
  /// In en, this message translates to:
  /// **'Stay Updated On\nYour Farm'**
  String get stayUpdatedOnYourFarm;

  /// No description provided for @enableAlertsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Enable alerts to receive timely weather, expert consultation, and market price updates.'**
  String get enableAlertsSubtitle;

  /// No description provided for @severeWeatherWarnings.
  ///
  /// In en, this message translates to:
  /// **'Severe Weather Warnings'**
  String get severeWeatherWarnings;

  /// No description provided for @severeWeatherDesc.
  ///
  /// In en, this message translates to:
  /// **'Know when unexpected heavy rain or storms approach so you can delay spray cycles and protect crops.'**
  String get severeWeatherDesc;

  /// No description provided for @agronomistCallReminders.
  ///
  /// In en, this message translates to:
  /// **'Agronomist Call Reminders'**
  String get agronomistCallReminders;

  /// No description provided for @agronomistCallDesc.
  ///
  /// In en, this message translates to:
  /// **'Get a reminder 15 minutes before your scheduled voice/video session with certified crop doctors.'**
  String get agronomistCallDesc;

  /// No description provided for @mandiMarketRateAlerts.
  ///
  /// In en, this message translates to:
  /// **'Mandi Market Rate Alerts'**
  String get mandiMarketRateAlerts;

  /// No description provided for @mandiMarketRateDesc.
  ///
  /// In en, this message translates to:
  /// **'Receive real-time price updates for Mango, Guava, Cotton, and crops at your nearest mandi.'**
  String get mandiMarketRateDesc;

  /// No description provided for @orchardPlanReadyAlert.
  ///
  /// In en, this message translates to:
  /// **'Orchard Plan Ready Alert'**
  String get orchardPlanReadyAlert;

  /// No description provided for @orchardPlanReadyDesc.
  ///
  /// In en, this message translates to:
  /// **'Get notified immediately when your customized farm layout and tree plantation map is prepared.'**
  String get orchardPlanReadyDesc;

  /// No description provided for @enablingAlerts.
  ///
  /// In en, this message translates to:
  /// **'Enabling Alerts...'**
  String get enablingAlerts;

  /// No description provided for @turnOnNotifications.
  ///
  /// In en, this message translates to:
  /// **'Turn On Notifications'**
  String get turnOnNotifications;

  /// No description provided for @maybeLaterSkipForNow.
  ///
  /// In en, this message translates to:
  /// **'Maybe Later, Skip for Now'**
  String get maybeLaterSkipForNow;

  /// No description provided for @languagePreference.
  ///
  /// In en, this message translates to:
  /// **'Language Preference'**
  String get languagePreference;

  /// No description provided for @changingLanguageUpdatesApp.
  ///
  /// In en, this message translates to:
  /// **'Changing language updates the entire app instantly'**
  String get changingLanguageUpdatesApp;

  /// No description provided for @savedOrchardPlans.
  ///
  /// In en, this message translates to:
  /// **'Orchard Plans'**
  String get savedOrchardPlans;

  /// No description provided for @callHistory.
  ///
  /// In en, this message translates to:
  /// **'Call History'**
  String get callHistory;

  /// No description provided for @downloads.
  ///
  /// In en, this message translates to:
  /// **'Downloads'**
  String get downloads;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @myConsultations.
  ///
  /// In en, this message translates to:
  /// **'My Consultations'**
  String get myConsultations;

  /// No description provided for @newSession.
  ///
  /// In en, this message translates to:
  /// **'New Session'**
  String get newSession;

  /// No description provided for @upcoming.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get upcoming;

  /// No description provided for @pastHistory.
  ///
  /// In en, this message translates to:
  /// **'Past History'**
  String get pastHistory;

  /// No description provided for @noScheduledConsultations.
  ///
  /// In en, this message translates to:
  /// **'You have no scheduled consultations. Connect with an expert today!'**
  String get noScheduledConsultations;

  /// No description provided for @noConsultationsFound.
  ///
  /// In en, this message translates to:
  /// **'No Consultations Found'**
  String get noConsultationsFound;

  /// No description provided for @bookAnExpert.
  ///
  /// In en, this message translates to:
  /// **'Book an Expert'**
  String get bookAnExpert;

  /// No description provided for @noDownloadedFiles.
  ///
  /// In en, this message translates to:
  /// **'No Downloaded Files'**
  String get noDownloadedFiles;

  /// No description provided for @savedReportsAppearHere.
  ///
  /// In en, this message translates to:
  /// **'Your saved reports and PDFs\nwill appear here.'**
  String get savedReportsAppearHere;

  /// No description provided for @filesCachedLocally.
  ///
  /// In en, this message translates to:
  /// **'files cached locally'**
  String get filesCachedLocally;

  /// No description provided for @clearCache.
  ///
  /// In en, this message translates to:
  /// **'Clear Cache'**
  String get clearCache;

  /// No description provided for @offlineSync.
  ///
  /// In en, this message translates to:
  /// **'Offline Sync'**
  String get offlineSync;

  /// No description provided for @lastSynced.
  ///
  /// In en, this message translates to:
  /// **'Last synced 2 min ago'**
  String get lastSynced;

  /// No description provided for @cacheStorage.
  ///
  /// In en, this message translates to:
  /// **'Cache Storage'**
  String get cacheStorage;

  /// No description provided for @cacheUsed.
  ///
  /// In en, this message translates to:
  /// **'12.5 MB used'**
  String get cacheUsed;

  /// No description provided for @appVersion.
  ///
  /// In en, this message translates to:
  /// **'App Version'**
  String get appVersion;

  /// No description provided for @privacyPolicyTerms.
  ///
  /// In en, this message translates to:
  /// **'Privacy Policy & Terms'**
  String get privacyPolicyTerms;

  /// No description provided for @clearAllCache.
  ///
  /// In en, this message translates to:
  /// **'Clear All Cache'**
  String get clearAllCache;

  /// No description provided for @all.
  ///
  /// In en, this message translates to:
  /// **'All'**
  String get all;

  /// No description provided for @unread.
  ///
  /// In en, this message translates to:
  /// **'Unread'**
  String get unread;

  /// No description provided for @alertsWarnings.
  ///
  /// In en, this message translates to:
  /// **'Alerts & Warnings'**
  String get alertsWarnings;

  /// No description provided for @noNotificationsFoundTitle.
  ///
  /// In en, this message translates to:
  /// **'No Notifications Found'**
  String get noNotificationsFoundTitle;

  /// No description provided for @seenAllAdvisories.
  ///
  /// In en, this message translates to:
  /// **'You have seen all advisories and alerts.'**
  String get seenAllAdvisories;

  /// No description provided for @markAllRead.
  ///
  /// In en, this message translates to:
  /// **'Mark all read'**
  String get markAllRead;

  /// No description provided for @step1Of2SessionPreference.
  ///
  /// In en, this message translates to:
  /// **'Step 1 of 2: Session Preference'**
  String get step1Of2SessionPreference;

  /// No description provided for @myBookings.
  ///
  /// In en, this message translates to:
  /// **'My Bookings'**
  String get myBookings;

  /// No description provided for @chooseConsultationMode.
  ///
  /// In en, this message translates to:
  /// **'1. Choose Consultation Mode'**
  String get chooseConsultationMode;

  /// No description provided for @voiceCall.
  ///
  /// In en, this message translates to:
  /// **'Voice Call'**
  String get voiceCall;

  /// No description provided for @videoCall.
  ///
  /// In en, this message translates to:
  /// **'Video Call'**
  String get videoCall;

  /// No description provided for @chatAdvisory.
  ///
  /// In en, this message translates to:
  /// **'Chat Advisory'**
  String get chatAdvisory;

  /// No description provided for @selectCropIssueCategory.
  ///
  /// In en, this message translates to:
  /// **'2. Select Crop Issue Category'**
  String get selectCropIssueCategory;

  /// No description provided for @pestAndDisease.
  ///
  /// In en, this message translates to:
  /// **'Pest & Disease'**
  String get pestAndDisease;

  /// No description provided for @pestAndDiseaseSub.
  ///
  /// In en, this message translates to:
  /// **'Insects, fungal rot, blight'**
  String get pestAndDiseaseSub;

  /// No description provided for @soilAndFertilizer.
  ///
  /// In en, this message translates to:
  /// **'Soil & Fertilizer'**
  String get soilAndFertilizer;

  /// No description provided for @soilAndFertilizerSub.
  ///
  /// In en, this message translates to:
  /// **'Nutrients, salinity, pH'**
  String get soilAndFertilizerSub;

  /// No description provided for @waterAndDrip.
  ///
  /// In en, this message translates to:
  /// **'Water & Drip'**
  String get waterAndDrip;

  /// No description provided for @waterAndDripSub.
  ///
  /// In en, this message translates to:
  /// **'Irrigation, pump pressure'**
  String get waterAndDripSub;

  /// No description provided for @cropPlanning.
  ///
  /// In en, this message translates to:
  /// **'Crop Planning'**
  String get cropPlanning;

  /// No description provided for @cropPlanningSub.
  ///
  /// In en, this message translates to:
  /// **'Varieties, sowing guide'**
  String get cropPlanningSub;

  /// No description provided for @growthAndFlowering.
  ///
  /// In en, this message translates to:
  /// **'Growth & Flowering'**
  String get growthAndFlowering;

  /// No description provided for @growthAndFloweringSub.
  ///
  /// In en, this message translates to:
  /// **'Flower drop, fruit size'**
  String get growthAndFloweringSub;

  /// No description provided for @marketAndPricing.
  ///
  /// In en, this message translates to:
  /// **'Market & Pricing'**
  String get marketAndPricing;

  /// No description provided for @marketAndPricingSub.
  ///
  /// In en, this message translates to:
  /// **'Mandi rates, buyer links'**
  String get marketAndPricingSub;

  /// No description provided for @addCropIssueDetails.
  ///
  /// In en, this message translates to:
  /// **'Add Crop Issue Details'**
  String get addCropIssueDetails;

  /// No description provided for @step2PhotosVoiceDesc.
  ///
  /// In en, this message translates to:
  /// **'Step 2 of 2: Photos, Voice & Description'**
  String get step2PhotosVoiceDesc;

  /// No description provided for @uploadingBooking.
  ///
  /// In en, this message translates to:
  /// **'Uploading & Booking...'**
  String get uploadingBooking;

  /// No description provided for @confirmAndBookExpert.
  ///
  /// In en, this message translates to:
  /// **'Confirm & Book Expert'**
  String get confirmAndBookExpert;

  /// No description provided for @addPhotosOfCropIssue.
  ///
  /// In en, this message translates to:
  /// **'Add Photos of Crop Issue'**
  String get addPhotosOfCropIssue;

  /// No description provided for @uploadClearPhotos.
  ///
  /// In en, this message translates to:
  /// **'Upload clear photos of leaves, stems, or pests for better diagnosis'**
  String get uploadClearPhotos;

  /// No description provided for @uploadFromGallery.
  ///
  /// In en, this message translates to:
  /// **'Upload from gallery'**
  String get uploadFromGallery;

  /// No description provided for @recordVoiceNote.
  ///
  /// In en, this message translates to:
  /// **'Record Voice Note'**
  String get recordVoiceNote;

  /// No description provided for @tapMicAndExplain.
  ///
  /// In en, this message translates to:
  /// **'Tap mic and explain your problem in your language'**
  String get tapMicAndExplain;

  /// No description provided for @tapToStartVoiceRecording.
  ///
  /// In en, this message translates to:
  /// **'Tap to Start Voice Recording'**
  String get tapToStartVoiceRecording;

  /// No description provided for @gpsSync.
  ///
  /// In en, this message translates to:
  /// **'GPS Sync'**
  String get gpsSync;

  /// No description provided for @liveSatelliteWeather.
  ///
  /// In en, this message translates to:
  /// **'Live Satellite Weather'**
  String get liveSatelliteWeather;

  /// No description provided for @cachedOfflineData.
  ///
  /// In en, this message translates to:
  /// **'Cached Offline Data'**
  String get cachedOfflineData;

  /// No description provided for @updatedAt.
  ///
  /// In en, this message translates to:
  /// **'Updated: {time}'**
  String updatedAt(Object time);

  /// No description provided for @feelsLike.
  ///
  /// In en, this message translates to:
  /// **'Feels like {temp}°C • High: {high}° Low: {low}°'**
  String feelsLike(Object high, Object low, Object temp);

  /// No description provided for @rainProb.
  ///
  /// In en, this message translates to:
  /// **'Rain Prob.'**
  String get rainProb;

  /// No description provided for @windDirection.
  ///
  /// In en, this message translates to:
  /// **'Wind ({dir})'**
  String windDirection(Object dir);

  /// No description provided for @rainfallTrendAndVolume.
  ///
  /// In en, this message translates to:
  /// **'Rainfall Trend & Volume'**
  String get rainfallTrendAndVolume;

  /// No description provided for @expectedPrecipitationInMm.
  ///
  /// In en, this message translates to:
  /// **'Expected precipitation in mm'**
  String get expectedPrecipitationInMm;

  /// No description provided for @mmTotal.
  ///
  /// In en, this message translates to:
  /// **'{total} mm Total'**
  String mmTotal(Object total);

  /// No description provided for @heavyRainForecast.
  ///
  /// In en, this message translates to:
  /// **'Heavy Rain Forecast: Stop irrigation pumps and ensure field run-off paths are clear.'**
  String get heavyRainForecast;

  /// No description provided for @moderateRain.
  ///
  /// In en, this message translates to:
  /// **'Moderate Rain: Natural soil moisture sufficient; pause drip irrigation for 24h.'**
  String get moderateRain;

  /// No description provided for @lightToNilRain.
  ///
  /// In en, this message translates to:
  /// **'Light to Nil Rain: Maintain normal drip irrigation schedule.'**
  String get lightToNilRain;

  /// No description provided for @atmosphericAndFieldConditions.
  ///
  /// In en, this message translates to:
  /// **'Atmospheric & Field Conditions'**
  String get atmosphericAndFieldConditions;

  /// No description provided for @uvIndex.
  ///
  /// In en, this message translates to:
  /// **'UV Index'**
  String get uvIndex;

  /// No description provided for @uvLow.
  ///
  /// In en, this message translates to:
  /// **'Low'**
  String get uvLow;

  /// No description provided for @uvModerate.
  ///
  /// In en, this message translates to:
  /// **'Moderate'**
  String get uvModerate;

  /// No description provided for @uvHigh.
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get uvHigh;

  /// No description provided for @uvVeryHigh.
  ///
  /// In en, this message translates to:
  /// **'Very High'**
  String get uvVeryHigh;

  /// No description provided for @solarRadiationIntensity.
  ///
  /// In en, this message translates to:
  /// **'Solar radiation intensity'**
  String get solarRadiationIntensity;

  /// No description provided for @airPressure.
  ///
  /// In en, this message translates to:
  /// **'Air Pressure'**
  String get airPressure;

  /// No description provided for @atmosphericDensity.
  ///
  /// In en, this message translates to:
  /// **'Atmospheric density'**
  String get atmosphericDensity;

  /// No description provided for @dewPoint.
  ///
  /// In en, this message translates to:
  /// **'Dew Point'**
  String get dewPoint;

  /// No description provided for @moistureCondensation.
  ///
  /// In en, this message translates to:
  /// **'Moisture condensation'**
  String get moistureCondensation;

  /// No description provided for @windDir.
  ///
  /// In en, this message translates to:
  /// **'Wind Direction'**
  String get windDir;

  /// No description provided for @foliarDriftFactor.
  ///
  /// In en, this message translates to:
  /// **'Foliar drift factor'**
  String get foliarDriftFactor;

  /// No description provided for @sunrise.
  ///
  /// In en, this message translates to:
  /// **'Sunrise'**
  String get sunrise;

  /// No description provided for @sunset.
  ///
  /// In en, this message translates to:
  /// **'Sunset'**
  String get sunset;

  /// No description provided for @whichOrchardTitle.
  ///
  /// In en, this message translates to:
  /// **'Which orchard do you want to plant?'**
  String get whichOrchardTitle;

  /// No description provided for @whichOrchardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Select one or more orchards, or ask an expert.'**
  String get whichOrchardSubtitle;

  /// No description provided for @mangoOrchard.
  ///
  /// In en, this message translates to:
  /// **'Mango'**
  String get mangoOrchard;

  /// No description provided for @orangeOrchard.
  ///
  /// In en, this message translates to:
  /// **'Orange'**
  String get orangeOrchard;

  /// No description provided for @guavaOrchard.
  ///
  /// In en, this message translates to:
  /// **'Guava'**
  String get guavaOrchard;

  /// No description provided for @pomegranateOrchard.
  ///
  /// In en, this message translates to:
  /// **'Pomegranate'**
  String get pomegranateOrchard;

  /// No description provided for @bananaOrchard.
  ///
  /// In en, this message translates to:
  /// **'Banana'**
  String get bananaOrchard;

  /// No description provided for @papayaOrchard.
  ///
  /// In en, this message translates to:
  /// **'Papaya'**
  String get papayaOrchard;

  /// No description provided for @cashewOrchard.
  ///
  /// In en, this message translates to:
  /// **'Cashew'**
  String get cashewOrchard;

  /// No description provided for @coconutOrchard.
  ///
  /// In en, this message translates to:
  /// **'Coconut'**
  String get coconutOrchard;

  /// No description provided for @custardAppleOrchard.
  ///
  /// In en, this message translates to:
  /// **'Custard Apple'**
  String get custardAppleOrchard;

  /// No description provided for @dragonFruitOrchard.
  ///
  /// In en, this message translates to:
  /// **'Dragon Fruit'**
  String get dragonFruitOrchard;

  /// No description provided for @grapesOrchard.
  ///
  /// In en, this message translates to:
  /// **'Grapes'**
  String get grapesOrchard;

  /// No description provided for @jackfruitOrchard.
  ///
  /// In en, this message translates to:
  /// **'Jackfruit'**
  String get jackfruitOrchard;

  /// No description provided for @pineappleOrchard.
  ///
  /// In en, this message translates to:
  /// **'Pineapple'**
  String get pineappleOrchard;

  /// No description provided for @sapotaOrchard.
  ///
  /// In en, this message translates to:
  /// **'Sapota'**
  String get sapotaOrchard;

  /// No description provided for @notDecided.
  ///
  /// In en, this message translates to:
  /// **'Not Decided'**
  String get notDecided;

  /// No description provided for @othersOrchard.
  ///
  /// In en, this message translates to:
  /// **'Others'**
  String get othersOrchard;

  /// No description provided for @activeRequests.
  ///
  /// In en, this message translates to:
  /// **'Active Requests'**
  String get activeRequests;

  /// No description provided for @underReview.
  ///
  /// In en, this message translates to:
  /// **'Under Review'**
  String get underReview;

  /// No description provided for @requestNo.
  ///
  /// In en, this message translates to:
  /// **'Request'**
  String get requestNo;

  /// No description provided for @tapToViewTracker.
  ///
  /// In en, this message translates to:
  /// **'Tap to view 5-stage tracker'**
  String get tapToViewTracker;

  /// No description provided for @scheduled.
  ///
  /// In en, this message translates to:
  /// **'Scheduled'**
  String get scheduled;

  /// No description provided for @startNewActivity.
  ///
  /// In en, this message translates to:
  /// **'Start New Activity'**
  String get startNewActivity;

  /// No description provided for @newOrchardPlanSurvey.
  ///
  /// In en, this message translates to:
  /// **'New Orchard Plan Survey'**
  String get newOrchardPlanSurvey;

  /// No description provided for @logoutConfirmationTitle.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to log out?'**
  String get logoutConfirmationTitle;

  /// No description provided for @logoutConfirmationDesc.
  ///
  /// In en, this message translates to:
  /// **'Your saved data will be cleared from this device.'**
  String get logoutConfirmationDesc;

  /// No description provided for @yesLogout.
  ///
  /// In en, this message translates to:
  /// **'Yes, Logout'**
  String get yesLogout;
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
