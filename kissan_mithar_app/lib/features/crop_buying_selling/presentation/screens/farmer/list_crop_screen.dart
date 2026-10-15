import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../../../../shared/widgets/farmer_app_bar.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../shared/widgets/large_button.dart';
import '../../../data/providers/crop_buying_selling_provider.dart';

class ListCropScreen extends ConsumerStatefulWidget {
  const ListCropScreen({super.key});

  @override
  ConsumerState<ListCropScreen> createState() => _ListCropScreenState();
}

class _ListCropScreenState extends ConsumerState<ListCropScreen> {
  final _formKey = GlobalKey<FormState>();

  // 1. Product Name (Optional)
  final _productNameController = TextEditingController();

  // 2. Variety (Optional)
  final _varietyController = TextEditingController();

  // 3. Product Photos (Optional)
  final List<XFile> _selectedPhotos = [];
  final ImagePicker _picker = ImagePicker();

  // 4. Quantity Available Range (Optional min and max)
  final _minQuantityController = TextEditingController();
  final _maxQuantityController = TextEditingController();

  // 5. Quantity Unit
  String _quantityUnit = 'kg';
  final List<String> _quantityUnits = ['kg', 'quintal', 'tonne', 'box', 'piece'];

  // 6. Price (Optional)
  final _priceController = TextEditingController();

  // 7. Price Unit (Optional)
  String _priceUnit = 'per kg';
  final List<String> _priceUnits = ['per kg', 'per quintal', 'per tonne', 'per box', 'per piece'];

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

  final _notesController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _productNameController.dispose();
    _varietyController.dispose();
    _minQuantityController.dispose();
    _maxQuantityController.dispose();
    _priceController.dispose();
    _villageController.dispose();
    _mandalController.dispose();
    _districtController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  // Pick photos
  Future<void> _pickPhoto(ImageSource source) async {
    try {
      final XFile? photo = await _picker.pickImage(source: source, imageQuality: 80);
      if (photo != null) {
        setState(() {
          _selectedPhotos.add(photo);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not access camera/gallery: $e')),
      );
    }
  }

  // Replace photo at index
  Future<void> _replacePhoto(int index) async {
    try {
      final XFile? photo = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
      if (photo != null) {
        setState(() {
          _selectedPhotos[index] = photo;
        });
      }
    } catch (_) {}
  }

  // Remove photo
  void _removePhoto(int index) {
    setState(() {
      _selectedPhotos.removeAt(index);
    });
  }

  // Fetch device location safely
  Future<void> _fetchCurrentLocation() async {
    setState(() => _isFetchingLocation = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Location services are disabled. Please enter location manually.')),
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

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    // Validate quantity range
    final minQ = _minQuantityController.text.isNotEmpty ? double.tryParse(_minQuantityController.text) : null;
    final maxQ = _maxQuantityController.text.isNotEmpty ? double.tryParse(_maxQuantityController.text) : null;

    if (minQ != null && minQ < 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Minimum quantity must be positive')),
      );
      return;
    }
    if (maxQ != null && maxQ < 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Maximum quantity must be positive')),
      );
      return;
    }
    if (minQ != null && maxQ != null && minQ > maxQ) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Minimum quantity cannot exceed maximum quantity')),
      );
      return;
    }

