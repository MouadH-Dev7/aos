class AuthUser {
  const AuthUser({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.roleId,
    required this.roleName,
    required this.isActive,
  });

  final int id;
  final String name;
  final String email;
  final String phone;
  final int roleId;
  final String roleName;
  final bool isActive;

  static const guest = AuthUser(
    id: 0,
    name: 'Guest',
    email: '',
    phone: '',
    roleId: 0,
    roleName: 'Guest',
    isActive: false,
  );

  bool get isGuest => id == 0;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as int? ?? 0,
      name: (json['name'] as String? ?? '').trim(),
      email: (json['email'] as String? ?? '').trim(),
      phone: (json['phone'] as String? ?? '').trim(),
      roleId: json['role_id'] as int? ?? 0,
      roleName: (json['role_name'] as String? ?? '').trim(),
      isActive: json['is_active'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role_id': roleId,
      'role_name': roleName,
      'is_active': isActive,
    };
  }
}

enum UserRole {
  individual(
    id: 1,
    title: 'Individual',
    subtitle: 'Search and save properties',
  ),
  agency(
    id: 2,
    title: 'Real Estate Agency',
    subtitle: 'Manage listings and clients',
  ),
  promoter(
    id: 3,
    title: 'Property Promoter',
    subtitle: 'Publish and promote real estate projects',
  );

  const UserRole({
    required this.id,
    required this.title,
    required this.subtitle,
  });

  final int id;
  final String title;
  final String subtitle;
}

class RegisterPayload {
  const RegisterPayload({
    required this.name,
    required this.email,
    required this.phone,
    required this.password,
    required this.roleId,
  });

  final String name;
  final String email;
  final String phone;
  final String password;
  final int roleId;

  Map<String, dynamic> toJson() {
    return {
      'name': name.trim(),
      'email': email.trim(),
      'phone': phone.trim(),
      'password': password,
      'role_id': roleId,
    };
  }
}

class LocationItem {
  const LocationItem({
    required this.id,
    required this.name,
    this.wilayaId,
    this.dairaId,
    this.latitude,
    this.longitude,
  });

  final int id;
  final String name;
  final int? wilayaId;
  final int? dairaId;
  final double? latitude;
  final double? longitude;

  factory LocationItem.fromJson(
    Map<String, dynamic> json, {
    int? wilayaId,
    int? dairaId,
  }) {
    return LocationItem(
      id: json['id'] as int? ?? 0,
      name: (json['name_en'] as String? ?? json['name_ar'] as String? ?? '')
          .trim(),
      wilayaId: wilayaId ?? json['wilaya_id'] as int?,
      dairaId: dairaId ?? json['daira_id'] as int?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }
}

class AuthSession {
  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
    required this.baseUrl,
  });

  final String accessToken;
  final String refreshToken;
  final AuthUser user;
  final String baseUrl;
}

class AuthException implements Exception {
  const AuthException(this.message);

  final String message;

  @override
  String toString() => message;
}
