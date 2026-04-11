import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../auth/data/auth_models.dart';
import '../info/about_page.dart';
import '../info/contact_page.dart';
import '../info/terms_page.dart';
import 'data/account_settings_service.dart';

class AccountSettingsPage extends StatefulWidget {
  const AccountSettingsPage({super.key, required this.user});

  final AuthUser user;

  @override
  State<AccountSettingsPage> createState() => _AccountSettingsPageState();
}

class _AccountSettingsPageState extends State<AccountSettingsPage> {
  final _formKey = GlobalKey<FormState>();
  final _service = AccountSettingsService();

  late final TextEditingController _fullNameController;
  late final TextEditingController _emailController;
  late final TextEditingController _phoneController;
  late final TextEditingController _companyNameController;
  late final TextEditingController _ownerNameController;
  late final TextEditingController _registrationController;
  late final TextEditingController _descriptionController;

  bool _isLoading = true;
  bool _isSaving = false;
  String? _error;
  int? _selectedWilayaId;
  int? _selectedDairaId;
  int? _selectedCommuneId;
  List<LocationItem> _wilayas = const [];
  List<LocationItem> _dairas = const [];
  List<LocationItem> _communes = const [];

  bool get _isBusinessRole =>
      widget.user.roleId == UserRole.agency.id ||
      widget.user.roleId == UserRole.promoter.id;