    final price = _priceController.text.isNotEmpty ? double.tryParse(_priceController.text) : null;
    if (price != null && price < 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Price cannot be negative')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final locationDisplay = _useCurrentLocation && _detectedLocationText != null
        ? _detectedLocationText!
        : [
            _villageController.text.trim(),
            _mandalController.text.trim(),
            _districtController.text.trim(),
            _stateController.text.trim(),
          ].where((s) => s.isNotEmpty).join(', ');

    final payload = {
      'productName': _productNameController.text.trim(),
      'variety': _varietyController.text.trim(),
      'minQuantity': minQ,
      'maxQuantity': maxQ,
      'quantityUnit': _quantityUnit,
      'price': price,
      'priceUnit': _priceUnit,
      'locationType': _useCurrentLocation ? 'CURRENT' : 'MANUAL',
      'locationName': locationDisplay.isNotEmpty ? locationDisplay : 'Local Region',
      'village': _villageController.text.trim(),
      'mandal': _mandalController.text.trim(),
      'district': _districtController.text.trim(),
      'state': _stateController.text.trim(),
      'pincode': _pincodeController.text.trim(),
      'latitude': _latitude,
      'longitude': _longitude,
      'photos': _selectedPhotos.map((f) => f.path).toList(),
      'notes': _notesController.text.trim(),
    };

    final service = ref.read(cropBuyingSellingProvider);
    final success = await service.createCropListing(payload);

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
                Text('Product Registered', style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            content: const Text(
              'Your product has been registered with Agri Bazaar. The Kissan Mithar sourcing team will contact you when matching buyers require your produce.',
              style: TextStyle(fontSize: 14, height: 1.4),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(ctx).pop();
                  context.pop();
                },
                child: const Text('OK', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1B6327))),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to register product. Please check your inputs.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      appBar: const FarmerAppBar(title: 'Register a Product'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header note
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
                    Icon(Icons.info_outline, color: Color(0xFF1B6327), size: 20),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Agri Bazaar — Managed Sourcing. Register the produce you have available. Kissan Mithar manages procurement directly.',
                        style: TextStyle(fontSize: 13, color: Color(0xFF1B4D24), height: 1.3),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 1. Product Name (Optional)
              _buildSectionTitle('Product Name (Optional)'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _productNameController,
                decoration: InputDecoration(
                  hintText: 'e.g. Lemon, Cotton, Paddy, Chilli',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE0E6E0))),
                  prefixIcon: const Icon(Icons.eco_outlined, color: Color(0xFF1B6327)),
                ),
              ),

              const SizedBox(height: 20),

              // 2. Variety (Optional)
              _buildSectionTitle('Variety (Optional)'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _varietyController,
                decoration: InputDecoration(
                  hintText: 'e.g. Kagzi Lime, Bt-2, Sona Masoori',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE0E6E0))),
                  prefixIcon: const Icon(Icons.grain, color: Color(0xFF1B6327)),
                ),
              ),

              const SizedBox(height: 20),

              // 3. Product Photos (Optional)
              _buildSectionTitle('Product Photos (Optional)'),
              const SizedBox(height: 8),
              _buildPhotoSection(),

              const SizedBox(height: 24),

              // 4. Quantity Available Range (Optional min and max) & 5. Unit
              _buildSectionTitle('Quantity Available (Optional Range)'),
              const SizedBox(height: 4),
              const Text('Enter available minimum and maximum quantity range (e.g. 500 to 1,000 kg).', style: TextStyle(fontSize: 12, color: Colors.black54)),
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _minQuantityController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: 'Min Qty',
                        hintText: '500',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextFormField(
                      controller: _maxQuantityController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: 'Max Qty',
                        hintText: '1000',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _quantityUnit,
                      decoration: InputDecoration(
                        labelText: 'Unit',
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

              // 6. Price (Optional) & 7. Price Unit
              _buildSectionTitle('Price (Optional)'),
              const SizedBox(height: 4),
              const Text('Leave blank if you prefer Kissan Mithar to coordinate pricing.', style: TextStyle(fontSize: 12, color: Colors.black54)),
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 3,
                    child: TextFormField(
                      controller: _priceController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: InputDecoration(
                        labelText: 'Expected Price (₹)',
                        hintText: '40',
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
              _buildSectionTitle('Location'),
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
                    // Location Mode Selector
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
                    const Text('Location Details:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black54)),
                    const SizedBox(height: 8),

                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _villageController,
                            decoration: const InputDecoration(labelText: 'Village', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextFormField(
                            controller: _mandalController,
                            decoration: const InputDecoration(labelText: 'Mandal', border: OutlineInputBorder()),
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
                  label: _isSubmitting ? 'Registering...' : 'Register Product',
                  onPressed: _isSubmitting ? () {} : _submit,
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
            height: 110,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _selectedPhotos.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final photo = _selectedPhotos[index];
                return Stack(
                  children: [
                    Container(
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                        image: DecorationImage(
                          image: FileImage(File(photo.path)),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    PositionTile(
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
                    PositionTile(
                      bottom: 4,
                      right: 4,
                      child: InkWell(
                        onTap: () => _replacePhoto(index),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                          child: const Icon(Icons.refresh, color: Colors.white, size: 14),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                icon: const Icon(Icons.photo_library, size: 18),
                label: const Text('Add from Gallery'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () => _pickPhoto(ImageSource.gallery),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: OutlinedButton.icon(
                icon: const Icon(Icons.camera_alt, size: 18),
                label: const Text('Take Photo'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () => _pickPhoto(ImageSource.camera),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class PositionTile extends StatelessWidget {
  final double? top;
  final double? bottom;
  final double? left;
  final double? right;
  final Widget child;

  const PositionTile({
    super.key,
    this.top,
    this.bottom,
    this.left,
    this.right,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(top: top, bottom: bottom, left: left, right: right, child: child);
  }
}
