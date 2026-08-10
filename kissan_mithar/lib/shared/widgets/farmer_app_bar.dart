import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/localization/app_language.dart';

class FarmerAppBar extends ConsumerWidget implements PreferredSizeWidget {
  final Widget? leading;
  final bool showBrandTitle;
  final bool showTractorIcon;
  final bool showLanguagePill;
  final bool showProfileAvatar;
  final bool showGlobeInLanguagePill;
  final String? title;
  final List<Widget>? customActions;
  final VoidCallback? onMenuTap;
  final VoidCallback? onBackTap;
  final VoidCallback? onProfileTap;

  const FarmerAppBar({
    super.key,
    this.leading,
    this.showBrandTitle = true,
    this.showTractorIcon = false,
    this.showLanguagePill = true,
    this.showProfileAvatar = false,
    this.showGlobeInLanguagePill = false,
    this.title,
    this.customActions,
    this.onMenuTap,
    this.onBackTap,
    this.onProfileTap,
  });

  @override
  Size get preferredSize => const Size.fromHeight(60);

  void _showLanguageDialog(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        final current = ref.watch(languageNotifierProvider);
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Select Language / भाषा चुनें',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1B2A1C),
                  ),
                ),
                const SizedBox(height: 16),
                ...AppLanguage.values.map((lang) {
                  final isSelected = lang == current;
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
                        Navigator.pop(ctx);
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
    final currentLanguage = ref.watch(languageNotifierProvider);

    return AppBar(
      backgroundColor: AppColors.background,
      elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: false,
          leadingWidth: leading != null ? 56 : (onBackTap != null ? 56 : (onMenuTap != null ? 56 : 0)),
          leading: leading ??
              (onBackTap != null
                  ? IconButton(
                      icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary, size: 26),
                      onPressed: onBackTap,
                    )
                  : (onMenuTap != null
                      ? IconButton(
                          icon: const Icon(Icons.menu, color: AppColors.textPrimary, size: 28),
                          onPressed: onMenuTap,
                        )
                      : const SizedBox.shrink())),
          title: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (showTractorIcon) ...[
                Image.asset(
                  'assets/images/app_logo.png',
                  height: 32,
                  width: 32,
                  fit: BoxFit.contain,
                  errorBuilder: (_, _, _) => const Icon(
                    Icons.agriculture_rounded,
                    color: AppColors.primaryGreen,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 8),
              ],
              if (title != null)
                Text(
                  title!,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    letterSpacing: -0.5,
                  ),
                ),
            ],
          ),
          actions: [
            if (customActions != null) ...customActions!,
            if (showLanguagePill)
              Padding(
                padding: const EdgeInsets.only(right: 12),
                child: InkWell(
                  onTap: () => _showLanguageDialog(context, ref),
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF1B6327).withAlpha(40)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(8),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.language_rounded,
                          size: 16,
                          color: Color(0xFF1B6327),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          currentLanguage.nativeName,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF1B6327),
                          ),
                        ),
                        const SizedBox(width: 2),
                        const Icon(
                          Icons.arrow_drop_down,
                          size: 18,
                          color: Color(0xFF1B6327),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            if (showProfileAvatar)
              Padding(
                padding: const EdgeInsets.only(right: 16),
                child: InkWell(
                  onTap: onProfileTap,
                  borderRadius: BorderRadius.circular(22),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primaryGreen, width: 1.5),
                    ),
                    child: const CircleAvatar(
                      backgroundColor: Color(0xFFE8F5E9),
                      backgroundImage: AssetImage('assets/images/profile-image.png'),
                    ),
                  ),
                ),
              ),
          ],
        );
  }
}
