import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../../shared/widgets/large_button.dart';

class PostRequirementScreen extends StatefulWidget {
  const PostRequirementScreen({super.key});

  @override
  State<PostRequirementScreen> createState() => _PostRequirementScreenState();
}

class _PostRequirementScreenState extends State<PostRequirementScreen> {
  final _formKey = GlobalKey<FormState>();

  String? _selectedCrop;
  final _quantityController = TextEditingController();
  String _quantityUnit = 'Ton';
  String? _location;
  final _descriptionController = TextEditingController();

  @override
  void dispose() {
    _quantityController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Requirement Posted Successfully!')),
      );
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Post Requirement'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'What crop are you looking for?',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
              ),
              const SizedBox(height: 24),
              
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(labelText: 'Select Crop', border: OutlineInputBorder()),
                items: ['Cotton', 'Paddy', 'Maize', 'Chilli']
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (val) => setState(() => _selectedCrop = val),
                validator: (val) => val == null ? 'Please select a crop' : null,
              ),
              const SizedBox(height: 20),
              
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      controller: _quantityController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Required Quantity', border: OutlineInputBorder()),
                      validator: (val) => val!.isEmpty ? 'Enter quantity' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
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
              const SizedBox(height: 20),
              
              TextFormField(
                initialValue: 'Telangana', // Mock pre-fill
                decoration: const InputDecoration(
                  labelText: 'Location / Delivery Area', 
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.location_on),
                ),
                onChanged: (val) => _location = val,
                validator: (val) => val!.isEmpty ? 'Enter location' : null,
              ),
              const SizedBox(height: 20),
              
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: const InputDecoration(
                  labelText: 'Description (Optional)', 
                  alignLabelWithHint: true,
                  border: OutlineInputBorder(),
                  hintText: 'Any specific details about your requirement?',
                ),
              ),
              const SizedBox(height: 32),
              
              SizedBox(
                width: double.infinity,
                child: LargeButton(
                  label: 'Publish Requirement',
                  onPressed: _submit,
                  backgroundColor: const Color(0xFFD67229),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
