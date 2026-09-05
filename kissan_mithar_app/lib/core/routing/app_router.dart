import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/activity/presentation/screens/my_activity_screen.dart';
import '../../features/auth/presentation/screens/otp_verify_screen.dart';
import '../../features/auth/presentation/screens/phone_auth_screen.dart';
import '../../features/consultation/presentation/screens/add_consultation_details_screen.dart';
import '../../features/consultation/presentation/screens/book_consultation_screen.dart';
import '../../features/consultation/presentation/screens/consultation_detail_screen.dart';
import '../../features/consultation/presentation/screens/consultation_history_screen.dart';
import '../../features/consultation/presentation/screens/consultation_success_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/home/presentation/screens/main_shell_screen.dart';
import '../../features/language_selection/presentation/screens/language_select_screen.dart';
import '../../features/legal/presentation/legal_screen.dart';
import '../../features/notifications/presentation/screens/notification_permission_screen.dart';
import '../../features/notifications/presentation/screens/notifications_screen.dart';
import '../../features/orchard_planning/presentation/screens/orchard_guided_flow_screen.dart';
import '../../features/orchard_planning/presentation/screens/orchard_plan_report_screen.dart';
import '../../features/orchard_planning/presentation/screens/plan_tracker_screen.dart';
import '../../features/orchard_planning/presentation/screens/success_screen.dart';
import '../../features/profile/presentation/screens/downloads_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/expert_portal/presentation/screens/expert_dashboard_screen.dart';
import '../../features/splash/presentation/screens/splash_screen.dart';
import '../../features/weather/presentation/screens/weather_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey =
    GlobalKey<NavigatorState>(debugLabel: 'root');
final GlobalKey<NavigatorState> _shellNavigatorKey =
    GlobalKey<NavigatorState>(debugLabel: 'shell');

class AppRoutes {
  AppRoutes._();

