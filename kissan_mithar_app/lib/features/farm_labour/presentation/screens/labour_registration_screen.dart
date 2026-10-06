import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../shared/widgets/large_button.dart';
import '../../providers/labour_provider.dart';

class LabourRegistrationScreen extends ConsumerStatefulWidget {
  const LabourRegistrationScreen({super.key});

  @override
  ConsumerState<LabourRegistrationScreen> createState() => _LabourRegistrationScreenState();
}

class _LabourRegistrationScreenState extends ConsumerState<LabourRegistrationScreen> {
  int _currentStep = 0;
  
  final _nameController = TextEditingController();
  final _leaderController = TextEditingController();
  final _membersController = TextEditingController();
  final _descController = TextEditingController();
  final _wageController = TextEditingController();
  final _locationController = TextEditingController();
  final _phoneController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _leaderController.dispose();
    _membersController.dispose();
    _descController.dispose();
    _wageController.dispose();
    _locationController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _submit() {
    final notifier = ref.read(registerLabourGroupProvider.notifier);
    notifier.updateName(_nameController.text, _leaderController.text);
    notifier.updateMembers(int.tryParse(_membersController.text) ?? 1);
    notifier.updateWorkDescription(_descController.text, double.tryParse(_wageController.text) ?? 0);
    notifier.updateLocation(_locationController.text);
    notifier.updateContact(_phoneController.text);
    notifier.completeRegistration();
    
    context.pushReplacement('/farm-labour/my-group');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Register Group'),
      body: SafeArea(
        child: Stepper(
          type: StepperType.vertical,
          currentStep: _currentStep,
          onStepContinue: () {
            if (_currentStep < 4) {
              setState(() => _currentStep += 1);
            } else {
              _submit();
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() => _currentStep -= 1);
            } else {
              context.pop();
            }
          },
          controlsBuilder: (context, details) {
            return Padding(
              padding: const EdgeInsets.only(top: 24.0),
              child: Row(
                children: [
                  Expanded(
                    child: LargeButton(
                      label: _currentStep == 4 ? 'Register' : 'Next',
                      onPressed: details.onStepContinue,
                    ),
                  ),
                  if (_currentStep > 0) ...[
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: details.onStepCancel,
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          side: const BorderSide(color: Colors.grey),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Back', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 16)),
                      ),
                    ),
                  ],
                ],
              ),
            );
          },
          steps: [
            Step(
              title: const Text('Group Information', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                children: [
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Group Name', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _leaderController,
                    decoration: const InputDecoration(labelText: 'Leader Name', border: OutlineInputBorder()),
                  ),
                ],
              ),
              isActive: _currentStep >= 0,
            ),
            Step(
              title: const Text('Add Members', style: TextStyle(fontWeight: FontWeight.bold)),
              content: TextField(
                controller: _membersController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Total Number of Members', border: OutlineInputBorder()),
              ),
              isActive: _currentStep >= 1,
            ),
            Step(
              title: const Text('Work Description', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                children: [
                  TextField(
                    controller: _descController,
                    maxLines: 3,
                    decoration: const InputDecoration(labelText: 'Describe the work you do', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _wageController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Average Wage per Day (₹)', border: OutlineInputBorder()),
                  ),
                ],
              ),
              isActive: _currentStep >= 2,
            ),
            Step(
              title: const Text('Location', style: TextStyle(fontWeight: FontWeight.bold)),
              content: TextField(
                controller: _locationController,
                decoration: const InputDecoration(labelText: 'Farm Area / Village', border: OutlineInputBorder()),
              ),
              isActive: _currentStep >= 3,
            ),
            Step(
              title: const Text('Contact', style: TextStyle(fontWeight: FontWeight.bold)),
              content: TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone Number', border: OutlineInputBorder()),
              ),
              isActive: _currentStep >= 4,
            ),
          ],
        ),
      ),
    );
  }
}
