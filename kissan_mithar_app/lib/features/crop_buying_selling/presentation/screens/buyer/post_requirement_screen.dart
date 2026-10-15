import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../../shared/widgets/large_button.dart';
import '../../../data/providers/crop_buying_selling_provider.dart';

class PostRequirementScreen extends ConsumerStatefulWidget {
  const PostRequirementScreen({super.key});

  @override
  ConsumerState<PostRequirementScreen> createState() => _PostRequirementScreenState();
}

class _PostRequirementScreenState extends ConsumerState<PostRequirementScreen> {
  final _formKey = GlobalKey<FormState>();

  // 1. Product Name (Required)
  final _productNameController = TextEditingController();

  // 2. Variety (Optional)
  final _varietyController = TextEditingController();

  // 3. Product Photos (Optional)
  final List<XFile> _selectedPhotos = [];
  final ImagePicker _picker = ImagePicker();

  // 4. Required Quantity (Required, single fixed value - NEVER min-max)
  final _quantityController = TextEditingController();

  // 5. Quantity Unit (Required selection)
  String _quantityUnit = 'tonne';
  final List<String> _quantityUnits = ['tonne', 'quintal', 'kg', 'box', 'piece'];

  // 6. Expected Price (Optional numeric value)
  final _expectedPriceController = TextEditingController();

  // 7. Price Unit (per kg, per quintal, per tonne, per box, per piece)
  String _priceUnit = 'per tonne';
  final List<String> _priceUnits = ['per tonne', 'per quintal', 'per kg', 'per box', 'per piece'];

  // 8. Location Handling (Current or Manual)
  bool _useCurrentLocation = false;
  bool _isFetchingLocation = false;
  String? _detectedLocationText;
  double? _latitude;
  double? _longitude;

  final _villageController = TextEditingController();
  final _mandalController = TextEditingController();
  final _districtController = TextEditingController();
  final _stateController = TextEditingController();
  final _pincodeController = TextEditingController();

  bool _isSubmitting = false;

