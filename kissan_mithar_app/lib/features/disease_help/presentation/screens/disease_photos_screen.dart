import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../../../shared/widgets/media_picker_card.dart';
import '../../../../l10n/app_localizations.dart';

class DiseasePhotosScreen extends StatefulWidget {
  const DiseasePhotosScreen({super.key});

  @override
  State<DiseasePhotosScreen> createState() => _DiseasePhotosScreenState();
}

class _DiseasePhotosScreenState extends State<DiseasePhotosScreen> {
  List<String> _mediaPaths = [];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Disease Help'),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Show us the problem',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF1B3B22),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Take clear photos of the crop, affected leaves, or any insects you see.',
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
              
              const Spacer(),
              
              LargeButton(
                label: 'Next',
                onPressed: _mediaPaths.isEmpty ? () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please add at least one photo first.')),
                  );
                } : () {
                  context.push('/disease-help/voice');
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
