import 'package:flutter/widgets.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    final loc = Localizations.of<AppLocalizations>(context, AppLocalizations);
    return loc ?? AppLocalizations(const Locale('en'));
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static final Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'appName': 'KISSAN MITHAR',
      'tagline': 'Farmer-First Mobile App',
      'home': 'Home',
      'notifications': 'Notifications',
      'profile': 'Profile',
      'myActivity': 'My Activity',
      'support': 'Support',
      'goodMorning': 'Good Morning',
      'goodAfternoon': 'Good Afternoon',
      'goodEvening': 'Good Evening',
      'todayForecast': "TODAY'S FORECAST",
      'tapForForecast': 'Tap to view full forecast',
      'humidity': 'Humidity',
      'wind': 'Wind',
      'rain': 'Rain',
      'quickActions': 'Quick Services',
      'orchardPlanning': 'Orchard Planning',
      'orchardPlanningSubtitle': 'Custom layout & tree plantation roadmap',
      'expertConsultation': 'Expert Consultation',
      'expertConsultationSubtitle': 'Talk 1-on-1 with certified agronomists',
      'liveWeather': 'Live Weather',
      'liveWeatherSubtitle': 'Rain alerts, radar & farming advisory',
      'recentUpdates': 'Recent Updates',
      'noRecentUpdates': 'No Recent Updates',
      'noRecentUpdatesSubtitle': 'You are all caught up with farming advisories.',
      'loadingUpdates': 'Loading latest farm updates...',
      'viewAll': 'View All',
      'landSizeTitle': 'How much land do you have?',
      'acres': 'ACRES',
      'guntas': 'Guntas',
      'cents': 'Cents',
      'extraGuntas': 'EXTRA GUNTAS',
      'extraCents': 'EXTRA CENTS',
      'next': 'Next',
      'continueText': 'Continue',
      'soilTypeTitle': 'What is your soil type?',
      'soilTypeSubtitle': 'Select the type that best matches your land to get accurate farming advice.',
      'redSoil': 'Red Soil',
      'blackSoil': 'Black Soil',
      'sandySoil': 'Sandy Soil',
      'claySoil': 'Clay Soil',
      'notSure': 'Not Sure?',
      'uploadDocument': 'Upload Document',
      'takePhoto': 'Take Photo',
      'uploadPdf': 'Upload PDF',
      'fromGallery': 'From Gallery',
      'skip': "I don't have this — Skip",
    },
    'hi': {
      'appName': 'KISSAN MITHAR',
      'tagline': 'किसान-प्रथम मोबाइल ऐप',
      'home': 'होम',
      'notifications': 'सूचनाएं',
      'profile': 'प्रोफ़ाइल',
      'myActivity': 'मेरी गतिविधि',
      'support': 'सहायता',
      'goodMorning': 'शुभ प्रभात',
      'goodAfternoon': 'शुभ दोपहर',
      'goodEvening': 'शुभ संध्या',
      'todayForecast': 'आज का मौसम पूर्वानुमान',
      'tapForForecast': 'पूरा मौसम देखने के लिए छुएं',
      'humidity': 'नमी',
      'wind': 'हवा',
      'rain': 'बारिश',
      'quickActions': 'त्वरित सेवाएं',
      'orchardPlanning': 'बागवानी योजना',
      'orchardPlanningSubtitle': 'कस्टम लेआउट एवं वृक्षारोपण योजना',
      'expertConsultation': 'विशेषज्ञ परामर्श',
      'expertConsultationSubtitle': 'प्रमाणित कृषि विशेषज्ञों से सीधे बात करें',
      'liveWeather': 'लाइव मौसम',
      'liveWeatherSubtitle': 'बारिश की चेतावनी व कृषि सलाह',
      'recentUpdates': 'ताज़ा अपडेट',
      'noRecentUpdates': 'कोई नया अपडेट नहीं',
      'noRecentUpdatesSubtitle': 'आपके पास सभी ताज़ा कृषि अपडेट मौजूद हैं।',
      'loadingUpdates': 'ताज़ा कृषि अपडेट लोड हो रहे हैं...',
      'viewAll': 'सभी देखें',
      'landSizeTitle': 'आपके पास कितनी ज़मीन है?',
      'acres': 'एकड़',
      'guntas': 'गुंठा',
      'cents': 'सेंट',
      'extraGuntas': 'अतिरिक्त गुंठा',
      'extraCents': 'अतिरिक्त सेंट',
      'next': 'आगे बढ़ें',
      'continueText': 'जारी रखें',
      'soilTypeTitle': 'आपकी मिट्टी किस प्रकार की है?',
      'soilTypeSubtitle': 'सटीक कृषि सलाह पाने के लिए अपनी ज़मीन की मिट्टी चुनें।',
      'redSoil': 'लाल मिट्टी',
      'blackSoil': 'काली मिट्टी',
      'sandySoil': 'बलुई मिट्टी',
      'claySoil': 'चिकनी मिट्टी',
      'notSure': 'निश्चय नहीं है?',
      'uploadDocument': 'दस्तावेज़ अपलोड करें',
      'takePhoto': 'फोटो लें',
      'uploadPdf': 'PDF अपलोड करें',
      'fromGallery': 'गैलरी से चुनें',
      'skip': 'मेरे पास यह नहीं है — छोड़ें',
    },
    'te': {
      'appName': 'KISSAN MITHAR',
      'tagline': 'రైతు ప్రాధాన్య మొబైల్ యాప్',
      'home': 'హోమ్',
      'notifications': 'నోటిఫికేషన్లు',
      'profile': 'ప్రొఫైల్',
      'myActivity': 'నా కార్యకలాపాలు',
      'support': 'సహాయం',
      'goodMorning': 'శుభోదయం',
      'goodAfternoon': 'శుభ మధ్యాహ్నం',
      'goodEvening': 'శుభ సాయంత్రం',
      'todayForecast': 'ఈరోజు వాతావరణ సమాచారం',
      'tapForForecast': 'పూర్తి వివరాలు చూడటానికి తాకండి',
      'humidity': 'తేమ',
      'wind': 'గాలి',
      'rain': 'వర్షం',
      'quickActions': 'త్వరిత సేవలు',
      'orchardPlanning': 'తోట ప్రణాళిక',
      'orchardPlanningSubtitle': 'ప్రత్యేకమైన తోట లేఅవుట్ & మొక్కల ప్రణాళిక',
      'expertConsultation': 'నిపుణుల సలహా',
      'expertConsultationSubtitle': 'వ్యవసాయ నిపుణులతో నేరుగా మాట్లాడండి',
      'liveWeather': 'ప్రత్యక్ష వాతావరణం',
      'liveWeatherSubtitle': 'వర్ష సూచనలు & వ్యవసాయ సలహాలు',
      'recentUpdates': 'తాజా సమాచారం',
      'noRecentUpdates': 'తాజా సమాచారం లేదు',
      'noRecentUpdatesSubtitle': 'మీరు అన్ని వ్యవసాయ సలహాలను చూసారు.',
      'loadingUpdates': 'తాజా సమాచారం లోడ్ అవుతోంది...',
      'viewAll': 'అన్నీ చూడండి',
      'landSizeTitle': 'మీకు ఎంత భూమి ఉంది?',
      'acres': 'ఎకరాలు',
      'guntas': 'గుంటలు',
      'cents': 'సెంట్లు',
      'extraGuntas': 'అదనపు గుంటలు',
      'extraCents': 'అదనపు సెంట్లు',
      'next': 'తరువాత',
      'continueText': 'కొనసాగించండి',
      'soilTypeTitle': 'మీ నేల రకం ఏమిటి?',
      'soilTypeSubtitle': 'ఖచ్చితమైన వ్యవసాయ సలహా కోసం మీ నేల రకాన్ని ఎంచుకోండి.',
      'redSoil': 'ఎర్ర నేల',
      'blackSoil': 'నల్ల నేల',
      'sandySoil': 'ఇసుక నేల',
      'claySoil': 'బంక నేల',
      'notSure': 'ఖచ్చితంగా తెలియదా?',
      'uploadDocument': 'పత్రం అప్‌లోడ్ చేయండి',
      'takePhoto': 'ఫోటో తీయండి',
      'uploadPdf': 'PDF అప్‌లోడ్ చేయండి',
      'fromGallery': 'గ్యాలరీ నుండి',
      'skip': 'ఇది నా దగ్గర లేదు — దాటవేయి',
    },
    'kn': {
      'appName': 'KISSAN MITHAR',
      'tagline': 'ರೈತ-ಮೊದಲು ಮೊಬೈಲ್ ಅಪ್ಲಿಕೇಶನ್',
      'home': 'ಮುಖಪುಟ',
      'notifications': 'ಅಧಿಸೂಚನೆಗಳು',
      'profile': 'ಪ್ರೊಫೈಲ್',
      'myActivity': 'ನನ್ನ ಚಟುವಟಿಕೆ',
      'support': 'ಬೆಂಬಲ',
      'goodMorning': 'ಶುಭೋದಯ',
      'goodAfternoon': 'ಶುಭ ಮಧ್ಯಾಹ್ನ',
      'goodEvening': 'ಶುಭ ಸಂಜೆ',
      'todayForecast': 'ಇಂದಿನ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ',
      'tapForForecast': 'ಪೂರ್ಣ ಹವಾಮಾನ ನೋಡಲು ಸ್ಪರ್ಶಿಸಿ',
      'humidity': 'ಆರ್ದ್ರತೆ',
      'wind': 'ಗಾಳಿ',
      'rain': 'ಮಳೆ',
      'quickActions': 'ತ್ವರಿತ ಸೇವೆಗಳು',
      'orchardPlanning': 'ತೋಟಗಾರಿಕೆ ಯೋಜನೆ',
      'orchardPlanningSubtitle': 'ಕಸ್ಟಮ್ ವಿನ್ಯಾಸ ಮತ್ತು ಸಸಿ ನೆಡುವ ಯೋಜನೆ',
      'expertConsultation': 'ತಜ್ಞರ ಸಮಾಲೋಚನೆ',
      'expertConsultationSubtitle': 'ಪ್ರಮಾಣೀಕೃತ ಕೃಷಿ ತಜ್ಞರೊಂದಿಗೆ ನೇರವಾಗಿ ಮಾತನಾಡಿ',
      'liveWeather': 'ನೇರ ಹವಾಮಾನ',
      'liveWeatherSubtitle': 'ಮಳೆ ಎಚ್ಚರಿಕೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳು',
      'recentUpdates': 'ಇತ್ತೀಚಿನ ಅಪ್‌ಡೇಟ್‌ಗಳು',
      'noRecentUpdates': 'ಯಾವುದೇ ಹೊಸ ಅಪ್‌ಡೇಟ್ ಇಲ್ಲ',
      'noRecentUpdatesSubtitle': 'ನೀವು ಎಲ್ಲಾ ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ವೀಕ್ಷಿಸಿದ್ದೀರಿ.',
      'loadingUpdates': 'ತಾಜಾ ಕೃಷಿ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      'viewAll': 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ',
      'landSizeTitle': 'ನಿಮ್ಮಲ್ಲಿ ಎಷ್ಟು ಜಮೀನು ಇದೆ?',
      'acres': 'ಎಕರೆಗಳು',
      'guntas': 'ಗುಂಟೆಗಳು',
      'cents': 'ಸೆಂಟ್‌ಗಳು',
      'extraGuntas': 'ಹೆಚ್ಚುವರಿ ಗುಂಟೆಗಳು',
      'extraCents': 'ಹೆಚ್ಚುವರಿ ಸೆಂಟ್‌ಗಳು',
      'next': 'ಮುಂದೆ',
      'continueText': 'ಮುಂದುವರಿಸಿ',
      'soilTypeTitle': 'ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರ ಯಾವುದು?',
      'soilTypeSubtitle': 'ನಿಖರವಾದ ಕೃಷಿ ಸಲಹೆ ಪಡೆಯಲು ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣಿನ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      'redSoil': 'ಕೆಂಪು ಮಣ್ಣು',
      'blackSoil': 'ಕಪ್ಪು ಮಣ್ಣು',
      'sandySoil': 'ಮರಳು ಮಣ್ಣು',
      'claySoil': 'ಜೇಡಿ ಮಣ್ಣು',
      'notSure': 'ಖಚಿತವಿಲ್ಲವೇ?',
      'uploadDocument': 'ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      'takePhoto': 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
      'uploadPdf': 'PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      'fromGallery': 'ಗ್ಯಾಲರಿಯಿಂದ',
      'skip': 'ನನ್ನ ಬಳಿ ಇದು ಇಲ್ಲ — ಬಿಟ್ಟುಬಿಡಿ',
    },
  };

  String translate(String key) {
    final langCode = locale.languageCode;
    return _localizedValues[langCode]?[key] ??
        _localizedValues['en']?[key] ??
        key;
  }

  // Getters
  String get appName => translate('appName');
  String get tagline => translate('tagline');
  String get home => translate('home');
  String get notifications => translate('notifications');
  String get profile => translate('profile');
  String get myActivity => translate('myActivity');
  String get support => translate('support');
  String get goodMorning => translate('goodMorning');
  String get goodAfternoon => translate('goodAfternoon');
  String get goodEvening => translate('goodEvening');
  String get todayForecast => translate('todayForecast');
  String get tapForForecast => translate('tapForForecast');
  String get humidity => translate('humidity');
  String get wind => translate('wind');
  String get rain => translate('rain');
  String get quickActions => translate('quickActions');
  String get orchardPlanning => translate('orchardPlanning');
  String get orchardPlanningSubtitle => translate('orchardPlanningSubtitle');
  String get expertConsultation => translate('expertConsultation');
  String get expertConsultationSubtitle => translate('expertConsultationSubtitle');
  String get liveWeather => translate('liveWeather');
  String get liveWeatherSubtitle => translate('liveWeatherSubtitle');
  String get recentUpdates => translate('recentUpdates');
  String get noRecentUpdates => translate('noRecentUpdates');
  String get noRecentUpdatesSubtitle => translate('noRecentUpdatesSubtitle');
  String get loadingUpdates => translate('loadingUpdates');
  String get viewAll => translate('viewAll');
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'hi', 'te', 'kn'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