  @override
  void dispose() {
    _productNameController.dispose();
    _varietyController.dispose();
    _quantityController.dispose();
    _expectedPriceController.dispose();
    _villageController.dispose();
    _mandalController.dispose();
    _districtController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto(ImageSource source) async {
    try {
      final XFile? photo = await _picker.pickImage(source: source, imageQuality: 80);
      if (photo != null) {
        setState(() => _selectedPhotos.add(photo));
      }
    } catch (_) {}
  }

  void _removePhoto(int index) {
    setState(() => _selectedPhotos.removeAt(index));
  }

  Future<void> _fetchCurrentLocation() async {
    setState(() => _isFetchingLocation = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location services disabled. Please enter location manually.')),
          );
        }
        setState(() => _isFetchingLocation = false);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Location permission denied. You can enter location manually.')),
            );
          }
          setState(() => _isFetchingLocation = false);
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location permission permanently denied. Please enter manually.')),
          );
        }
        setState(() => _isFetchingLocation = false);
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
        timeLimit: const Duration(seconds: 8),
      );

      setState(() {
        _latitude = position.latitude;
        _longitude = position.longitude;
        _useCurrentLocation = true;
        _detectedLocationText = 'GPS: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}';
        _isFetchingLocation = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to detect GPS. Please enter location manually.')),
        );
      }
      setState(() => _isFetchingLocation = false);
    }
  }

  void _reviewAndSubmit() {
    if (!_formKey.currentState!.validate()) return;

    final q = double.tryParse(_quantityController.text.trim());
    if (q == null || q <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid positive required quantity')),
      );
      return;
    }

    final p = _expectedPriceController.text.trim().isNotEmpty
        ? double.tryParse(_expectedPriceController.text.trim())
        : null;
    if (p != null && p < 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Expected price cannot be negative')),
      );
      return;
    }

    final locationDisplay = _useCurrentLocation && _detectedLocationText != null
        ? _detectedLocationText!
        : [
            _villageController.text.trim(),
            _mandalController.text.trim(),
            _districtController.text.trim(),
            _stateController.text.trim(),
          ].where((s) => s.isNotEmpty).join(', ');

    // Display Review Summary before final submission
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.fact_check_outlined, color: Color(0xFF1B6327)),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Review Product Request',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Please review your sourcing request. Kissan Mithar will coordinate with verified growers and inspect produce quality.',
              style: TextStyle(fontSize: 13, color: Colors.black54, height: 1.4),
            ),
            const Divider(height: 28),

            _buildSummaryRow('Product Name', _productNameController.text.trim()),
            if (_varietyController.text.trim().isNotEmpty)
              _buildSummaryRow('Variety', _varietyController.text.trim()),
            _buildSummaryRow('Required Quantity', '$q $_quantityUnit (Fixed)'),
            if (p != null)
              _buildSummaryRow('Expected Price', '₹$p $_priceUnit')
            else
              _buildSummaryRow('Expected Price', 'To be coordinated by KM'),
            _buildSummaryRow('Delivery Location', locationDisplay.isNotEmpty ? locationDisplay : 'To be confirmed'),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: LargeButton(
                label: 'Confirm & Submit to Kissan Mithar',
                onPressed: () {
                  Navigator.of(ctx).pop();
                  _executeSubmission(q, p, locationDisplay);
                },
                backgroundColor: const Color(0xFF1B6327),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: Colors.black54)),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22))),
        ],
      ),
    );
  }

  Future<void> _executeSubmission(double quantity, double? price, String locationDisplay) async {
    setState(() => _isSubmitting = true);

    final payload = {
      'productName': _productNameController.text.trim(),
      'variety': _varietyController.text.trim(),
      'requiredQuantity': quantity,
      'quantityUnit': _quantityUnit,
      'expectedPrice': price,
      'priceUnit': _priceUnit,
      'locationType': _useCurrentLocation ? 'CURRENT' : 'MANUAL',
      'locationName': locationDisplay.isNotEmpty ? locationDisplay : 'Delivery Location',
      'village': _villageController.text.trim(),
      'mandal': _mandalController.text.trim(),
      'district': _districtController.text.trim(),
      'state': _stateController.text.trim(),
      'pincode': _pincodeController.text.trim(),
      'latitude': _latitude,
      'longitude': _longitude,
      'photos': _selectedPhotos.map((f) => f.path).toList(),
    };

    final service = ref.read(cropBuyingSellingProvider);
    final success = await service.createBuyerRequirement(payload);

    setState(() => _isSubmitting = false);

    if (mounted) {
      if (success) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: Color(0xFF1B6327), size: 28),
                SizedBox(width: 8),
                Text('Request Submitted', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            content: const Text(
              'Thank you! Your product request has been placed with Agri Bazaar. The Kissan Mithar team is now reviewing requirements, identifying growers, and coordinating verified sourcing.',
              style: TextStyle(fontSize: 14, height: 1.4),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  context.pop();
                },
                child: const Text('Track My Requests', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1B6327))),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit product request. Please try again.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Request a Product'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Info Banner
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFC8E6C9)),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.shield_outlined, color: Color(0xFF1B6327), size: 20),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Agri Bazaar — Managed Sourcing. Kissan Mithar identifies growers, verifies quality, and delivers directly to you.',
                        style: TextStyle(fontSize: 13, color: Color(0xFF1B4D24), height: 1.3),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 1. Product Name (Required)
              _buildSectionTitle('Product Name *'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _productNameController,
                decoration: InputDecoration(
                  hintText: 'e.g. Lemon, Cotton, Wheat, Rice, Tomato',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.shopping_basket_outlined, color: Color(0xFF1B6327)),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? 'Please enter the product name' : null,
              ),

              const SizedBox(height: 20),

              // 2. Variety (Optional)
              _buildSectionTitle('Variety (Optional)'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _varietyController,
                decoration: InputDecoration(
                  hintText: 'e.g. Kagzi Lime, Bt-Cotton, Sona Masoori',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.grain, color: Color(0xFF1B6327)),
                ),
              ),

              const SizedBox(height: 20),

              // 3. Product Photos (Optional)
              _buildSectionTitle('Reference Photos (Optional)'),
              const SizedBox(height: 8),
              _buildPhotoSection(),

              const SizedBox(height: 24),

              // 4. Required Quantity (Required, fixed value) & 5. Unit (Required)
              _buildSectionTitle('Required Quantity *'),
              const SizedBox(height: 4),
              const Text('Enter one fixed quantity you need (e.g. 1 tonne or 500 kg).', style: TextStyle(fontSize: 12, color: Colors.black54)),
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 2,
                    child: TextFormField(
                      controller: _quantityController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: 'Fixed Quantity *',
                        hintText: '1',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Enter quantity';
                        final num = double.tryParse(val.trim());
                        if (num == null || num <= 0) return 'Must be > 0';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: DropdownButtonFormField<String>(
                      value: _quantityUnit,
                      decoration: InputDecoration(
                        labelText: 'Unit *',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: _quantityUnits.map((u) => DropdownMenuItem(value: u, child: Text(u))).toList(),
                      onChanged: (val) => setState(() => _quantityUnit = val!),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // 6. Expected Price (Optional) & 7. Price Unit
              _buildSectionTitle('Expected Price (Optional)'),
              const SizedBox(height: 4),
              const Text('Optional target price. KM will coordinate fair supplier pricing.', style: TextStyle(fontSize: 12, color: Colors.black54)),
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 3,
                    child: TextFormField(
                      controller: _expectedPriceController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: 'Expected Price (₹)',
                        hintText: '38000',
                        filled: true,
                        fillColor: Colors.white,
                        prefixText: '₹ ',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 4,
                    child: DropdownButtonFormField<String>(
                      value: _priceUnit,
                      decoration: InputDecoration(
                        labelText: 'Price Unit',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      items: _priceUnits.map((u) => DropdownMenuItem(value: u, child: Text(u))).toList(),
                      onChanged: (val) => setState(() => _priceUnit = val!),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // 8. Location Handling (Current or Manual)
              _buildSectionTitle('Delivery Location'),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE0E6E0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: _fetchCurrentLocation,
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                              decoration: BoxDecoration(
                                color: _useCurrentLocation ? const Color(0xFFE8F5E9) : Colors.grey.shade50,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: _useCurrentLocation ? const Color(0xFF1B6327) : Colors.grey.shade300,
                                  width: _useCurrentLocation ? 1.5 : 1,
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  if (_isFetchingLocation)
                                    const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                  else
                                    Icon(Icons.my_location, size: 16, color: _useCurrentLocation ? const Color(0xFF1B6327) : Colors.black54),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Use Current Location',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: _useCurrentLocation ? const Color(0xFF1B6327) : Colors.black87,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _useCurrentLocation = false),
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                              decoration: BoxDecoration(
                                color: !_useCurrentLocation ? const Color(0xFFE8F5E9) : Colors.grey.shade50,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: !_useCurrentLocation ? const Color(0xFF1B6327) : Colors.grey.shade300,
                                  width: !_useCurrentLocation ? 1.5 : 1,
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.edit_location_alt, size: 16, color: !_useCurrentLocation ? const Color(0xFF1B6327) : Colors.black54),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Enter Manually',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: !_useCurrentLocation ? const Color(0xFF1B6327) : Colors.black87,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    if (_useCurrentLocation && _detectedLocationText != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F8E9),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle, color: Color(0xFF1B6327), size: 18),
                            const SizedBox(width: 8),
                            Expanded(child: Text(_detectedLocationText!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1B6327)))),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 14),
                    const Text('Address / Area:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black54)),
                    const SizedBox(height: 8),

                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _villageController,
                            decoration: const InputDecoration(labelText: 'Village / City', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextFormField(
                            controller: _mandalController,
                            decoration: const InputDecoration(labelText: 'Mandal / Area', border: OutlineInputBorder()),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _districtController,
                            decoration: const InputDecoration(labelText: 'District', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextFormField(
                            controller: _stateController,
                            decoration: const InputDecoration(labelText: 'State', border: OutlineInputBorder()),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _pincodeController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'PIN Code', border: OutlineInputBorder()),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: LargeButton(
                  label: _isSubmitting ? 'Submitting...' : 'Review & Submit Request',
                  onPressed: _isSubmitting ? () {} : _reviewAndSubmit,
                  backgroundColor: const Color(0xFF1B6327),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1B3B22)),
    );
  }

  Widget _buildPhotoSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_selectedPhotos.isNotEmpty)
          SizedBox(
            height: 90,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _selectedPhotos.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final photo = _selectedPhotos[index];
                return Stack(
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                        image: DecorationImage(
                          image: FileImage(File(photo.path)),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 4,
                      child: InkWell(
                        onTap: () => _removePhoto(index),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                          child: const Icon(Icons.close, color: Colors.white, size: 14),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          icon: const Icon(Icons.add_a_photo_outlined, size: 18),
          label: const Text('Add Reference Photo'),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: () => _pickPhoto(ImageSource.gallery),
        ),
      ],
    );
  }
}
