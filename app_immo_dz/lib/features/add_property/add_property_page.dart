import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:image_picker/image_picker.dart';
import 'package:latlong2/latlong.dart';

import '../../core/theme/app_colors.dart';
import '../auth/data/auth_models.dart';
import 'data/add_property_service.dart';

class AddPropertyPage extends StatefulWidget {
  const AddPropertyPage({
    super.key,
    required this.user,
  });

  final AuthUser user;

  @override
  State<AddPropertyPage> createState() => _AddPropertyPageState();
}

class _AddPropertyPageState extends State<AddPropertyPage> {
  final _service = AddPropertyService();
  final _picker = ImagePicker();
  final _formKey = GlobalKey<FormState>();
  final _mapController = MapController();

  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _areaController = TextEditingController();
  final _bedroomsController = TextEditingController(text: '3');
  final _bathroomsController = TextEditingController(text: '2');
  final _descriptionController = TextEditingController();
  final _latitudeController = TextEditingController();
  final _longitudeController = TextEditingController();
  final _contactValueController = TextEditingController();

  late Future<AddPropertyReferenceData> _referenceFuture;

  int? _selectedCategoryId;
  int? _selectedTypeId;
  int? _selectedWilayaId;
  int? _selectedDairaId;
  int? _selectedCommuneId;
  int? _selectedContactTypeId;
  final Set<int> _selectedAmenityIds = <int>{};
  final List<PropertyDocumentDraft> _documents = [];
  final List<PropertyContactDraft> _contacts = [];
  final List<XFile> _images = [];
  bool _contactPrimary = false;
  bool _contactsSeeded = false;

  bool _submitting = false;
  String? _submitError;
  String? _submitSuccess;

  @override
  void initState() {
    super.initState();
    _referenceFuture = _service.fetchReferenceData();
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

  Future<void> _reloadReferenceData() async {
    setState(() {
      _referenceFuture = _service.fetchReferenceData();
    });
    await _referenceFuture;
  }

  Future<void> _pickImages() async {
    final files = await _picker.pickMultiImage(imageQuality: 88);
    if (files.isEmpty) return;

    setState(() {
      for (final file in files) {
        final exists = _images.any((item) => item.path == file.path);
        if (!exists) {
          _images.add(file);
        }
      }
    });
  }

  void _removeImageAt(int index) {
    setState(() {
      _images.removeAt(index);
    });
  }

  void _addDocumentType(ReferenceItem? item) {
    if (item == null) return;

    final exists = _documents.any(
      (document) => document.documentTypeId == item.id,
    );
    if (exists) {
      setState(() {
        _submitError = 'This document type is already added.';
        _submitSuccess = null;
      });
      return;
    }

    setState(() {
      _documents.insert(
        0,
        PropertyDocumentDraft(
          documentTypeId: item.id,
          documentTypeName: item.name,
        ),
      );
    });
  }

  void _removeDocumentType(int documentTypeId) {
    setState(() {
      _documents.removeWhere(
        (document) => document.documentTypeId == documentTypeId,
      );
    });
  }

  String? _requiredField(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Required';
    }
    return null;
  }

  List<PropertyContactDraft> _defaultContactsFromUser(
    List<ReferenceItem> contactTypes,
  ) {
    final contacts = <PropertyContactDraft>[];

    ReferenceItem? byName(String name) {
      for (final item in contactTypes) {
        if (item.name.toLowerCase() == name) return item;
      }
      return null;
    }

    final phoneType = byName('phone');
    final emailType = byName('email');

    if (phoneType != null && widget.user.phone.trim().isNotEmpty) {
      contacts.add(
        PropertyContactDraft(
          contactTypeId: phoneType.id,
          contactTypeName: phoneType.name,
          value: widget.user.phone.trim(),
          isPrimary: true,
        ),
      );
    }

    if (emailType != null && widget.user.email.trim().isNotEmpty) {
      contacts.add(
        PropertyContactDraft(
          contactTypeId: emailType.id,
          contactTypeName: emailType.name,
          value: widget.user.email.trim(),
          isPrimary: contacts.isEmpty,
        ),
      );
    }

    return contacts;
  }

