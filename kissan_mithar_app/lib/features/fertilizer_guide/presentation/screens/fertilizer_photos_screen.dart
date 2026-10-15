import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../../../shared/widgets/media_picker_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../providers/fertilizer_guide_provider.dart';

class FertilizerPhotosScreen extends ConsumerStatefulWidget {
  const FertilizerPhotosScreen({super.key});

  @override
  ConsumerState<FertilizerPhotosScreen> createState() => _FertilizerPhotosScreenState();
}

class _FertilizerPhotosScreenState extends ConsumerState<FertilizerPhotosScreen> {
  late List<String> _mediaPaths;

  @override
  void initState() {
    super.initState();
    _mediaPaths = List<String>.from(ref.read(fertilizerGuideProvider).photos);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Plant Photos'),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Take photos of your plants',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF1B3B22),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'We will analyze the photos to understand your crop and suggest the best fertilizers.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.black87,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 32),
              
              MediaPickerCard(
                title: l10n.addPhotosOfCropIssue,
                hintText: l10n.uploadClearPhotos,
                takePhotoLabel: l10n.takePhoto,
                uploadFromGalleryLabel: l10n.uploadFromGallery,
                initialMediaPaths: _mediaPaths,
                onMediaChanged: (paths) {
                  setState(() {
                    _mediaPaths = paths;
                  });
                },
              ),
              
              Expanded(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16.0),
                    child: Image.asset(
                      'assets/images/plant-photo-taking.png',
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.eco_rounded,
                        size: 100,
                        color: Color(0xFF1B6327),
                      ),
                    ),
                  ),
                ),
              ),
              
              LargeButton(
                label: 'Next',
                onPressed: _mediaPaths.isEmpty ? () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please add at least one photo first.')),
                  );
                } : () {
                  ref.read(fertilizerGuideProvider.notifier).setPhotos(_mediaPaths);
                  context.push('/fertilizer-guide/location');
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
