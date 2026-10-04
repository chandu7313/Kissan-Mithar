import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/app_language.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../../notifications/models/notification_model.dart';
import '../../../notifications/providers/notifications_provider.dart';
import '../../../profile/providers/profile_provider.dart';
import '../../../weather/providers/weather_provider.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  void _showLanguageDialog(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final currentLang = ref.read(languageNotifierProvider);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.selectLanguage,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1B2A1C),
                  ),
                ),
                const SizedBox(height: 16),
                ...AppLanguage.values.map((lang) {
                  final isSelected = lang == currentLang;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFFE8F5E9) : Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF1B6327) : Colors.grey.shade200,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: ListTile(
                      title: Text(
                        '${lang.nativeName} (${lang.englishName})',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected ? const Color(0xFF1B6327) : const Color(0xFF1B2A1C),
                        ),
                      ),
                      trailing: isSelected
                          ? const Icon(Icons.check_circle_rounded, color: Color(0xFF1B6327))
                          : null,
                      onTap: () {
                        ref.read(languageNotifierProvider.notifier).setLanguage(lang);
                        Navigator.pop(context);
                      },
                    ),
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final currentLang = ref.watch(languageNotifierProvider);
    final profile = ref.watch(profileProvider);
    final auth = ref.watch(authProvider);
    final weather = ref.watch(weatherProvider);
    final notificationsState = ref.watch(notificationsProvider);

    final farmerName = profile.name.isNotEmpty
        ? profile.name
        : (auth.userName ?? 'Farmer');

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7), // Light slightly greenish neutral background
      body: SafeArea(
        child: RefreshIndicator(
          color: const Color(0xFF1B6327),
          onRefresh: () async {
            ref.read(weatherProvider.notifier).refreshWeather();
            await ref.read(notificationsProvider.notifier).fetchNotifications();
          },
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [
              // 1. Header (Pinned)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                  child: Row(
                    children: [
                      // Logo
                      Image.asset(
                        'assets/images/kissan_mithar_logo_v2.png',
                        width: 40,
                        height: 40,
                        errorBuilder: (c, e, s) => const Icon(Icons.eco, color: Color(0xFF1B6327), size: 32),
                      ),
                      const SizedBox(width: 12),
                      // Title / Location / Greeting
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Kissan Mithar',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF1B6327),
                              ),
                            ),
                            Row(
                              children: [
                                const Icon(Icons.location_on, size: 12, color: Colors.grey),
                                const SizedBox(width: 4),
                                Text(
                                  weather.isOffline ? 'Offline' : weather.location.split(',').first,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: Colors.black54,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // Notification Bell
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          IconButton(
                            onPressed: () => context.push('/notifications'),
                            icon: const Icon(Icons.notifications_none_rounded, color: Colors.black87),
                          ),
                          if (notificationsState.unreadCount > 0)
                            Positioned(
                              top: 8,
                              right: 8,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: Colors.redAccent,
                                  shape: BoxShape.circle,
                                ),
                                constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                                child: Text(
                                  notificationsState.unreadCount > 9 ? '9+' : '${notificationsState.unreadCount}',
                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                        ],
                      ),
                      // Profile Avatar
                      GestureDetector(
                        onTap: () => context.go('/profile'),
                        child: CircleAvatar(
                          radius: 18,
                          backgroundColor: const Color(0xFF1B6327),
                          child: Text(
                            farmerName.isNotEmpty ? farmerName[0].toUpperCase() : 'F',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Scrollable Content
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // 2. Primary Hero Section
                    _buildHeroSection(context, currentLang.nativeName, () => _showLanguageDialog(context, ref)),

                    const SizedBox(height: 20),

                    // 3. Core Farm Services Grid
                    _buildServicesGrid(context),

                    const SizedBox(height: 20),

                    // 4. Farm Status / Today Section (Weather & Mandi)
                    _buildTodayStatusSection(weather),

                    const SizedBox(height: 20),

                    // 5. AI Farming Assistant Card
                    _buildAIAssistantCard(),

                    const SizedBox(height: 24),

                    // 6. Smart Recommendations
                    const Text(
                      'Recommended for You',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildRecommendationsList(),

                    const SizedBox(height: 40),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- Hero Section ---
  Widget _buildHeroSection(BuildContext context, String currentLangName, VoidCallback onLangTap) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFE5F1DB), Color(0xFFCDE2BB)],
        ),
        image: const DecorationImage(
          image: AssetImage('assets/images/farmer-talk-with-aibot.png'),
          fit: BoxFit.cover,
          alignment: Alignment.centerRight,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Semi-transparent gradient to ensure text readability on the left side
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [
                  const Color(0xFFE5F1DB),
                  const Color(0xFFCDE2BB).withOpacity(0.9),
                  Colors.transparent,
                ],
                stops: const [0.0, 0.5, 1.0],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Expanded(
                      flex: 6,
                      child: Text(
                        'మీ పంటకు\nమంచి నిర్ణయాలు',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF1B3B22),
                          height: 1.3,
                        ),
                      ),
                    ),
                    // Language Toggle Pill inside Hero
                    Expanded(
                      flex: 4,
                      child: Align(
                        alignment: Alignment.topRight,
                        child: GestureDetector(
                          onTap: onLangTap,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withAlpha(200),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(currentLangName, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1B6327))),
                                const Icon(Icons.arrow_drop_down, size: 16, color: Color(0xFF1B6327)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const SizedBox(
                  width: 200, // Constrain width so it doesn't overlap farmer face
                  child: Text(
                    'Get instant farming advice and weather updates',
                    style: TextStyle(
                      fontSize: 13,
                      color: Color(0xFF3F6446),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Ask AI Button inside Hero
                InkWell(
                  onTap: () {
                    // TODO: Navigate to AI Assistant
                  },
                  borderRadius: BorderRadius.circular(30),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF104620),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Image.asset(
                          'assets/images/ai-bot.png',
                          width: 36,
                          height: 36,
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(Icons.smart_toy, color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Ask AI Assistant',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.chevron_right, color: Colors.white, size: 18),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- Services Grid ---
  Widget _buildServicesGrid(BuildContext context) {
    final services = [
      {'image': 'assets/images/orchard_planning.png', 'title': 'Orchard Planning', 'route': '/orchard/land-size'},
      {'image': 'assets/images/expert_consultancy.png', 'title': 'Expert Consultancy', 'route': '/consultation'},
      {'image': 'assets/images/Fertilizers-guide.png', 'title': 'Fertilizer Guide', 'route': '/activity'},
      {'image': 'assets/images/Disease-help.png', 'title': 'Disease Help', 'route': '/activity'},
      {'image': 'assets/images/weather.png', 'title': 'Weather', 'route': '/weather'},
      {'image': 'assets/images/labours.png', 'title': 'Farm Labour', 'route': '/activity'},
      {'image': 'assets/images/Machineries.png', 'title': 'Farm Machinery', 'route': '/activity'},
      {'image': 'assets/images/crop_buying_selling.png', 'title': 'Crop buying selling', 'route': '/shop'},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: services.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.60,
        crossAxisSpacing: 8,
        mainAxisSpacing: 16,
      ),
      itemBuilder: (context, index) {
        final s = services[index];
        return InkWell(
          onTap: () => context.push(s['route'] as String),
          borderRadius: BorderRadius.circular(12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              AspectRatio(
                aspectRatio: 1.0,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(8),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.asset(
                      s['image'] as String,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          const Icon(Icons.broken_image, color: Colors.grey, size: 32),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                s['title'] as String,
                textAlign: TextAlign.center,
                maxLines: 2,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                  height: 1.15,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // --- Today's Status Section ---
  Widget _buildTodayStatusSection(WeatherState weather) {
    return Row(
      children: [
        // Weather Card
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(5),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Today\'s Weather', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black54)),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Icon(Icons.wb_sunny_rounded, color: Colors.orange, size: 32),
                    const SizedBox(width: 8),
                    Text(
                      '${weather.temperature.round()}°C',
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.black87, height: 1.0),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(weather.condition, style: const TextStyle(fontSize: 12, color: Colors.black87)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        // Mandi Prices Card (Mocked for now as per design)
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(5),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Mandi Prices', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black54)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Cotton', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.black87)),
                    Row(
                      children: [
                        const Text('₹6,850', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.black87)),
                        const Icon(Icons.arrow_upward, color: Colors.green, size: 14),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Paddy', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.black87)),
                    Row(
                      children: [
                        const Text('₹2,320', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.black87)),
                        const Icon(Icons.arrow_upward, color: Colors.green, size: 14),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // --- AI Farming Assistant Card ---
  Widget _buildAIAssistantCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE8F5E9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFC8E6C9)),
      ),
      child: Row(
        children: [
          Image.asset(
            'assets/images/ai-bot.png',
            width: 60,
            height: 60,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stackTrace) => Container(
              width: 60,
              height: 60,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.smart_toy, color: Color(0xFF1B6327), size: 36),
            ),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Your AI Farming Assistant',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF1B3B22),
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Ask anything in your language\ne.g. "నా పొలానికి ఏ పంట బాగుంటుంది?"',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFF3F6446),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Color(0xFF1B6327),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.mic, color: Colors.white, size: 28),
          ),
        ],
      ),
    );
  }

  // --- Recommendations List ---
  Widget _buildRecommendationsList() {
    final recommendations = [
      {'title': 'Best crops for this season', 'icon': Icons.grass},
      {'title': 'How to control leaf spot?', 'icon': Icons.pest_control},
      {'title': 'Improve soil organic matter', 'icon': Icons.landscape},
    ];

    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: recommendations.length,
        separatorBuilder: (context, index) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final item = recommendations[index];
          return Container(
            width: 240,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F8E9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(item['icon'] as IconData, color: const Color(0xFF558B2F), size: 32),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item['title'] as String,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: Colors.black87,
                          height: 1.2,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right, color: Colors.grey),
              ],
            ),
          );
        },
      ),
    );
  }
}