  void _ensureSeededContacts(List<ReferenceItem> contactTypes) {
    if (_contactsSeeded) return;
    _contactsSeeded = true;
    _contacts.addAll(_defaultContactsFromUser(contactTypes));
  }

  void _syncCoordinatesFromSelection(AddPropertyReferenceData referenceData) {
    LocationItem? selected;

    if (_selectedCommuneId != null) {
      for (final item in referenceData.communes) {
        if (item.id == _selectedCommuneId) {
          selected = item;
          break;
        }
      }
    } else if (_selectedDairaId != null) {
      for (final item in referenceData.dairas) {
        if (item.id == _selectedDairaId) {
          selected = item;
          break;
        }
      }
    } else if (_selectedWilayaId != null) {
      for (final item in referenceData.wilayas) {
        if (item.id == _selectedWilayaId) {
          selected = item;
          break;
        }
      }
    }

    final lat = selected?.latitude;
    final lng = selected?.longitude;
    if (lat != null && lng != null) {
      _latitudeController.text = lat.toStringAsFixed(6);
      _longitudeController.text = lng.toStringAsFixed(6);
      try {
        _mapController.move(LatLng(lat, lng), 13);
      } catch (_) {}
    }
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

  LatLng _currentMapPoint() {
    final latitude = double.tryParse(_latitudeController.text.trim());
    final longitude = double.tryParse(_longitudeController.text.trim());
    if (latitude != null && longitude != null) {
      return LatLng(latitude, longitude);
    }
    return const LatLng(36.7538, 3.0588);
  }

  void _addContact(List<ReferenceItem> contactTypes) {
    if (_selectedContactTypeId == null ||
        _contactValueController.text.trim().isEmpty) {
      setState(() {
        _submitError = 'Select a contact type and enter a value.';
        _submitSuccess = null;
      });
      return;
    }

    final value = _contactValueController.text.trim();
    final exists = _contacts.any(
      (contact) =>
          contact.contactTypeId == _selectedContactTypeId &&
          contact.value.toLowerCase() == value.toLowerCase(),
    );
    if (exists) {
      setState(() {
        _submitError = 'This contact is already added.';
        _submitSuccess = null;
      });
      return;
    }

    ReferenceItem? selectedType;
    for (final item in contactTypes) {
      if (item.id == _selectedContactTypeId) {
        selectedType = item;
        break;
      }
    }
    if (selectedType == null) return;

    final newContact = PropertyContactDraft(
      contactTypeId: selectedType.id,
      contactTypeName: selectedType.name,
      value: value,
      isPrimary: _contactPrimary || _contacts.isEmpty,
    );

    setState(() {
      final next = [newContact, ..._contacts];
      if (newContact.isPrimary) {
        _contacts
          ..clear()
          ..addAll(
            next.map(
              (contact) => PropertyContactDraft(
                contactTypeId: contact.contactTypeId,
                contactTypeName: contact.contactTypeName,
                value: contact.value,
                isPrimary: identical(contact, newContact),
              ),
            ),
          );
      } else {
        _contacts
          ..clear()
          ..addAll(next);
      }
      _selectedContactTypeId = null;
      _contactValueController.clear();
      _contactPrimary = false;
      _submitError = null;
    });
  }

  void _removeContact(PropertyContactDraft target) {
    setState(() {
      final next = _contacts.where((contact) {
        return !(contact.contactTypeId == target.contactTypeId &&
            contact.value == target.value);
      }).toList();

      if (next.isNotEmpty && !next.any((contact) => contact.isPrimary)) {
        final first = next.first;
        next[0] = PropertyContactDraft(
          contactTypeId: first.contactTypeId,
          contactTypeName: first.contactTypeName,
          value: first.value,
          isPrimary: true,
        );
      }

      _contacts
        ..clear()
        ..addAll(next);
    });
  }

  void _makePrimary(PropertyContactDraft target) {
    setState(() {
      final updated = _contacts
          .map(
            (contact) => PropertyContactDraft(
              contactTypeId: contact.contactTypeId,
              contactTypeName: contact.contactTypeName,
              value: contact.value,
              isPrimary: contact.contactTypeId == target.contactTypeId &&
                  contact.value == target.value,
            ),
          )
          .toList();
      _contacts
        ..clear()
        ..addAll(updated);
    });
  }

  Future<void> _submit() async {
    final referenceData = await _referenceFuture;

    if (widget.user.isGuest) {
      setState(() {
        _submitError = 'Please log in before publishing a property.';
        _submitSuccess = null;
      });
      return;
    }

    if (!_formKey.currentState!.validate()) return;

    if (_selectedCategoryId == null ||
        _selectedTypeId == null ||
        _selectedWilayaId == null ||
        _selectedDairaId == null ||
        _selectedCommuneId == null) {
      setState(() {
        _submitError =
            'Please complete category, type, wilaya, daira, and commune.';
        _submitSuccess = null;
      });
      return;
    }

    setState(() {
      _submitError = null;
      _submitSuccess = null;
      _submitting = true;
    });

    try {
      await _service.submitProperty(
        user: widget.user,
        submission: AddPropertySubmission(
          categoryId: _selectedCategoryId!,
          typeId: _selectedTypeId!,
          communeId: _selectedCommuneId!,
          title: _titleController.text,
          description: _descriptionController.text,
          price: _priceController.text,
          area: _areaController.text,
          bedrooms: int.tryParse(_bedroomsController.text.trim()) ?? 0,
          bathrooms: int.tryParse(_bathroomsController.text.trim()) ?? 0,
          latitude: _latitudeController.text,
          longitude: _longitudeController.text,
          amenityIds: _selectedAmenityIds.toList(),
          imagePaths: _images.map((file) => file.path).toList(),
          contacts: _contacts.isEmpty
              ? _defaultContactsFromUser(referenceData.contactTypes)
              : List<PropertyContactDraft>.from(_contacts),
          documents: _documents,
        ),
      );

      if (!mounted) return;
      setState(() {
        _submitting = false;
        _submitSuccess = 'Property published successfully.';
      });
      Navigator.of(context).pop();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _submitting = false;
        _submitError = '$error';
      });
    }
  }

  Widget _buildBasicInfoSection(AddPropertyReferenceData referenceData) {
    return _Panel(
      child: Column(
        children: [
          _AppField(
            label: 'Property Title',
            controller: _titleController,
            hintText: 'e.g., Luxury apartment with sea view',
            validator: _requiredField,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _DropdownField<int>(
                  label: 'Property Type',
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
              const SizedBox(width: 12),
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
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLocationSection(
    AddPropertyReferenceData referenceData,
    List<LocationItem> filteredDairas,
    List<LocationItem> filteredCommunes,
  ) {
    final theme = Theme.of(context);

    return _Panel(
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _DropdownField<int>(
                  label: 'State',
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
                      _syncCoordinatesFromSelection(referenceData);
                    });
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _DropdownField<int>(
                  label: 'District',
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
                      _syncCoordinatesFromSelection(referenceData);
                    });
                  },
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _DropdownField<int>(
                  label: 'City',
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
                      _syncCoordinatesFromSelection(referenceData);
                    });
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 220,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: _currentMapPoint(),
                  initialZoom: 11,
                  onTap: (_, point) => _setMapCoordinates(point),
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
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
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.22),
                                blurRadius: 16,
                                offset: const Offset(0, 8),
                              ),
                            ],
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
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline_rounded, color: AppColors.primary),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Tap the map to fine-tune the property location.',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppColors.onSurfaceVariant,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpecificationsSection() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _MetricPanel(
                label: 'Price (DZD)',
                icon: Icons.payments_outlined,
                controller: _priceController,
                hintText: '15000000',
                validator: _requiredField,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MetricPanel(
                label: 'Area (m²)',
                icon: Icons.square_foot_rounded,
                controller: _areaController,
                hintText: '120',
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _MetricPanel(
                label: 'Bedrooms',
                icon: Icons.bed_rounded,
                controller: _bedroomsController,
                hintText: '2',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MetricPanel(
                label: 'Bathrooms',
                icon: Icons.bathtub_outlined,
                controller: _bathroomsController,
                hintText: '1',
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildAmenitiesSection(AddPropertyReferenceData referenceData) {
    final theme = Theme.of(context);

    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: referenceData.amenities.map((item) {
        final selected = _selectedAmenityIds.contains(item.id);
        return InkWell(
          onTap: () {
            setState(() {
              if (selected) {
                _selectedAmenityIds.remove(item.id);
              } else {
                _selectedAmenityIds.add(item.id);
              }
            });
          },
          borderRadius: BorderRadius.circular(18),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: selected ? AppColors.primary.withValues(alpha: 0.1) : Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: selected
                    ? AppColors.primary.withValues(alpha: 0.3)
                    : Colors.transparent,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  selected
                      ? Icons.check_box_rounded
                      : Icons.check_box_outline_blank_rounded,
                  color: selected ? AppColors.primary : AppColors.outline,
                  size: 20,
                ),
                const SizedBox(width: 10),
                Text(
                  item.name,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPhotosSection() {
    return Row(
      children: [
        _PhotoAddTile(onTap: _pickImages),
        const SizedBox(width: 10),
        Expanded(
          child: SizedBox(
            height: 104,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _images.length,
              separatorBuilder: (_, _) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final image = _images[index];
                return _PhotoPreviewTile(
                  imagePath: image.path,
                  onRemove: () => _removeImageAt(index),
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildContactsSection(AddPropertyReferenceData referenceData) {
    final theme = Theme.of(context);

    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
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
                  label: 'Contact Value',
                  controller: _contactValueController,
                  hintText: 'e.g. +213 550 00 00 00',
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  value: _contactPrimary,
                  activeColor: AppColors.primary,
                  title: Text(
                    'Primary contact',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  controlAffinity: ListTileControlAffinity.leading,
                  onChanged: (value) {
                    setState(() => _contactPrimary = value ?? false);
                  },
                ),
              ),
              FilledButton(
                onPressed: () => _addContact(referenceData.contactTypes),
                child: const Text('Add'),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (_contacts.isEmpty)
            Text(
              'No contacts added yet.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AppColors.onSurfaceVariant,
              ),
            )
          else
            Column(
              children: _contacts.map((contact) {
                return Container(
                  margin: const EdgeInsets.only(top: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F7FB),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  contact.contactTypeName,
                                  style: theme.textTheme.titleSmall?.copyWith(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                if (contact.isPrimary) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Text(
                                      'Primary',
                                      style: theme.textTheme.labelSmall?.copyWith(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(contact.value),
                          ],
                        ),
                      ),
                      if (!contact.isPrimary)
                        TextButton(
                          onPressed: () => _makePrimary(contact),
                          child: const Text('Set Primary'),
                        ),
                      IconButton(
                        onPressed: () => _removeContact(contact),
                        icon: const Icon(Icons.delete_outline_rounded),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildDocumentsSection(AddPropertyReferenceData referenceData) {
    final theme = Theme.of(context);

    return _Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                'Documents (Optional)',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'PDF/JPG',
                  style: theme.textTheme.labelSmall?.copyWith(
                    color: AppColors.outline,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          DropdownButtonFormField<int>(
            initialValue: null,
            decoration: _inputDecoration('Document Type'),
            items: referenceData.documentTypes
                .map(
                  (item) => DropdownMenuItem<int>(
                    value: item.id,
                    child: Text(item.name),
                  ),
                )
                .toList(),
            onChanged: (value) {
              if (value == null) return;
              ReferenceItem? selected;
              for (final item in referenceData.documentTypes) {
                if (item.id == value) {
                  selected = item;
                  break;
                }
              }
              _addDocumentType(selected);
            },
          ),
          const SizedBox(height: 14),
          if (_documents.isEmpty)
            Text(
              'No documents selected yet.',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AppColors.onSurfaceVariant,
              ),
            )
          else
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: _documents.map((document) {
                return Chip(
                  avatar: const Icon(
                    Icons.description_outlined,
                    color: AppColors.primary,
                    size: 18,
                  ),
                  label: Text(document.documentTypeName),
                  deleteIcon: const Icon(Icons.close_rounded),
                  onDeleted: () => _removeDocumentType(document.documentTypeId),
                  backgroundColor: const Color(0xFFF5F7FB),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: Colors.white.withValues(alpha: 0.9),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        title: Text(
          'Add Property',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w800,
          ),
        ),
        actions: [
          TextButton(
            onPressed: _submitting ? null : _submit,
            child: const Text(
              'Publish',
              style: TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 18),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.92),
            border: Border(
              top: BorderSide(
                color: AppColors.outlineVariant.withValues(alpha: 0.6),
              ),
            ),
          ),
          child: SizedBox(
            height: 58,
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF004AC6), Color(0xFF2563EB)],
                ),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF004AC6).withValues(alpha: 0.24),
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: FilledButton.icon(
                onPressed: _submitting ? null : _submit,
                style: FilledButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  disabledBackgroundColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(22),
                  ),
                ),
                icon: _submitting
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.send_rounded),
                label: Text(
                  _submitting ? 'Publishing...' : 'Publish Property Now',
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ),
        ),
      ),
      body: FutureBuilder<AddPropertyReferenceData>(
        future: _referenceFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting &&
              !snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${snapshot.error}',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: _reloadReferenceData,
                      child: const Text('Try again'),
                    ),
                  ],
                ),
              ),
            );
          }

          final referenceData = snapshot.data!;
          _ensureSeededContacts(referenceData.contactTypes);
          final filteredDairas = referenceData.dairas
              .where((item) => item.wilayaId == _selectedWilayaId)
              .toList();
          final filteredCommunes = referenceData.communes
              .where((item) => item.dairaId == _selectedDairaId)
              .toList();

          return Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
              children: [
                if (_submitError != null)
                  _StatusBanner(
                    message: _submitError!,
                    color: const Color(0xFFFFE1DE),
                    textColor: const Color(0xFF93000A),
                  ),
                if (_submitSuccess != null)
                  _StatusBanner(
                    message: _submitSuccess!,
                    color: const Color(0xFFDDF6E8),
                    textColor: const Color(0xFF0F6B41),
                  ),
                _SectionTitle(title: 'Basic Information'),
                _buildBasicInfoSection(referenceData),
                const SizedBox(height: 28),
                _SectionTitle(title: 'Location Details'),
                _buildLocationSection(referenceData, filteredDairas, filteredCommunes),
                const SizedBox(height: 28),
                _SectionTitle(title: 'Specifications'),
                _buildSpecificationsSection(),
                const SizedBox(height: 28),
                _SectionTitle(title: 'Amenities & Features'),
                _buildAmenitiesSection(referenceData),
                const SizedBox(height: 28),
                _SectionTitle(title: 'Property Description'),
                _Panel(
                  child: _AppField(
                    label: 'Description',
                    controller: _descriptionController,
                    hintText: 'Enter additional property details here...',
                    maxLines: 5,
                    validator: _requiredField,
                  ),
                ),
                const SizedBox(height: 28),
                _SectionTitle(title: 'Property Photos'),
                _buildPhotosSection(),
                const SizedBox(height: 28),
                _SectionTitle(title: 'Contact Information'),
                _buildContactsSection(referenceData),
                const SizedBox(height: 28),
                _buildDocumentsSection(referenceData),
                const SizedBox(height: 120),
              ],
            ),
          );
        },
      ),
    );
  }
}

// ignore: unused_element
String _locationPreview(
  AddPropertyReferenceData data,
  int? wilayaId,
  int? dairaId,
  int? communeId,
) {
  String? nameOf(Iterable<LocationItem> items, int? id) {
    if (id == null) return null;
    for (final item in items) {
      if (item.id == id) return item.name;
    }
    return null;
  }

  final parts = [
    nameOf(data.wilayas, wilayaId),
    nameOf(data.dairas, dairaId),
    nameOf(data.communes, communeId),
  ].whereType<String>().where((part) => part.trim().isNotEmpty).toList();

  return parts.isEmpty ? 'Location on Map' : parts.join(' • ');
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 26,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          const SizedBox(width: 10),
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w900,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }
}

class _Panel extends StatelessWidget {
  const _Panel({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: child,
    );
  }
}

class _StatusBanner extends StatelessWidget {
  const _StatusBanner({
    required this.message,
    required this.color,
    required this.textColor,
  });

  final String message;
  final Color color;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Text(
        message,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: textColor,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _AppField extends StatelessWidget {
  const _AppField({
    required this.label,
    required this.controller,
    required this.hintText,
    this.maxLines = 1,
    this.validator,
  });

  final String label;
  final TextEditingController controller;
  final String hintText;
  final int maxLines;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      validator: validator,
      decoration: _inputDecoration(label, hintText: hintText),
    );
  }
}

class _MetricPanel extends StatelessWidget {
  const _MetricPanel({
    required this.label,
    required this.icon,
    required this.controller,
    required this.hintText,
    this.validator,
  });

  final String label;
  final IconData icon;
  final TextEditingController controller;
  final String hintText;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w800,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Icon(icon, color: AppColors.outline),
              const SizedBox(width: 10),
              Expanded(
                child: TextFormField(
                  controller: controller,
                  validator: validator,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: InputDecoration(
                    hintText: hintText,
                    border: InputBorder.none,
                    isDense: true,
                  ),
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
        ],
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
      decoration: _inputDecoration(label),
      items: items,
      onChanged: onChanged,
    );
  }
}

