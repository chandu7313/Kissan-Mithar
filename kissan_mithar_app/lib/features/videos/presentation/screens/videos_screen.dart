import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class VideoData {
  final String title;
  final String thumbnailUrl;
  final String duration;
  final String author;
  final String category;

  VideoData({
    required this.title,
    required this.thumbnailUrl,
    required this.duration,
    required this.author,
    required this.category,
  });
}

class VideosScreen extends StatelessWidget {
  const VideosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Dummy Data
    final List<VideoData> videos = [
      VideoData(
        title: 'How to prepare soil for Cotton farming',
        thumbnailUrl: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=1000&auto=format&fit=crop', // Cotton field
        duration: '12:45',
        author: 'Dr. Ramesh Kumar',
        category: 'Farming Tips',
      ),
      VideoData(
        title: 'Modern Drip Irrigation Setup Guide',
        thumbnailUrl: 'https://images.unsplash.com/photo-1629853971948-433a0deee659?q=80&w=1000&auto=format&fit=crop', // Irrigation
        duration: '08:20',
        author: 'Kissan Mithar Experts',
        category: 'Technology',
      ),
      VideoData(
        title: 'Identifying common Paddy diseases early',
        thumbnailUrl: 'https://images.unsplash.com/photo-1595841696677-6479f64af1f2?q=80&w=1000&auto=format&fit=crop', // Paddy
        duration: '15:10',
        author: 'Agri University',
        category: 'Disease Control',
      ),
      VideoData(
        title: 'Best practices for safe pesticide spraying',
        thumbnailUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1000&auto=format&fit=crop', // Spraying
        duration: '05:30',
        author: 'Govt Agri Dept',
        category: 'Safety',
      ),
      VideoData(
        title: 'Increase yield with organic fertilizers',
        thumbnailUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1000&auto=format&fit=crop', // Soil/Fertilizer
        duration: '10:05',
        author: 'Organic Farms India',
        category: 'Fertilizers',
      ),
    ];

    final categories = ['All', 'Farming Tips', 'Disease Control', 'Technology', 'Fertilizers', 'Safety'];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Farming Videos', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Categories
          Container(
            height: 60,
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: categories.length,
              itemBuilder: (context, index) {
                final isSelected = index == 0;
                return Container(
                  margin: const EdgeInsets.only(right: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.tertiary : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: isSelected ? AppColors.tertiary : Colors.grey.shade300),
                  ),
                  child: Center(
                    child: Text(
                      categories[index],
                      style: TextStyle(
                        color: isSelected ? Colors.white : AppColors.textSecondary,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          
          // Video List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: videos.length,
              itemBuilder: (context, index) {
                final video = videos[index];
                return _buildVideoCard(video);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVideoCard(VideoData video) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Thumbnail
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), topRight: Radius.circular(16)),
                child: Image.network(
                  video.thumbnailUrl,
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (c, e, s) => Container(
                    height: 200,
                    color: Colors.grey.shade300,
                    child: const Icon(Icons.video_library, size: 50, color: Colors.grey),
                  ),
                ),
              ),
              // Play button overlay
              Positioned.fill(
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.black.withAlpha(120),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.play_arrow_rounded, color: Colors.white, size: 40),
                  ),
                ),
              ),
              // Duration badge
              Positioned(
                bottom: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withAlpha(180),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    video.duration,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
          
          // Details
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.peachAccent.withAlpha(120),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    video.category,
                    style: const TextStyle(color: AppColors.peachIcon, fontSize: 10, fontWeight: FontWeight.w800),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  video.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    height: 1.3,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.person_outline_rounded, size: 16, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      video.author,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
