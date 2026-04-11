import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:image_picker/image_picker.dart';
import 'package:latlong2/latlong.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_cached_image.dart';
import '../add_property/data/add_property_service.dart';
import '../auth/data/auth_models.dart';
import 'data/edit_property_service.dart';
import 'data/property_details_models.dart';

class EditPropertyPage extends StatefulWidget {
  const EditPropertyPage({
    super.key,
    required this.propertyId,
    required this.user,
  });

  final int propertyId;
  final AuthUser user;

  @override
  State<EditPropertyPage> createState() => _EditPropertyPageState();
}

class _EditPropertyPageState extends State<EditPropertyPage> {
  final _formKey = GlobalKey<FormState>();
  final _service = EditPropertyService();
  final _mapController = MapController();
  final _picker = ImagePicker();

  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _areaController = TextEditingController();
  final _bedroomsController = TextEditingController();
  final _bathroomsController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _latitudeController = TextEditingController();
  final _longitudeController = TextEditingController();
  final _contactValueController = TextEditingController();

  late Future<EditPropertyBundle> _future;

  AddPropertyReferenceData? _referenceData;
  int? _selectedCategoryId;
  int? _selectedTypeId;
  int? _selectedWilayaId;
  int? _selectedDairaId;
  int? _selectedCommuneId;
  int? _selectedContactTypeId;
  final Set<int> _selectedAmenityIds = <int>{};
  final List<XFile> _newImages = [];
  final List<PropertyImageData> _existingImages = [];
  final List<PropertyContactData> _contacts = [];
  final List<PropertyDocumentData> _documents = [];
  bool _contactPrimary = false;
  bool _initialized = false;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _future = _service.load(widget.propertyId);
  }

  @override
  void dispose() {
    _titleController.dispose();
    _priceController.dispose();
    _areaController.dispose();
    _bedroomsController.dispose();
    _bathroomsController.dispose();
    _descriptionController.dispose();
    _latitudeController.dispose();
    _longitudeController.dispose();
    _contactValueController.dispose();
    super.dispose();
  }

  void _seedForm(EditPropertyBundle bundle) {
    if (_initialized) return;
    _initialized = true;
    _referenceData = bundle.referenceData;

    final property = bundle.property;
    _titleController.text = property.title;
    _priceController.text = property.price?.toStringAsFixed(0) ?? '';
    _areaController.text = property.area > 0 ? '${property.area}' : '';
    _bedroomsController.text = '${property.bedrooms}';
    _bathroomsController.text = '${property.bathrooms}';
    _descriptionController.text = property.description;
    _latitudeController.text = property.latitude?.toString() ?? '';
    _longitudeController.text = property.longitude?.toString() ?? '';
    _selectedAmenityIds
      ..clear()
      ..addAll(property.amenities.map((item) => item.id));
    _existingImages
      ..clear()
      ..addAll(property.images);
    _contacts
      ..clear()
      ..addAll(property.contacts);
    _documents
      ..clear()
      ..addAll(property.documents);

    for (final category in bundle.referenceData.categories) {
      if (category.name.toLowerCase() == property.categoryName.toLowerCase()) {
        _selectedCategoryId = category.id;
        break;
      }
    }
    for (final type in bundle.referenceData.types) {
      if (type.name.toLowerCase() == property.typeName.toLowerCase()) {
        _selectedTypeId = type.id;
        break;
      }
    }

    _selectedCommuneId = property.communeId;
    for (final commune in bundle.referenceData.communes) {
      if (commune.id == property.communeId) {
        _selectedDairaId = commune.dairaId;
        _selectedWilayaId = commune.wilayaId;
        break;
      }
    }
  }

  LatLng _currentMapPoint() {
    final latitude = double.tryParse(_latitudeController.text.trim());
    final longitude = double.tryParse(_longitudeController.text.trim());
    if (latitude != null && longitude != null) {
      return LatLng(latitude, longitude);
    }
    return const LatLng(36.7538, 3.0588);
  }

  void _setMapCoordinates(LatLng point) {
    setState(() {
      _latitudeController.text = point.latitude.toStringAsFixed(6);
      _longitudeController.text = point.longitude.toStringAsFixed(6);
    });
    try {
      _mapController.move(point, 13);
    } catch (_) {}
  }

  Future<void> _pickImages() async {
    final files = await _picker.pickMultiImage(imageQuality: 88);
    if (files.isEmpty) return;
    setState(() {
      for (final file in files) {
        final exists = _newImages.any((item) => item.path == file.path);
        if (!exists) _newImages.add(file);
      }
    });
  }

  void _removeNewImageAt(int index) {
    setState(() {
      _newImages.removeAt(index);
    });
  }

  Future<void> _deleteExistingImage(PropertyImageData image) async {
    try {
      await _service.deleteImage(
        propertyId: widget.propertyId,
        imageId: image.id,
      );
      setState(() {
        _existingImages.removeWhere((item) => item.id == image.id);
      });
    } on EditPropertyException catch (error) {
      setState(() {
        _error = error.message;
      });
    }
  }

  Future<void> _addContact() async {
    if (_selectedContactTypeId == null ||
        _contactValueController.text.trim().isEmpty) {
      setState(() {
        _error = 'Select a contact type and enter a value.';
      });
      return;
    }
    try {
      await _service.addContact(
        propertyId: widget.propertyId,
        contactTypeId: _selectedContactTypeId!,
        value: _contactValueController.text,
        isPrimary: _contactPrimary,
      );
      final bundle = await _service.load(widget.propertyId);
      setState(() {
        _contacts
          ..clear()
          ..addAll(bundle.property.contacts);
        _selectedContactTypeId = null;
        _contactValueController.clear();
        _contactPrimary = false;
      });
    } on EditPropertyException catch (error) {
      setState(() {
        _error = error.message;
      });
    }
  }

  Future<void> _deleteContact(PropertyContactData contact) async {
    try {
      await _service.deleteContact(
        propertyId: widget.propertyId,
        contactId: contact.id,
      );
      setState(() {
        _contacts.removeWhere((item) => item.id == contact.id);
      });
    } on EditPropertyException catch (error) {
      setState(() {
        _error = error.message;
      });
    }
  }

  Future<void> _addDocument(int documentTypeId) async {
    try {
      await _service.addDocument(
        propertyId: widget.propertyId,
        documentTypeId: documentTypeId,
      );
      final bundle = await _service.load(widget.propertyId);
      setState(() {
        _documents
          ..clear()
          ..addAll(bundle.property.documents);
      });
    } on EditPropertyException catch (error) {
      setState(() {
        _error = error.message;
      });
    }
  }

  Future<void> _deleteDocument(PropertyDocumentData document) async {
    try {
      await _service.deleteDocument(
        propertyId: widget.propertyId,
        documentId: document.id,
      );
      setState(() {
        _documents.removeWhere((item) => item.id == document.id);
      });
    } on EditPropertyException catch (error) {
      setState(() {
        _error = error.message;
      });
    }
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false) || _saving) return;
    if (_selectedCategoryId == null ||
        _selectedTypeId == null ||
        _selectedCommuneId == null) {
      setState(() {
        _error = 'Please complete category, type, and commune.';
      });
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      await _service.update(
        propertyId: widget.propertyId,
        categoryId: _selectedCategoryId!,
        typeId: _selectedTypeId!,
        communeId: _selectedCommuneId!,
        title: _titleController.text,
        description: _descriptionController.text,
        price: _priceController.text,
        area: _areaController.text,
        bedrooms: _bedroomsController.text,
        bathrooms: _bathroomsController.text,
        latitude: _latitudeController.text,
        longitude: _longitudeController.text,
        amenityIds: _selectedAmenityIds.toList(),
      );
      if (_newImages.isNotEmpty) {
        await _service.addImages(
          propertyId: widget.propertyId,
          imagePaths: _newImages.map((file) => file.path).toList(),
        );
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Property updated successfully.')),
      );
      Navigator.of(context).pop(true);
    } on EditPropertyException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Unable to update this property.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        title: const Text('Edit Property'),
      ),
      body: FutureBuilder<EditPropertyBundle>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting &&
              !snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text('${snapshot.error}', textAlign: TextAlign.center),
              ),
            );
          }

          final bundle = snapshot.data;
          if (bundle == null) {
            return const Center(child: Text('Property not found.'));
          }
          _seedForm(bundle);
          final referenceData = _referenceData!;
          final filteredDairas = _selectedWilayaId == null
              ? referenceData.dairas
              : referenceData.dairas
                  .where((item) => item.wilayaId == _selectedWilayaId)
                  .toList();
          final filteredCommunes = _selectedDairaId == null
              ? const <LocationItem>[]
              : referenceData.communes
                  .where((item) => item.dairaId == _selectedDairaId)
                  .toList();

          return SafeArea(
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                      child: Column(
                        children: [
                          if (_error != null) ...[
                            _ErrorBanner(message: _error!),
                            const SizedBox(height: 16),
                          ],
                          _CardSection(
                            title: 'Basic Info',
                            child: Column(
                              children: [
                                _AppField(
                                  controller: _titleController,
                                  label: 'Title',
                                  validator: _required,
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: _DropdownField<int>(
                                        label: 'Category',
                                        value: _selectedCategoryId,
                                        items: referenceData.categories
                                            .map(
                                              (item) => DropdownMenuItem<int>(
                                                value: item.id,
                                                child: Text(item.name),
                                              ),
                                            )
                                            .toList(),
                                        onChanged: (value) {
                                          setState(() => _selectedCategoryId = value);
                                        },
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: _DropdownField<int>(
                                        label: 'Type',
                                        value: _selectedTypeId,
                                        items: referenceData.types
                                            .map(
                                              (item) => DropdownMenuItem<int>(
                                                value: item.id,
                                                child: Text(item.name),
                                              ),
                                            )
                                            .toList(),
                                        onChanged: (value) {
                                          setState(() => _selectedTypeId = value);
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                _AppField(
                                  controller: _descriptionController,
                                  label: 'Description',
                                  maxLines: 4,
                                  validator: _required,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          _CardSection(
                            title: 'Price and Specs',
                            child: Column(
                              children: [
                                _AppField(
                                  controller: _priceController,
                                  label: 'Price',
                                  keyboardType: TextInputType.number,
                                  validator: _required,
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: _AppField(
                                        controller: _areaController,
                                        label: 'Area',
                                        keyboardType: TextInputType.number,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: _AppField(
                                        controller: _bedroomsController,
                                        label: 'Bedrooms',
                                        keyboardType: TextInputType.number,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: _AppField(
                                        controller: _bathroomsController,
                                        label: 'Bathrooms',
                                        keyboardType: TextInputType.number,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          _CardSection(
                            title: 'Location',
                            child: Column(
                              children: [
                                _DropdownField<int>(
                                  label: 'Wilaya',
                                  value: _selectedWilayaId,
                                  items: referenceData.wilayas
                                      .map(
                                        (item) => DropdownMenuItem<int>(
                                          value: item.id,
                                          child: Text(item.name),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setState(() {
                                      _selectedWilayaId = value;
                                      _selectedDairaId = null;
                                      _selectedCommuneId = null;
                                    });
                                  },
                                ),
                                const SizedBox(height: 12),
                                _DropdownField<int>(
                                  label: 'Daira',
                                  value: _selectedDairaId,
                                  items: filteredDairas
                                      .map(
                                        (item) => DropdownMenuItem<int>(
                                          value: item.id,
                                          child: Text(item.name),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setState(() {
                                      _selectedDairaId = value;
                                      _selectedCommuneId = null;
                                    });
                                  },
                                ),
                                const SizedBox(height: 12),
                                _DropdownField<int>(
                                  label: 'Commune',
                                  value: _selectedCommuneId,
                                  items: filteredCommunes
                                      .map(
                                        (item) => DropdownMenuItem<int>(
                                          value: item.id,
                                          child: Text(item.name),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    setState(() {
                                      _selectedCommuneId = value;
                                    });
                                  },
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  height: 220,
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(20),
                                    child: FlutterMap(
                                      mapController: _mapController,
                                      options: MapOptions(
                                        initialCenter: _currentMapPoint(),
                                        initialZoom: 11,
                                        onTap: (_, point) => _setMapCoordinates(point),
                                      ),
                                      children: [
                                        TileLayer(
                                          urlTemplate:
                                              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                          userAgentPackageName: 'app_immo_dz',
                                        ),
                                        MarkerLayer(
                                          markers: [
                                            Marker(
                                              point: _currentMapPoint(),
                                              width: 54,
                                              height: 54,
                                              child: Container(
                                                decoration: BoxDecoration(
                                                  color: AppColors.primary,
                                                  borderRadius: BorderRadius.circular(999),
                                                ),
                                                child: const Icon(
                                                  Icons.location_on_rounded,
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  'Tap on the map to update the property location.',
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                        color: AppColors.onSurfaceVariant,
                                      ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          _CardSection(
                            title: 'Amenities',
                            child: Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: referenceData.amenities.map((item) {
                                final selected = _selectedAmenityIds.contains(item.id);
                                return FilterChip(
                                  selected: selected,
                                  label: Text(item.name),
                                  onSelected: (value) {
                                    setState(() {
                                      if (value) {
                                        _selectedAmenityIds.add(item.id);
                                      } else {
                                        _selectedAmenityIds.remove(item.id);
                                      }
                                    });
                                  },
                                );
                              }).toList(),
                            ),
                          ),
                          const SizedBox(height: 16),
                          _CardSection(
                            title: 'Images',
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                OutlinedButton.icon(
                                  onPressed: _pickImages,
                                  icon: const Icon(Icons.add_a_photo_rounded),
                                  label: const Text('Add Images'),
                                ),
                                const SizedBox(height: 12),
                                if (_existingImages.isNotEmpty)
                                  Wrap(
                                    spacing: 10,
                                    runSpacing: 10,
                                    children: _existingImages.map((image) {
                                      return _ExistingImageCard(
                                        imageUrl: image.imageUrl,
                                        onDelete: () => _deleteExistingImage(image),
                                      );
                                    }).toList(),
                                  ),
                                if (_newImages.isNotEmpty) ...[
                                  const SizedBox(height: 12),
                                  Wrap(
                                    spacing: 10,
                                    runSpacing: 10,
                                    children: List.generate(_newImages.length, (index) {
                                      final image = _newImages[index];
                                      return _LocalImageCard(
                                        imagePath: image.path,
                                        onDelete: () => _removeNewImageAt(index),
                                      );
                                    }),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          _CardSection(
                            title: 'Contact Information',
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    Expanded(
                                      child: _DropdownField<int>(
                                        label: 'Contact Type',
                                        value: _selectedContactTypeId,
                                        items: referenceData.contactTypes
                                            .map(
                                              (item) => DropdownMenuItem<int>(
                                                value: item.id,
                                                child: Text(item.name),
                                              ),
                                            )
                                            .toList(),
                                        onChanged: (value) {
                                          setState(() => _selectedContactTypeId = value);
                                        },
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      flex: 2,
                                      child: _AppField(
                                        controller: _contactValueController,
                                        label: 'Value',
                                      ),
                                    ),
                                  ],
                                ),
                                CheckboxListTile(
                                  contentPadding: EdgeInsets.zero,
                                  value: _contactPrimary,
                                  title: const Text('Primary contact'),
                                  onChanged: (value) {
                                    setState(() => _contactPrimary = value ?? false);
                                  },
                                ),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: FilledButton(
                                    onPressed: _addContact,
                                    child: const Text('Add Contact'),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                ..._contacts.map((contact) {
                                  return ListTile(
                                    contentPadding: EdgeInsets.zero,
                                    title: Text(contact.contactTypeName),
                                    subtitle: Text(contact.value),
                                    trailing: IconButton(
                                      onPressed: () => _deleteContact(contact),
                                      icon: const Icon(Icons.delete_outline_rounded),
                                    ),
                                  );
                                }),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                          _CardSection(
                            title: 'Documents',
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                DropdownButtonFormField<int>(
                                  initialValue: null,
                                  decoration: const InputDecoration(
                                    labelText: 'Document Type',
                                  ),
                                  items: referenceData.documentTypes
                                      .map(
                                        (item) => DropdownMenuItem<int>(
                                          value: item.id,
                                          child: Text(item.name),
                                        ),
                                      )
                                      .toList(),
                                  onChanged: (value) {
                                    if (value != null) {
                                      _addDocument(value);
                                    }
                                  },
                                ),
                                const SizedBox(height: 12),
                                Wrap(
                                  spacing: 10,
                                  runSpacing: 10,
                                  children: _documents.map((document) {
                                    return Chip(
                                      label: Text(document.documentTypeName),
                                      onDeleted: () => _deleteDocument(document),
                                    );
                                  }).toList(),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                    color: Colors.white,
                    child: SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: _saving ? null : _save,
                        icon: const Icon(Icons.save_rounded),
                        label: Text(_saving ? 'Saving...' : 'Update Listing'),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  String? _required(String? value) {
    if (value == null || value.trim().isEmpty) return 'Required';
    return null;
  }
}

class _CardSection extends StatelessWidget {
  const _CardSection({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _AppField extends StatelessWidget {
  const _AppField({
    required this.controller,
    required this.label,
    this.validator,
    this.maxLines = 1,
    this.keyboardType,
  });

  final TextEditingController controller;
  final String label;
  final String? Function(String?)? validator;
  final int maxLines;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      validator: validator,
      maxLines: maxLines,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: const Color(0xFFF4F6F8),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}

class _DropdownField<T> extends StatelessWidget {
  const _DropdownField({
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final String label;
  final T? value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<T>(
      initialValue: value,
      isExpanded: true,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: const Color(0xFFF4F6F8),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
      ),
      items: items,
      onChanged: onChanged,
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F0),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFFCCC7)),
      ),
      child: Text(
        message,
        style: const TextStyle(
          color: Color(0xFFB42318),
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _ExistingImageCard extends StatelessWidget {
  const _ExistingImageCard({
    required this.imageUrl,
    required this.onDelete,
  });

  final String imageUrl;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        SizedBox(
          width: 112,
          height: 92,
          child: AppCachedImage(
            imageUrl: imageUrl,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        Positioned(
          top: 6,
          right: 6,
          child: InkWell(
            onTap: onDelete,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.close_rounded, size: 18),
            ),
          ),
        ),
      ],
    );
  }
}

class _LocalImageCard extends StatelessWidget {
  const _LocalImageCard({
    required this.imagePath,
    required this.onDelete,
  });

  final String imagePath;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Image.file(
            File(imagePath),
            width: 112,
            height: 92,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) => Container(
              width: 112,
              height: 92,
              color: const Color(0xFFF4F6F8),
              alignment: Alignment.center,
              child: const Icon(Icons.image_outlined),
            ),
          ),
        ),
        Positioned(
          top: 6,
          right: 6,
          child: InkWell(
            onTap: onDelete,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.close_rounded, size: 18),
            ),
          ),
        ),
      ],
    );
  }
}
