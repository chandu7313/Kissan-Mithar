import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../providers/labour_provider.dart';

class MyLabourGroupScreen extends ConsumerWidget {
  const MyLabourGroupScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final group = ref.watch(registerLabourGroupProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: FarmerAppBar(
        title: 'My Group',
        onBackTap: () => context.go('/home'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 64),
              const SizedBox(height: 16),
              const Text(
                'Registration Successful!',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
              ),
              const SizedBox(height: 8),
              const Text(
                'Farmers can now see your group and contact you for work.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 16, color: Colors.black54),
              ),
              const SizedBox(height: 32),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(group.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 4),
                    Text('Leader: ${group.leaderName}', style: const TextStyle(fontSize: 16, color: Colors.black54)),
                    const Divider(height: 32),
                    Row(
                      children: [
                        const Icon(Icons.group, color: Color(0xFF1B6327)),
                        const SizedBox(width: 12),
                        Text('${group.memberCount} Members', style: const TextStyle(fontSize: 16)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: Color(0xFF1B6327)),
                        const SizedBox(width: 12),
                        Text(group.location, style: const TextStyle(fontSize: 16)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Icon(Icons.phone, color: Color(0xFF1B6327)),
                        const SizedBox(width: 12),
                        Text(group.phone, style: const TextStyle(fontSize: 16)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: LargeButton(
                  label: 'Back to Home',
                  onPressed: () {
                    context.go('/home');
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