  @override
  void initState() {
    super.initState();
    _fullNameController = TextEditingController(text: widget.user.name);
    _emailController = TextEditingController(text: widget.user.email);
    _phoneController = TextEditingController(text: widget.user.phone);
    _companyNameController = TextEditingController();
    _ownerNameController = TextEditingController();
    _registrationController = TextEditingController();
    _descriptionController = TextEditingController();
    _load();
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _companyNameController.dispose();
    _ownerNameController.dispose();
    _registrationController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final bundle = await _service.load(widget.user);
      final business = bundle.businessProfile;

      _companyNameController.text = business?.companyName ?? '';
      _ownerNameController.text = business?.ownerName ?? '';
      _registrationController.text = business?.registrationNumber ?? '';
      _descriptionController.text = business?.description ?? '';

      _wilayas = bundle.wilayas;
      _dairas = bundle.dairas;
      _communes = bundle.communes;
      _selectedCommuneId = business?.communeId;

      if (_selectedCommuneId != null) {
        LocationItem? commune;
        for (final item in _communes) {
          if (item.id == _selectedCommuneId) {
            commune = item;
            break;
          }
        }
        if (commune != null) {
          _selectedDairaId = commune.dairaId;
          _selectedWilayaId = commune.wilayaId;
        }
      }
    } on AccountSettingsException catch (error) {
      _error = error.message;
    } catch (_) {
      _error = 'Unable to load account settings.';
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false) || _isSaving) return;
    setState(() {
      _isSaving = true;
      _error = null;
    });

    try {
      final updatedUser = await _service.save(
        user: widget.user,
        fullName: _fullNameController.text,
        email: _emailController.text,
        phone: _phoneController.text,
        companyName: _companyNameController.text,
        ownerName: _ownerNameController.text,
        registrationNumber: _registrationController.text,
        communeId: _selectedCommuneId,
        description: _descriptionController.text,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Account information updated successfully.')),
      );
      Navigator.of(context).pop(updatedUser);
    } on AccountSettingsException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Unable to save account settings.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSaving = false;
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
        title: const Text('Account Settings'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _HeaderCard(user: widget.user),
                            const SizedBox(height: 16),
                            if (_error != null) ...[
                              _ErrorCard(message: _error!),
                              const SizedBox(height: 16),
                            ],
                            _SectionCard(
                              title: 'Personal Information',
                              subtitle: 'Update the main information used across your account.',
                              child: Column(
                                children: [
                                  _AppTextField(
                                    controller: _fullNameController,
                                    label: 'Full name',
                                    validator: (value) => _required(value, 'Full name'),
                                  ),
                                  const SizedBox(height: 12),
                                  _AppTextField(
                                    controller: _emailController,
                                    label: 'Email',
                                    keyboardType: TextInputType.emailAddress,
                                    validator: _validateEmail,
                                  ),
                                  const SizedBox(height: 12),
                                  _AppTextField(
                                    controller: _phoneController,
                                    label: 'Phone',
                                    keyboardType: TextInputType.phone,
                                    validator: (value) => _required(value, 'Phone'),
                                  ),
                                ],
                              ),
                            ),
                            if (_isBusinessRole) ...[
                              const SizedBox(height: 16),
                              _SectionCard(
                                title: widget.user.roleId == UserRole.agency.id
                                    ? 'Agency Profile'
                                    : 'Promoter Profile',
                                subtitle: 'These details are shown publicly, just like on the website.',
                                child: Column(
                                  children: [
                                    _AppTextField(
                                      controller: _companyNameController,
                                      label: 'Company name',
                                      validator: (value) => _required(value, 'Company name'),
                                    ),
                                    const SizedBox(height: 12),
                                    _AppTextField(
                                      controller: _ownerNameController,
                                      label: 'Owner name',
                                      validator: (value) => _required(value, 'Owner name'),
                                    ),
                                    const SizedBox(height: 12),
                                    _AppTextField(
                                      controller: _registrationController,
                                      label: 'Registration number',
                                      validator: (value) => _required(value, 'Registration number'),
                                    ),
                                    const SizedBox(height: 12),
                                    _LocationDropdown(
                                      label: 'Wilaya',
                                      value: _selectedWilayaId,
                                      items: _wilayas,
                                      onChanged: (value) {
                                        setState(() {
                                          _selectedWilayaId = value;
                                          _selectedDairaId = null;
                                          _selectedCommuneId = null;
                                        });
                                      },
                                    ),
                                    const SizedBox(height: 12),
                                    _LocationDropdown(
                                      label: 'Daira',
                                      value: _selectedDairaId,
                                      items: _filteredDairas,
                                      onChanged: _selectedWilayaId == null
                                          ? null
                                          : (value) {
                                              setState(() {
                                                _selectedDairaId = value;
                                                _selectedCommuneId = null;
                                              });
                                            },
                                    ),
                                    const SizedBox(height: 12),
                                    _LocationDropdown(
                                      label: 'Commune',
                                      value: _selectedCommuneId,
                                      items: _filteredCommunes,
                                      onChanged: _selectedDairaId == null
                                          ? null
                                          : (value) {
                                              setState(() {
                                                _selectedCommuneId = value;
                                              });
                                            },
                                      validator: (value) {
                                        if (_selectedCommuneId == null) {
                                          return 'Please select a commune';
                                        }
                                        return null;
                                      },
                                    ),
                                    const SizedBox(height: 12),
                                    _AppTextField(
                                      controller: _descriptionController,
                                      label: 'Description',
                                      maxLines: 4,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            const SizedBox(height: 16),
                            _SectionCard(
                              title: 'Support & Legal',
                              subtitle: 'Quick access to the same public information shown on the website.',
                              child: Column(
                                children: [
                                  _LinkTile(
                                    icon: Icons.info_outline_rounded,
                                    title: 'About',
                                    subtitle: 'Learn more about Immo DZ',
                                    onTap: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute<void>(
                                          builder: (_) => const AboutPage(),
                                        ),
                                      );
                                    },
                                  ),
                                  const SizedBox(height: 10),
                                  _LinkTile(
                                    icon: Icons.mail_outline_rounded,
                                    title: 'Contact Us',
                                    subtitle: 'Office, email, and phone details',
                                    onTap: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute<void>(
                                          builder: (_) => const ContactPage(),
                                        ),
                                      );
                                    },
                                  ),
                                  const SizedBox(height: 10),
                                  _LinkTile(
                                    icon: Icons.gavel_rounded,
                                    title: 'Terms of Service',
                                    subtitle: 'Platform terms and usage rules',
                                    onTap: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute<void>(
                                          builder: (_) => const TermsPage(),
                                        ),
                                      );
                                    },
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
                      decoration: BoxDecoration(
                        color: Colors.white,
                        border: Border(
                          top: BorderSide(
                            color: AppColors.outlineVariant.withValues(alpha: 0.24),
                          ),
                        ),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: _isSaving ? null : () => Navigator.of(context).pop(),
                              child: const Text('Cancel'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: FilledButton(
                              onPressed: _isSaving ? null : _save,
                              child: Text(_isSaving ? 'Saving...' : 'Save Changes'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  List<LocationItem> get _filteredDairas {
    if (_selectedWilayaId == null) return const [];
    return _dairas.where((item) => item.wilayaId == _selectedWilayaId).toList();
  }

  List<LocationItem> get _filteredCommunes {
    if (_selectedDairaId == null) return const [];
    return _communes.where((item) => item.dairaId == _selectedDairaId).toList();
  }

  String? _required(String? value, String label) {
    if (value == null || value.trim().isEmpty) {
      return '$label is required';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    final required = _required(value, 'Email');
    if (required != null) return required;
    if (!(value!.contains('@') && value.contains('.'))) {
      return 'Enter a valid email';
    }
    return null;
  }
}

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.user});

  final AuthUser user;

  @override
  Widget build(BuildContext context) {
    final initial = user.name.trim().isEmpty
        ? 'U'
        : user.name.trim().characters.first.toUpperCase();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F4C81), Color(0xFF1C7C7D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Colors.white.withValues(alpha: 0.18),
            child: Text(
              initial,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 22,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.name.isEmpty ? 'Your account' : user.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user.roleName.isEmpty ? 'Member' : user.roleName,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.85),
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
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
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.onSurfaceVariant,
                  height: 1.4,
                ),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class _AppTextField extends StatelessWidget {
  const _AppTextField({
    required this.controller,
    required this.label,
    this.validator,
    this.keyboardType,
    this.maxLines = 1,
  });

  final TextEditingController controller;
  final String label;
  final String? Function(String?)? validator;
  final TextInputType? keyboardType;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      maxLines: maxLines,
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

class _LocationDropdown extends StatelessWidget {
  const _LocationDropdown({
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
    this.validator,
  });

  final String label;
  final int? value;
  final List<LocationItem> items;
  final ValueChanged<int?>? onChanged;
  final String? Function(int?)? validator;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<int?>(
      initialValue: value,
      validator: validator,
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
      items: [
        DropdownMenuItem<int?>(
          value: null,
          child: Text('Select $label'),
        ),
        ...items.map(
          (item) => DropdownMenuItem<int?>(
            value: item.id,
            child: Text(
              item.name,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
      ],
      onChanged: onChanged,
    );
  }
}

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F0),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFCCC7)),
      ),
      child: Text(
        message,
        style: const TextStyle(
          color: Color(0xFFB42318),
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _LinkTile extends StatelessWidget {
  const _LinkTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFF4F6F8),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.onSurfaceVariant,
                        ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: AppColors.outline),
          ],
        ),
      ),
    );
  }
}
