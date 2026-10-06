import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../../core/constants/app_colors.dart';

class FarmMachineryHomeScreen extends StatelessWidget {
  const FarmMachineryHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const FarmerAppBar(title: 'Farm Machinery'),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Farm Machinery',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Find agricultural machines near you and contact the owner directly.',
                style: TextStyle(fontSize: 16, color: Colors.black87, height: 1.4),
              ),
              const SizedBox(height: 40),
              
              InkWell(
                onTap: () {
                  context.push('/farm-machinery/location?next=/farm-machinery/list');
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppColors.tertiary,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(color: AppColors.tertiary.withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.location_on, color: Colors.white, size: 32),
                      SizedBox(width: 16),
                      Expanded(
                        child: Text(
                          'Find Nearby Machinery',
                          style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Icon(Icons.arrow_forward, color: Colors.white),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              InkWell(
                onTap: () {
                  context.push('/farm-machinery/list');
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.search, color: AppColors.tertiary, size: 32),
                      SizedBox(width: 16),
                      Expanded(
                        child: Text(
                          'Search Machinery',
                          style: TextStyle(color: Colors.black87, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Icon(Icons.arrow_forward, color: Colors.grey),
                    ],
                  ),
                ),
              ),
              
              const Spacer(),
              
              Center(
                child: TextButton.icon(
                  onPressed: () {
                    context.push('/farm-machinery/provider/register');
                  },
                  icon: const Icon(Icons.add_circle_outline, color: AppColors.tertiary),
                  label: const Text('Register as Machinery Provider', style: TextStyle(color: AppColors.tertiary, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
