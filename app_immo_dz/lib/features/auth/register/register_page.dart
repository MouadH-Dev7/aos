import 'dart:io';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../data/auth_models.dart';
import '../data/auth_service.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key, required this.role});

  final UserRole role;

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _authService = AuthService();

  final _fullName = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  final _confirmPassword = TextEditingController();
  final _companyName = TextEditingController();
  final _ownerName = TextEditingController();
  final _registration = TextEditingController();
  final _description = TextEditingController();
  final ImagePicker _imagePicker = ImagePicker();

  bool _isLoading = false;
  bool _loadingLocations = false;
  String? _error;
  String? _locationsError;

  List<LocationItem> _wilayas = const [];
  List<LocationItem> _dairas = const [];
  List<LocationItem> _communes = const [];
  int? _wilayaId;
  int? _dairaId;
  int? _communeId;
  XFile? _logoFile;

  bool get _isProfessional =>
      widget.role == UserRole.agency || widget.role == UserRole.promoter;

  @override
  void initState() {
    super.initState();
    if (_isProfessional) _loadLocations();
  }

  @override
  void dispose() {
    _fullName.dispose();
    _email.dispose();
    _phone.dispose();
    _password.dispose();
    _confirmPassword.dispose();
    _companyName.dispose();
    _ownerName.dispose();
    _registration.dispose();
    _description.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filteredDairas = _dairas
        .where((d) => d.wilayaId == _wilayaId)
        .toList();
    final filteredCommunes = _communes
        .where((c) => c.dairaId == _dairaId)
        .toList();

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: Column(
        children: [
          ClipRect(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
              child: Container(
                color: Colors.white.withValues(alpha: 0.82),
                padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
                child: SafeArea(
                  bottom: false,
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.arrow_back),
                        color: const Color(0xFF004AC6),
                      ),
                      const Spacer(),
                      const SizedBox(width: 48),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 780),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          _isProfessional
                              ? 'Register Your Business'
                              : 'Create Account',
                          style: Theme.of(context).textTheme.headlineMedium
                              ?.copyWith(fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Role: ${widget.role.title}',
                          style: Theme.of(context).textTheme.titleSmall
                              ?.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        const SizedBox(height: 16),
                        if (_error != null) ...[
                          _errorBox(_error!),
                          const SizedBox(height: 12),
                        ],
                        _section(
                          title: 'Identity',
                          child: Column(
                            children: [
                              _textField(
                                controller: _fullName,
                                label: 'Full Name',
                                hint: 'e.g. Mohamed Benali',
                                validator: (v) => _required(v, 'Full name'),
                              ),
                              const SizedBox(height: 10),
                              _textField(
                                controller: _email,
                                label: 'Email',
                                hint: 'contact@agency.com',
                                keyboardType: TextInputType.emailAddress,
                                validator: _validateEmail,
                              ),
                              const SizedBox(height: 10),
                              _textField(
                                controller: _phone,
                                label: 'Phone',
                                hint: '+213 000 00 00 00',
                                keyboardType: TextInputType.phone,
                                validator: (v) => _required(v, 'Phone'),
                              ),
                              const SizedBox(height: 10),
                              _textField(
                                controller: _password,
                                label: 'Password',
                                hint: 'Minimum 6 characters',
                                obscureText: true,
                                validator: _validatePassword,
                              ),
                              const SizedBox(height: 10),
                              _textField(
                                controller: _confirmPassword,
                                label: 'Confirm Password',
                                hint: 'Repeat password',
                                obscureText: true,
                                validator: _validateConfirmPassword,
                              ),
                            ],
                          ),
                        ),
                        if (_isProfessional) ...[
                          const SizedBox(height: 12),
                          _section(
                            title: widget.role == UserRole.agency
                                ? 'Agency Details'
                                : 'Promoter Details',
                            child: Column(
                              children: [
                                Row(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: Container(
                                        width: 74,
                                        height: 74,
                                        color: const Color(0xFFF3F4F6),
                                        child: _logoFile == null
                                            ? Icon(
                                                Icons.add_a_photo_outlined,
                                                color: AppColors.outline,
                                              )
                                            : Image.file(
                                                File(_logoFile!.path),
                                                fit: BoxFit.cover,
                                                errorBuilder:
                                                    (
                                                      context,
                                                      error,
                                                      stackTrace,
                                                    ) => Icon(
                                                      Icons.image,
                                                      color: AppColors.outline,
                                                    ),
                                              ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: OutlinedButton.icon(
                                        onPressed: _isLoading
                                            ? null
                                            : _pickLogo,
                                        icon: const Icon(Icons.upload),
                                        label: Text(
                                          _logoFile == null
                                              ? 'Upload Logo Image'
                                              : 'Change Logo Image',
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                _textField(
                                  controller: _companyName,
                                  label: 'Company Name',
                                  hint: 'e.g. Skyline Premier',
                                  validator: (v) =>
                                      _required(v, 'Company name'),
                                ),
                                const SizedBox(height: 10),
                                _textField(
                                  controller: _ownerName,
                                  label: 'Owner Name',
                                  hint: 'e.g. Karim Bensaid',
                                  validator: (v) => _required(v, 'Owner name'),
                                ),
                                const SizedBox(height: 10),
                                _textField(
                                  controller: _registration,
                                  label: 'Registration Number',
                                  hint: 'CR-0098234-B',
                                  validator: (v) =>
                                      _required(v, 'Registration number'),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          _section(
                            title: 'Operating Region',
                            child: Column(
                              children: [
                                if (_loadingLocations)
                                  const LinearProgressIndicator(),
                                if (_locationsError != null) ...[
                                  _errorBox(_locationsError!),
                                  const SizedBox(height: 8),
                                ],
                                _locationDropdown(
                                  label: 'Wilaya',
                                  value: _wilayaId,
                                  items: _wilayas,
                                  enabled: !_isLoading && !_loadingLocations,
                                  onChanged: (id) {
                                    setState(() {
                                      _wilayaId = id;
                                      _dairaId = null;
                                      _communeId = null;
                                    });
                                  },
                                ),
                                const SizedBox(height: 8),
                                _locationDropdown(
                                  label: 'Daira',
                                  value: _dairaId,
                                  items: filteredDairas,
                                  enabled: !_isLoading && _wilayaId != null,
                                  onChanged: (id) {
                                    setState(() {
                                      _dairaId = id;
                                      _communeId = null;
                                    });
                                  },
                                ),
                                const SizedBox(height: 8),
                                _locationDropdown(
                                  label: 'Commune',
                                  value: _communeId,
                                  items: filteredCommunes,
                                  enabled: !_isLoading && _dairaId != null,
                                  onChanged: (id) {
                                    setState(() {
                                      _communeId = id;
                                    });
                                  },
                                ),
                                const SizedBox(height: 10),
                                _textField(
                                  controller: _description,
                                  label: 'Description',
                                  hint: 'About your company and portfolio...',
                                  maxLines: 4,
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF004AC6),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              _isLoading
                                  ? 'Creating Account...'
                                  : 'Create Account',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _section({required String title, required Widget child}) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.surfaceVariant.withValues(alpha: 0.7),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _textField({
    required TextEditingController controller,
    required String label,
    required String hint,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    bool obscureText = false,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      validator: validator,
      keyboardType: keyboardType,
      obscureText: obscureText,
      maxLines: maxLines,
      enabled: !_isLoading,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        filled: true,
        fillColor: const Color(0xFFF3F4F6),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  Widget _locationDropdown({
    required String label,
    required int? value,
    required List<LocationItem> items,
    required bool enabled,
    required ValueChanged<int?> onChanged,
  }) {
    return DropdownButtonFormField<int>(
      key: ValueKey('$label$value'),
      initialValue: value,
      onChanged: enabled ? onChanged : null,
      items: [
        DropdownMenuItem<int>(value: null, child: Text('Select $label')),
        ...items.map(
          (item) =>
              DropdownMenuItem<int>(value: item.id, child: Text(item.name)),
        ),
      ],
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: const Color(0xFFF3F4F6),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }

  Widget _errorBox(String message) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F0),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFFFCCC7)),
      ),
      child: Text(message, style: const TextStyle(color: Color(0xFFB42318))),
    );
  }

  Future<void> _loadLocations() async {
    setState(() {
      _loadingLocations = true;
      _locationsError = null;
    });
    try {
      final results = await Future.wait([
        _authService.fetchWilayas(),
        _authService.fetchDairas(),
        _authService.fetchCommunes(),
      ]);
      final wilayas = results[0];
      final dairas = results[1];
      final communes = results[2];
      if (!mounted) return;
      setState(() {
        _wilayas = wilayas;
        _dairas = dairas;
        _communes = communes;
      });
    } on AuthException catch (e) {
      if (!mounted) return;
      setState(() => _locationsError = e.message);
    } catch (_) {
      if (!mounted) return;
      setState(() => _locationsError = 'Failed to load locations.');
    } finally {
      if (mounted) setState(() => _loadingLocations = false);
    }
  }

  String? _required(String? value, String name) {
    if (value == null || value.trim().isEmpty) return '$name is required';
    return null;
  }

  String? _validateEmail(String? value) {
    final required = _required(value, 'Email');
    if (required != null) return required;
    if (!(value!.contains('@') && value.contains('.'))) return 'Invalid email';
    return null;
  }

  String? _validatePassword(String? value) {
    final required = _required(value, 'Password');
    if (required != null) return required;
    if (value!.length < 6) return 'Minimum 6 characters';
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    final required = _required(value, 'Confirm password');
    if (required != null) return required;
    if (value != _password.text) return 'Passwords do not match';
    return null;
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (_isProfessional && _communeId == null) {
      setState(() => _error = 'Please select wilaya, daira, and commune.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await _authService.register(
        RegisterPayload(
          name: _fullName.text.trim(),
          email: _email.text.trim(),
          phone: _phone.text.trim(),
          password: _password.text,
          roleId: widget.role.id,
        ),
      );

      final session = await _authService.login(
        email: _email.text.trim(),
        password: _password.text,
      );

      if (_isProfessional) {
        await _authService.createProfessionalAccountDetails(
          roleId: widget.role.id,
          userId: session.user.id,
          companyName: _companyName.text.trim(),
          ownerName: _ownerName.text.trim(),
          registrationNumber: _registration.text.trim(),
          communeId: _communeId!,
          description: _description.text.trim(),
          accessToken: session.accessToken,
          logoFilePath: _logoFile?.path,
        );
      }

      await _authService.saveSession(session);
      if (!mounted) return;
      Navigator.of(context).pushNamedAndRemoveUntil(
        AppRoutes.home,
        (route) => false,
        arguments: session.user,
      );
    } on AuthException catch (e) {
      if (!mounted) return;
      setState(() => _error = e.message);
    } catch (_) {
      if (!mounted) return;
      setState(
        () => _error = 'Unable to complete registration. Please try again.',
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickLogo() async {
    try {
      final file = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
      );
      if (file == null || !mounted) return;
      setState(() {
        _logoFile = file;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = 'Unable to pick image: $error';
      });
    }
  }
}
