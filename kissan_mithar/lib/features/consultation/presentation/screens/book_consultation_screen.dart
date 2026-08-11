import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../models/consultation_model.dart';
import '../../providers/consultation_provider.dart';
import '../../../../l10n/app_localizations.dart';

class BookConsultationScreen extends ConsumerWidget {
  const BookConsultationScreen({super.key});

  List<IssueCategory> _getCategories(AppLocalizations l10n) => [
    IssueCategory(
      id: 'pest',
      title: l10n.pestAndDisease,
      subtitle: l10n.pestAndDiseaseSub,
      icon: Icons.bug_report_rounded,
      accentColor: const Color(0xFFC62828),
      backgroundImage: 'assets/images/pest-desease.png',
    ),
    IssueCategory(
      id: 'soil',
      title: l10n.soilAndFertilizer,
      subtitle: l10n.soilAndFertilizerSub,
      icon: Icons.terrain_rounded,
      accentColor: const Color(0xFF5D4037),
      backgroundImage: 'assets/images/soil-testing.png',
    ),
    IssueCategory(
      id: 'water',
      title: l10n.waterAndDrip,
      subtitle: l10n.waterAndDripSub,
      icon: Icons.water_drop_rounded,
      accentColor: const Color(0xFF1565C0),
      backgroundImage: 'assets/images/water-drip.png',
    ),
    IssueCategory(
      id: 'crops',
      title: l10n.cropPlanning,
      subtitle: l10n.cropPlanningSub,
      icon: Icons.agriculture_rounded,
      accentColor: const Color(0xFF2E7D32),
      backgroundImage: 'assets/images/crop-planning.png',
    ),
    IssueCategory(
      id: 'growth',
      title: l10n.growthAndFlowering,
      subtitle: l10n.growthAndFloweringSub,
      icon: Icons.eco_rounded,
      accentColor: const Color(0xFFEF6C00),
      backgroundImage: 'assets/images/growth-flowering.png',
    ),
    IssueCategory(
      id: 'market',
      title: l10n.marketAndPricing,
      subtitle: l10n.marketAndPricingSub,
      icon: Icons.storefront_rounded,
      accentColor: const Color(0xFF6A1B9A),
      backgroundImage: 'assets/images/market-prices.png',
    ),
  ];

  static final List<String> _timeSlots = [
    'Today, 4:00 PM',
    'Today, 6:30 PM',
    'Tomorrow, 10:00 AM',
    'Tomorrow, 2:30 PM',
    'Tomorrow, 5:00 PM',
  ];

  static final List<String> _languages = [
    'Telugu (తెలుగు)',
    'Hindi (हिंदी)',
    'English',
    'Kannada (ಕನ್ನಡ)',
  ];

  Widget _buildModeCard(
    BuildContext context,
    WidgetRef ref,
    CommunicationMode mode,
    bool isSelected,
  ) {
    return Expanded(
      child: InkWell(
        onTap: () =>
            ref.read(consultationBookingProvider.notifier).setMode(mode),
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF1B6327) : AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelected
                  ? const Color(0xFF1B6327)
                  : const Color(0xFFC7CEC7),
              width: isSelected ? 2.2 : 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: isSelected
                    ? const Color(0xFF1B6327).withAlpha(50)
                    : Colors.black.withAlpha(6),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Colors.white.withAlpha(40)
                      : const Color(0xFFE8F5E9),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  mode.icon,
                  size: 26,
                  color: isSelected ? Colors.white : AppColors.primaryGreen,
                ),
              ),
              const SizedBox(height: 10),
                Text(
                  _getCommunicationModeLabel(mode, AppLocalizations.of(context)!),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryGrid(
    BuildContext context,
    WidgetRef ref,
    List<String> selectedCategories,
    List<IssueCategory> categories,
  ) {
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.45,
      ),
      itemBuilder: (context, index) {
        final cat = categories[index];
        final isSelected = selectedCategories.contains(cat.title);

        return InkWell(
          onTap: () => ref
              .read(consultationBookingProvider.notifier)
              .toggleCategory(cat.title),
          borderRadius: BorderRadius.circular(16),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected
                    ? AppColors.primaryGreen
                    : const Color(0xFFD5D5D5),
                width: isSelected ? 3.5 : 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: isSelected
                      ? AppColors.primaryGreen.withAlpha(30)
                      : Colors.black.withAlpha(8),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(isSelected ? 13.5 : 14.8),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Background image
                  if (cat.backgroundImage != null)
                    Image.asset(
                      cat.backgroundImage!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => Container(
                        color: cat.accentColor.withAlpha(20),
                        child: Center(
                          child: Icon(cat.icon, size: 40, color: cat.accentColor.withAlpha(80)),
                        ),
                      ),
                    ),

                  // Gradient overlay for text readability (Darker on the left, fading to right)
                  Positioned.fill(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                          colors: [
                            Colors.black.withAlpha(180),
                            Colors.black.withAlpha(120),
                            Colors.transparent,
                          ],
                          stops: const [0.0, 0.6, 1.0],
                        ),
                      ),
                    ),
                  ),

