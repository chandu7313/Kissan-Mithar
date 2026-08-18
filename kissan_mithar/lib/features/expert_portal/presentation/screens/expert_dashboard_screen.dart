import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../providers/expert_provider.dart';

class ExpertDashboardScreen extends ConsumerWidget {
  const ExpertDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(expertPortalProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primaryGreen,
        title: const Text(
          'Expert Portal',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            onPressed: () => ref.read(expertPortalProvider.notifier).fetchData(),
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => ref.read(expertPortalProvider.notifier).fetchData(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  const Text(
                    'Orchard Plans Submitted',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (state.orchardRequests.isEmpty)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 24),
                      child: Text('No orchard plans found.', style: TextStyle(color: Colors.grey)),
                    ),
                  ...state.orchardRequests.map((req) {
                    final status = req['status'] ?? 'UNKNOWN';
                    final farmer = req['farmer']?['name'] ?? 'Unknown Farmer';
                    final size = req['landDetails']?['size'] ?? 'Unknown Size';
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Color(0xFFE8F5E9),
                          child: Icon(Icons.agriculture_rounded, color: AppColors.primaryGreen),
                        ),
                        title: Text('Farmer: $farmer ($size)'),
                        subtitle: Text('Status: $status'),
                        trailing: const Icon(Icons.chevron_right_rounded),
                        onTap: () {
                          // Detail view can be added here
                        },
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 24),
                  const Text(
                    'Consultations Booked',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (state.consultations.isEmpty)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 24),
                      child: Text('No consultations found.', style: TextStyle(color: Colors.grey)),
                    ),
                  ...state.consultations.map((c) {
                    final status = c['status'] ?? 'UNKNOWN';
                    final mode = c['mode'] ?? 'Unknown Mode';
                    final cat = c['category'] ?? 'General';
                    final farmer = c['farmer']?['name'] ?? 'Unknown Farmer';
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Color(0xFFE3F2FD),
                          child: Icon(Icons.support_agent_rounded, color: Colors.blue),
                        ),
                        title: Text('Farmer: $farmer ($cat)'),
                        subtitle: Text('Mode: $mode | Status: $status'),
                        trailing: const Icon(Icons.chevron_right_rounded),
                        onTap: () {},
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),
    );
  }
}
