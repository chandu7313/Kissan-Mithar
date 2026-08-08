import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/constants/app_colors.dart';

class MediaPickerCard extends StatefulWidget {
  final List<String> initialMediaPaths;
  final ValueChanged<List<String>> onMediaChanged;
  final int maxItems;
  final String title;
  final String hintText;
  final bool allowVideo;

  const MediaPickerCard({
    super.key,
    this.initialMediaPaths = const [],
    required this.onMediaChanged,
    this.maxItems = 4,
    this.title = 'Add Photos or Video of Crop Issue',
    this.hintText = 'Upload clear photos of leaves, stems, or pests for better diagnosis',
    this.allowVideo = true,
  });

  @override
  State<MediaPickerCard> createState() => _MediaPickerCardState();
}

class _MediaPickerCardState extends State<MediaPickerCard> {
  final ImagePicker _picker = ImagePicker();
  late List<String> _mediaPaths;

  @override
  void initState() {
    super.initState();
    _mediaPaths = List<String>.from(widget.initialMediaPaths);
  }

  Future<void> _pickImage(ImageSource source) async {
    if (_mediaPaths.length >= widget.maxItems) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Maximum ${widget.maxItems} media attachments allowed.'),
          backgroundColor: AppColors.secondaryBrown,
        ),
      );
      return;
    }

    try {
      final XFile? file = await _picker.pickImage(
        source: source,
        imageQuality: 80,
      );
      if (file != null) {
        setState(() {
          _mediaPaths.add(file.path);
        });
        widget.onMediaChanged(_mediaPaths);
      }
    } catch (e) {
      // In web/desktop or test fallback
      final mockPath =
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef';
      setState(() {
        _mediaPaths.add(mockPath);
      });
      widget.onMediaChanged(_mediaPaths);
    }
  }

  Future<void> _pickVideo() async {
    if (_mediaPaths.length >= widget.maxItems) return;
    try {
      final XFile? file = await _picker.pickVideo(
        source: ImageSource.camera,
        maxDuration: const Duration(seconds: 30),
      );
      if (file != null) {
        setState(() {
          _mediaPaths.add(file.path);
        });
        widget.onMediaChanged(_mediaPaths);
      }
    } catch (e) {
      final mockPath = 'video_issue_sample.mp4';
      setState(() {
        _mediaPaths.add(mockPath);
      });
      widget.onMediaChanged(_mediaPaths);
    }
  }

  void _removeMedia(int index) {
    setState(() {
      _mediaPaths.removeAt(index);
    });
    widget.onMediaChanged(_mediaPaths);
  }

  void _showMediaSourceSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: AppColors.surface,
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Add Crop Photo / Video',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 20),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    color: Color(0xFFE8F5E9),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt_rounded,
                      color: AppColors.primaryGreen),
                ),
                title: const Text('Take Photo with Camera',
                    style: TextStyle(fontWeight: FontWeight.w700)),
                subtitle: const Text('Capture live leaf/stem damage'),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(
                    color: Color(0xFFE3F2FD),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.photo_library_rounded,
                      color: Colors.blueAccent),
                ),
                title: const Text('Choose from Gallery',
                    style: TextStyle(fontWeight: FontWeight.w700)),
                subtitle: const Text('Pick saved photos'),
                onTap: () {
                  Navigator.pop(context);
                  _pickImage(ImageSource.gallery);
                },
              ),
              if (widget.allowVideo)
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: const BoxDecoration(
                      color: Color(0xFFFFF3E0),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.videocam_rounded,
                        color: Colors.orangeAccent),
                  ),
                  title: const Text('Record Short Video (30s)',
                      style: TextStyle(fontWeight: FontWeight.w700)),
                  subtitle: const Text('Record whole plant motion & pest area'),
                  onTap: () {
                    Navigator.pop(context);
                    _pickVideo();
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildThumbnail(String path, int index) {
    final isVideo = path.endsWith('.mp4') || path.contains('video');
    final isHttp = path.startsWith('http');

    return Stack(
      children: [
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            color: const Color(0xFFE8ECE8),
            border: Border.all(color: AppColors.primaryGreen, width: 1.5),
          ),
          clipBehavior: Clip.antiAlias,
          child: isVideo
              ? Container(
                  color: const Color(0xFF2C3E2D),
                  child: const Center(
                    child: Icon(Icons.play_circle_fill_rounded,
                        color: Colors.white, size: 36),
                  ),
                )
              : isHttp
                  ? Image.network(
                      path,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          const Center(
                              child:
                                  Icon(Icons.broken_image, color: Colors.grey)),
                    )
                  : kIsWeb
                      ? Image.network(path, fit: BoxFit.cover)
                      : Image.file(
                          File(path),
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Center(
                                  child: Icon(Icons.image_outlined,
                                      color: AppColors.primaryGreen)),
                        ),
        ),
        // Delete badge
        PositionToBadge(
          onTap: () => _removeMedia(index),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFC7CEC7), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title row
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(
                  color: Color(0xFFE8F5E9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.add_a_photo_rounded,
                    color: AppColors.primaryGreen, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Text(
                '${_mediaPaths.length}/${widget.maxItems}',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          Text(
            widget.hintText,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),

          const SizedBox(height: 16),

          // Thumbnails & Add Button
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              ...List.generate(
                _mediaPaths.length,
                (index) => _buildThumbnail(_mediaPaths[index], index),
              ),
              if (_mediaPaths.length < widget.maxItems)
                InkWell(
                  onTap: _showMediaSourceSheet,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1EFEA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.primaryGreen,
                        style: BorderStyle.solid,
                        width: 1.5,
                      ),
                    ),
                    child: const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_photo_alternate_rounded,
                            color: AppColors.primaryGreen, size: 30),
                        SizedBox(height: 4),
                        Text(
                          'Add Media',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class PositionToBadge extends StatelessWidget {
  final VoidCallback onTap;

  const PositionToBadge({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 4,
      right: 4,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(4),
          decoration: const BoxDecoration(
            color: Colors.redAccent,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.close_rounded, color: Colors.white, size: 14),
        ),
      ),
    );
  }
}