                  // Icon badge + text, vertically centered
                  Align(
                    alignment: Alignment.centerLeft,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Icon in rounded container
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF2EFE9), // Off-white/cream color matching the snapshot
                              borderRadius: BorderRadius.circular(12),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withAlpha(30),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Icon(cat.icon, color: cat.accentColor, size: 24),
                          ),
                          const SizedBox(width: 12),
                          // Title + subtitle
                          Expanded(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  cat.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                    shadows: [
                                      Shadow(
                                        blurRadius: 2,
                                        color: Colors.black87,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  cat.subtitle,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.white.withAlpha(230),
                                    shadows: const [
                                      Shadow(
                                        blurRadius: 2,
                                        color: Colors.black87,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Green check badge on selection, positioned on the right
                          if (isSelected)
                            Container(
                              margin: const EdgeInsets.only(left: 4),
                              padding: const EdgeInsets.all(2),
                              decoration: const BoxDecoration(
                                color: AppColors.primaryGreen,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.check,
                                color: Colors.white,
                                size: 16,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),

                  // Green tint overlay for selected state
                  if (isSelected)
                    Positioned.fill(
                      child: Container(
                        color: AppColors.primaryGreen.withAlpha(50),
                      ),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String _getCommunicationModeLabel(CommunicationMode mode, AppLocalizations l10n) {
    switch (mode) {
      case CommunicationMode.voiceCall:
        return l10n.voiceCall;
      case CommunicationMode.videoCall:
        return l10n.videoCall;
      case CommunicationMode.chat:
        return l10n.chatAdvisory;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingState = ref.watch(consultationBookingProvider);
    final draft = bookingState.valueOrNull ?? const ConsultationBookingDraft();
    final l10n = AppLocalizations.of(context)!;
    final categories = _getCategories(l10n);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: FarmerAppBar(
        onBackTap: () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/home');
          }
        },
        showTractorIcon: false,
        showBrandTitle: true,
        showLanguagePill: true,
        customActions: [
          IconButton(
            onPressed: () => context.push('/consultation/history'),
            icon: const Icon(Icons.history_rounded,
                color: AppColors.primaryGreen, size: 26),
            tooltip: 'Consultation History',
          ),
        ],
      ),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: SingleChildScrollView(
              padding:
                  const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Step Indicator Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                          child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.bookAnExpert,
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w900,
                                color: AppColors.textPrimary,
                                letterSpacing: -0.5,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              l10n.step1Of2SessionPreference,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primaryGreen,
                              ),
                            ),
                          ],
                        ),   ),
                      const SizedBox(width: 8),
                      // History Shortcut Chip
                      ActionChip(
                        onPressed: () => context.push('/consultation/history'),
                        avatar: const Icon(Icons.receipt_long_rounded,
                            size: 18, color: AppColors.primaryGreen),
                        label: Text(
                          l10n.myBookings,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                        backgroundColor: const Color(0xFFE8F5E9),
                        side: const BorderSide(color: Color(0xFFC7CEC7)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 22),

                  // 1. Communication Mode Section
                  Text(
                    l10n.chooseConsultationMode,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _buildModeCard(
                        context,
                        ref,
                        CommunicationMode.voiceCall,
                        draft.mode == CommunicationMode.voiceCall,
                      ),
                      const SizedBox(width: 10),
                      _buildModeCard(
                        context,
                        ref,
                        CommunicationMode.videoCall,
                        draft.mode == CommunicationMode.videoCall,
                      ),
                      const SizedBox(width: 10),
                      _buildModeCard(
                        context,
                        ref,
                        CommunicationMode.chat,
                        draft.mode == CommunicationMode.chat,
                      ),
                    ],
                  ),

                  const SizedBox(height: 26),

                  // 2. Issue Category Section
                  Text(
                    l10n.selectCropIssueCategory,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildCategoryGrid(context, ref, draft.categories, categories),

                  const SizedBox(height: 36),

                  // Next Button
                  LargeButton(
                    label: l10n.next,
                    leadingIcon: const _AnimatedArrow(),
                    onPressed: () {
                      context.push('/consultation/add-details');
                    },
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _AnimatedArrow extends StatefulWidget {
  const _AnimatedArrow();

  @override
  State<_AnimatedArrow> createState() => _AnimatedArrowState();
}

class _AnimatedArrowState extends State<_AnimatedArrow> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0, end: 6).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(_animation.value, 0),
          child: child,
        );
      },
      child: const Icon(
        Icons.arrow_forward_rounded,
        color: Colors.white,
        size: 22,
      ),
    );
  }
}