  static const String splash = 'splash';
  static const String languageSelect = 'languageSelect';
  static const String phoneAuth = 'phoneAuth';
  static const String otpVerify = 'otpVerify';
  static const String notificationPermission = 'notificationPermission';
  static const String home = 'home';
  static const String notifications = 'notifications';
  static const String profile = 'profile';
  static const String expertDashboard = 'expertDashboard';
  static const String orchardSuccess = 'orchardSuccess';
  static const String landSize = 'landSize';
  static const String orchardFlow = 'orchardFlow';
  static const String planTracker = 'planTracker';
  static const String orchardReport = 'orchardReport';
  static const String consultation = 'consultation';
  static const String consultationAddDetails = 'consultationAddDetails';
  static const String consultationSuccess = 'consultationSuccess';
  static const String consultationHistory = 'consultationHistory';
  static const String consultationDetail = 'consultationDetail';
  static const String profileDownloads = 'profileDownloads';
  static const String orchardTracker = 'orchardTracker';
  static const String weather = 'weather';
  static const String activity = 'activity';
}

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  routes: <RouteBase>[
    // 1. Initial Flow (Splash, Language, & Notification Permission)
    GoRoute(
      path: '/',
      name: AppRoutes.splash,
      parentNavigatorKey: _rootNavigatorKey,
      builder: (BuildContext context, GoRouterState state) {
        return const SplashScreen();
      },
    ),
    GoRoute(
      path: '/language',
      name: AppRoutes.languageSelect,
      parentNavigatorKey: _rootNavigatorKey,
      builder: (BuildContext context, GoRouterState state) {
        return const LanguageSelectScreen();
      },
    ),
    GoRoute(
      path: '/notification-permission',
      name: AppRoutes.notificationPermission,
      parentNavigatorKey: _rootNavigatorKey,
      builder: (BuildContext context, GoRouterState state) {
        return const NotificationPermissionScreen();
      },
    ),
    GoRoute(
      path: '/auth/phone',
      name: AppRoutes.phoneAuth,
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const PhoneAuthScreen(),
    ),
    GoRoute(
      path: '/auth/otp',
      name: AppRoutes.otpVerify,
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) {
        final extra = state.extra as Map<String, dynamic>?;
        final phoneNumber = extra?['phoneNumber'] as String? ?? '';
        final devOtp = extra?['devOtp'] as String?;
        return OtpVerifyScreen(phoneNumber: phoneNumber, devOtp: devOtp);
      },
    ),

    // 2. Main ShellRoute for Bottom Navigation Tabs (Home, Notifications, Profile)
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (BuildContext context, GoRouterState state, Widget child) {
        return MainShellScreen(child: child);
      },
      routes: <RouteBase>[
        GoRoute(
          path: '/home',
          name: AppRoutes.home,
          builder: (BuildContext context, GoRouterState state) {
            return const HomeScreen();
          },
        ),
        GoRoute(
          path: '/activity',
          name: AppRoutes.activity,
          builder: (BuildContext context, GoRouterState state) {
            return const MyActivityScreen();
          },
        ),
        GoRoute(
          path: '/profile',
          name: AppRoutes.profile,
          builder: (BuildContext context, GoRouterState state) {
            return const ProfileScreen();
          },
        ),
        // 3. Full Screen Feature Routes (Orchard Planning, Consultation, Weather, Activity)
        GoRoute(
          path: '/orchard/land-size',
          name: AppRoutes.landSize,
          builder: (BuildContext context, GoRouterState state) {
            return const OrchardGuidedFlowScreen();
          },
        ),
        GoRoute(
          path: '/orchard/survey',
          name: AppRoutes.orchardFlow,
          builder: (BuildContext context, GoRouterState state) {
            return const OrchardGuidedFlowScreen();
          },
        ),
        GoRoute(
          path: '/orchard/success',
          name: AppRoutes.orchardSuccess,
          builder: (BuildContext context, GoRouterState state) {
            final extra = state.extra as Map<String, dynamic>?;
            return OrchardSuccessScreen(
              landSize: extra?['landSize'] as String? ?? '1-3 Acres',
              soilType: extra?['soilType'] as String? ?? 'Red Soil',
              hasMap: extra?['hasMap'] as bool? ?? false,
            );
          },
        ),
        GoRoute(
          path: '/orchard/plan-tracker',
          name: AppRoutes.planTracker,
          builder: (BuildContext context, GoRouterState state) {
            final extra = state.extra as Map<String, dynamic>?;
            return PlanTrackerScreen(
              landSize: extra?['landSize'] ?? '1-3 Acres',
              soilType: extra?['soilType'] ?? 'Red Soil (Lal Mitti)',
              hasMap: extra?['hasMap'] ?? true,
            );
          },
        ),
        GoRoute(
          path: '/orchard/report',
          name: AppRoutes.orchardReport,
          builder: (BuildContext context, GoRouterState state) {
            return const OrchardPlanReportScreen();
          },
        ),
        GoRoute(
          path: '/consultation',
          name: AppRoutes.consultation,
          builder: (BuildContext context, GoRouterState state) {
            return const BookConsultationScreen();
          },
        ),
        GoRoute(
          path: '/consultation/add-details',
          name: AppRoutes.consultationAddDetails,
          builder: (BuildContext context, GoRouterState state) {
            return const AddConsultationDetailsScreen();
          },
        ),
        GoRoute(
          path: '/consultation/success',
          name: AppRoutes.consultationSuccess,
          builder: (BuildContext context, GoRouterState state) {
            final extra = state.extra as Map<String, dynamic>?;
            return ConsultationSuccessScreen(
              bookingId: extra?['bookingId'] ?? '',
              expertName: extra?['expertName'] ?? '',
              scheduledDate: extra?['scheduledDate'] ?? '',
              scheduledTime: extra?['scheduledTime'] ?? '',
              modeIcon: extra?['modeIcon'] ?? Icons.phone,
              modeLabel: extra?['modeLabel'] ?? '',
              language: extra?['language'] ?? '',
            );
          },
        ),
        GoRoute(
          path: '/consultation/history',
          name: AppRoutes.consultationHistory,
          builder: (BuildContext context, GoRouterState state) {
            return const ConsultationHistoryScreen();
          },
        ),
        GoRoute(
          path: '/consultation/detail/:id',
          name: AppRoutes.consultationDetail,
          builder: (BuildContext context, GoRouterState state) {
            final id = state.pathParameters['id'] ?? 'CNS-8921';
            return ConsultationDetailScreen(consultationId: id);
          },
        ),
        GoRoute(
          path: '/weather',
          name: AppRoutes.weather,
          builder: (BuildContext context, GoRouterState state) {
            return const WeatherScreen();
          },
        ),
        GoRoute(
          path: '/profile/downloads',
          name: AppRoutes.profileDownloads,
          builder: (BuildContext context, GoRouterState state) {
            return const DownloadsScreen();
          },
        ),
        GoRoute(
          path: '/orchard/tracker',
          name: AppRoutes.orchardTracker,
          builder: (BuildContext context, GoRouterState state) {
            return PlanTrackerScreen(
              landSize: '1-3 Acres',
              soilType: 'Red Soil (Lal Mitti)',
              hasMap: true,
            );
          },
        ),
        GoRoute(
          path: '/notifications',
          name: AppRoutes.notifications,
          builder: (BuildContext context, GoRouterState state) {
            return const NotificationsScreen();
          },
        ),
        GoRoute(
          path: '/expert-portal',
          name: AppRoutes.expertDashboard,
          builder: (BuildContext context, GoRouterState state) {
            return const ExpertDashboardScreen();
          },
        ),
        GoRoute(
          path: '/legal',
          name: 'legal',
          builder: (BuildContext context, GoRouterState state) {
            final tab = state.uri.queryParameters['tab'];
            return LegalScreen(initialTabIndex: tab == 'terms' ? 1 : 0);
          },
        ),
      ],
    ),
  ],
);
