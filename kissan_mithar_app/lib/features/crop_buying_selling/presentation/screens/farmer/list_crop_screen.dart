import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../shared/widgets/large_button.dart';

class ListCropScreen extends StatefulWidget {
  const ListCropScreen({super.key});

  @override
  State<ListCropScreen> createState() => _ListCropScreenState();
}

class _ListCropScreenState extends State<ListCropScreen> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();

  // Form Fields
  String? _selectedCrop;
  String? _location;
  final _areaController = TextEditingController();
  DateTime? _harvestDate;
  final _quantityController = TextEditingController();
  String _quantityUnit = 'Quintal';
  String? _cropStage;
  final _descriptionController = TextEditingController();

  final List<String> _cropStages = [
    'Germination',
    'Vegetative',
    'Flowering',
    'Fruiting',
    'Maturity',
    'Ready for Harvest'
  ];

  @override
  void dispose() {
    _areaController.dispose();
    _quantityController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      // Show success and pop
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Crop Listed Successfully!')),
      );
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'List My Crop'),
      body: Form(
        key: _formKey,
        child: Stepper(
          physics: const ClampingScrollPhysics(),
          currentStep: _currentStep,
          onStepContinue: () {
            if (_currentStep < 7) {
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
            final isLastStep = _currentStep == 7;
            return Padding(
              padding: const EdgeInsets.only(top: 16.0),
              child: Row(
                children: [
                  Expanded(
                    child: LargeButton(
                      label: isLastStep ? 'Publish Crop' : 'Continue',
                      onPressed: details.onStepContinue ?? () {},
                    ),
                  ),
                  const SizedBox(width: 12),
                  if (_currentStep > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: details.onStepCancel,
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Back', style: TextStyle(fontSize: 16)),
                      ),
                    ),
                ],
              ),
            );
          },
          steps: [
            Step(
              title: const Text('Select Crop'),
              content: DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Crop', border: OutlineInputBorder()),
                items: ['Cotton', 'Paddy', 'Maize', 'Chilli']
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (val) => setState(() => _selectedCrop = val),
                validator: (val) => val == null ? 'Please select a crop' : null,
              ),
              isActive: _currentStep >= 0,
            ),
            Step(
              title: const Text('Location'),
              content: TextFormField(
                initialValue: 'Warangal, Telangana', // Mock pre-fill from My Farm
                decoration: const InputDecoration(labelText: 'Farm Location', border: OutlineInputBorder()),
                onChanged: (val) => _location = val,
                validator: (val) => val!.isEmpty ? 'Enter location' : null,
              ),
              isActive: _currentStep >= 1,
            ),
            Step(
              title: const Text('Land Area (Acres)'),
              content: TextFormField(
                controller: _areaController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Area in Acres', border: OutlineInputBorder()),
                validator: (val) => val!.isEmpty ? 'Enter area' : null,
              ),
              isActive: _currentStep >= 2,
            ),
            Step(
              title: const Text('Expected Harvest Date'),
              content: InkWell(
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: DateTime.now(),
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (date != null) setState(() => _harvestDate = date);
                },
                child: InputDecorator(
                  decoration: const InputDecoration(border: OutlineInputBorder()),
                  child: Text(_harvestDate == null ? 'Select Date' : '${_harvestDate!.toLocal()}'.split(' ')[0]),
                ),
              ),
              isActive: _currentStep >= 3,
            ),
            Step(
              title: const Text('Expected Quantity'),
              content: Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      controller: _quantityController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Quantity', border: OutlineInputBorder()),
                      validator: (val) => val!.isEmpty ? 'Enter quantity' : null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _quantityUnit,
                      decoration: const InputDecoration(border: OutlineInputBorder()),
                      items: ['kg', 'Quintal', 'Ton']
                          .map((u) => DropdownMenuItem(value: u, child: Text(u)))
                          .toList(),
                      onChanged: (val) => setState(() => _quantityUnit = val!),
                    ),
                  ),
                ],
              ),
              isActive: _currentStep >= 4,
            ),
            Step(
              title: const Text('Crop Stage'),
              content: DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Current Stage', border: OutlineInputBorder()),
                items: _cropStages.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                onChanged: (val) => setState(() => _cropStage = val),
              ),
              isActive: _currentStep >= 5,
            ),
            Step(
              title: const Text('Crop Photos'),
              content: Container(
                height: 100,
                width: double.infinity,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey.shade100,
                ),
                child: const Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.camera_alt, size: 40, color: Colors.grey),
                    Text('Tap to add photos')
                  ],
                ),
              ),
              isActive: _currentStep >= 6,
            ),
            Step(
              title: const Text('Description (Optional)'),
              content: TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Brief description', border: OutlineInputBorder()),
              ),
              isActive: _currentStep >= 7,
            ),
          ],
        ),
      ),
    );
  }
}
