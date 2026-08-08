import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../models/consultation_model.dart';
import '../../providers/consultation_provider.dart';

class BookConsultationScreen extends ConsumerWidget {
  const BookConsultationScreen({super.key});

  static final List<IssueCategory> _categories = [
    const IssueCategory(
      id: 'pest',
      title: 'Pest & Disease',
      subtitle: 'Insects, fungal rot, blight',
      icon: Icons.bug_report_rounded,
      accentColor: Color(0xFFC62828),
    ),
    const IssueCategory(
      id: 'soil',
      title: 'Soil & Fertilizer',
      subtitle: 'Nutrients, salinity, pH',
      icon: Icons.terrain_rounded,
      accentColor: Color(0xFF5D4037),
    ),
    const IssueCategory(
      id: 'water',
      title: 'Water & Drip',
      subtitle: 'Irrigation, pump pressure',
      icon: Icons.water_drop_rounded,
      accentColor: Color(0xFF1565C0),
    ),
    const IssueCategory(
      id: 'crops',
      title: 'Crop Planning',
      subtitle: 'Varieties, sowing guide',
      icon: Icons.agriculture_rounded,
      accentColor: Color(0xFF2E7D32),
    ),
    const IssueCategory(
      id: 'growth',
      title: 'Growth & Flowering',
      subtitle: 'Flower drop, fruit size',
      icon: Icons.eco_rounded,
      accentColor: Color(0xFFEF6C00),
    ),
    const IssueCategory(
      id: 'market',
      title: 'Market & Pricing',
      subtitle: 'Mandi rates, buyer links',
      icon: Icons.storefront_rounded,
      accentColor: Color(0xFF6A1B9A),
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
                mode.label,
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
    String selectedCategory,
  ) {
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: _categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.6,
      ),
      itemBuilder: (context, index) {
        final cat = _categories[index];
        final isSelected = cat.title == selectedCategory;

        return InkWell(
          onTap: () => ref
              .read(consultationBookingProvider.notifier)
              .setCategory(cat.title),
          borderRadius: BorderRadius.circular(14),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSelected
                  ? const Color(0xFFE8F5E9)
                  : AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isSelected
                    ? AppColors.primaryGreen
                    : const Color(0xFFC7CEC7),
                width: isSelected ? 2.0 : 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(5),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: cat.accentColor.withAlpha(25),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(cat.icon, color: cat.accentColor, size: 24),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        cat.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: isSelected
                              ? AppColors.primaryGreen
                              : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        cat.subtitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isSelected)
                  const Icon(Icons.check_circle_rounded,
                      color: AppColors.primaryGreen, size: 18),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingState = ref.watch(consultationBookingProvider);
    final draft = bookingState.value ?? const ConsultationBookingDraft();

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
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Book an Expert',
                              style: TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w900,
                                color: AppColors.textPrimary,
                                letterSpacing: -0.5,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Step 1 of 2: Session Preference',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primaryGreen,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      // History Shortcut Chip
                      ActionChip(
                        onPressed: () => context.push('/consultation/history'),
                        avatar: const Icon(Icons.receipt_long_rounded,
                            size: 18, color: AppColors.primaryGreen),
                        label: const Text(
                          'My Bookings',
                          style: TextStyle(
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
                  const Text(
                    '1. Choose Consultation Mode',
                    style: TextStyle(
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
                  const Text(
                    '2. Select Crop Issue Category',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildCategoryGrid(context, ref, draft.category),

                  const SizedBox(height: 26),

                  // 3. Preferred Time Slot Section
                  const Text(
                    '3. Preferred Time Slot',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: _timeSlots.map((slot) {
                      final isSelected = draft.timeSlot == slot;
                      return ChoiceChip(
                        label: Text(slot),
                        selected: isSelected,
                        onSelected: (_) => ref
                            .read(consultationBookingProvider.notifier)
                            .setTimeSlot(slot),
                        selectedColor: AppColors.primaryGreen,
                        backgroundColor: AppColors.surface,
                        labelStyle: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                            color: isSelected
                                ? AppColors.primaryGreen
                                : const Color(0xFFC7CEC7),
                            width: 1.4,
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 26),

                  // 4. Preferred Language Section
                  const Text(
                    '4. Preferred Language',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: _languages.map((lang) {
                      final isSelected = draft.language.startsWith(lang.split(' ').first);
                      return ChoiceChip(
                        label: Text(lang),
                        selected: isSelected,
                        onSelected: (_) => ref
                            .read(consultationBookingProvider.notifier)
                            .setLanguage(lang.split(' ').first),
                        selectedColor: AppColors.primaryGreen,
                        backgroundColor: AppColors.surface,
                        labelStyle: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                            color: isSelected
                                ? AppColors.primaryGreen
                                : const Color(0xFFC7CEC7),
                            width: 1.4,
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: 36),

                  // Next Button
                  LargeButton(
                    label: 'Next: Add Crop Details',
                    leadingIcon: const Icon(
                      Icons.arrow_forward_rounded,
                      color: Colors.white,
                      size: 22,
                    ),
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
