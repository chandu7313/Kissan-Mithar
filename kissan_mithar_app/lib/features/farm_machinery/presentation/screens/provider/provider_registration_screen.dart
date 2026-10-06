import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../../shared/widgets/large_button.dart';


class ProviderRegistrationScreen extends ConsumerStatefulWidget {
  const ProviderRegistrationScreen({super.key});

  @override
  ConsumerState<ProviderRegistrationScreen> createState() => _ProviderRegistrationScreenState();
}

class _ProviderRegistrationScreenState extends ConsumerState<ProviderRegistrationScreen> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Register Machinery'),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Register Your Machinery',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF1B3B22),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Add your agricultural machines so nearby farmers can contact you.',
                      style: TextStyle(fontSize: 16, color: Colors.black87, height: 1.4),
                    ),
                    const SizedBox(height: 32),
                    
                    TextField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Provider Name (Individual or Business)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Phone Number',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Location', style: TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: const Text('Gadwal, Telangana'), // Default or selected
                      trailing: TextButton(
                        onPressed: () {
                          // Change location logic
                        },
                        child: const Text('Change', style: TextStyle(color: Color(0xFF1B6327))),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -4)),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                child: LargeButton(
                  label: 'Start Registration',
                  onPressed: () {
                    if (_nameController.text.isNotEmpty && _phoneController.text.isNotEmpty) {
                      context.pushReplacement('/farm-machinery/provider/dashboard');
                    }
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