class _PhotoAddTile extends StatelessWidget {
  const _PhotoAddTile({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: 104,
        height: 104,
        decoration: BoxDecoration(
          color: const Color(0xFFEAF2FF),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: AppColors.primary.withValues(alpha: 0.3),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.add_a_photo_outlined, color: AppColors.primary),
            const SizedBox(height: 8),
            Text(
              'Add Photo',
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PhotoPreviewTile extends StatelessWidget {
  const _PhotoPreviewTile({
    required this.imagePath,
    required this.onRemove,
  });

  final String imagePath;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: SizedBox(
            width: 104,
            height: 104,
            child: Image.file(File(imagePath), fit: BoxFit.cover),
          ),
        ),
        Positioned(
          top: 6,
          right: 6,
          child: Material(
            color: Colors.black.withValues(alpha: 0.45),
            shape: const CircleBorder(),
            child: InkWell(
              onTap: onRemove,
              customBorder: const CircleBorder(),
              child: const Padding(
                padding: EdgeInsets.all(6),
                child: Icon(
                  Icons.close_rounded,
                  size: 16,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

InputDecoration _inputDecoration(String label, {String? hintText}) {
  return InputDecoration(
    labelText: label,
    hintText: hintText,
    filled: true,
    fillColor: const Color(0xFFF3F4F6),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(20),
      borderSide: BorderSide.none,
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(20),
      borderSide: BorderSide.none,
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(20),
      borderSide: BorderSide(
        color: AppColors.primary.withValues(alpha: 0.35),
      ),
    ),
    errorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(20),
      borderSide: const BorderSide(color: Color(0xFFBA1A1A)),
    ),
    focusedErrorBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(20),
      borderSide: const BorderSide(color: Color(0xFFBA1A1A)),
    ),
  );
}
