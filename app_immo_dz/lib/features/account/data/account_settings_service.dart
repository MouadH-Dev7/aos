import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../auth/data/auth_models.dart';

class BusinessProfileData {
  const BusinessProfileData({
    required this.companyName,
    required this.ownerName,
    required this.registrationNumber,
    required this.communeId,
    required this.description,
    required this.logoUrl,
  });

  final String companyName;
  final String ownerName;
  final String registrationNumber;
  final int? communeId;
  final String description;
  final String logoUrl;
}

class AccountSettingsBundle {
  const AccountSettingsBundle({
    required this.user,
    required this.businessProfile,
    required this.wilayas,
    required this.dairas,
    required this.communes,
  });

  final AuthUser user;
  final BusinessProfileData? businessProfile;
  final List<LocationItem> wilayas;
  final List<LocationItem> dairas;
  final List<LocationItem> communes;
}

class AccountSettingsService {
  AccountSettingsService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static const Duration _requestTimeout = Duration(seconds: 12);
  static const _accessTokenKey = 'auth.access_token';
  static const _userKey = 'auth.user';
  static const _preferredBaseUrlKey = 'auth.preferred_base_url';

  static const _authBaseUrls = [
    String.fromEnvironment('AUTH_BASE_URL'),
    'https://auth-service-56qw.onrender.com',
  ];

  static const _accountBaseUrls = [
    String.fromEnvironment('ACCOUNT_BASE_URL'),
    'https://account-service-jdqy.onrender.com',
  ];

  static const _locationBaseUrls = [
    String.fromEnvironment('LOCATION_BASE_URL'),
    'https://location-service-vmm4.onrender.com',
  ];

  Future<AccountSettingsBundle> load(AuthUser user) async {
    final businessProfile = await _loadBusinessProfile(user);
    final locations = user.roleId == UserRole.individual.id
        ? const <List<LocationItem>>[[], [], []]
        : await Future.wait([
            _fetchLocations('/wilayas/'),
            _fetchLocations('/dairas/'),
            _fetchLocations('/communes/'),
          ]);

    return AccountSettingsBundle(
      user: user,
      businessProfile: businessProfile,
      wilayas: locations[0],
      dairas: locations[1],
      communes: locations[2],
    );
  }

  Future<AuthUser> save({
    required AuthUser user,
    required String fullName,
    required String email,
    required String phone,
    String? companyName,
    String? ownerName,
    String? registrationNumber,
    int? communeId,
    String? description,
  }) async {
    final accessToken = await _accessToken();
    if (accessToken == null || accessToken.isEmpty) {
      throw const AccountSettingsException('Session expired. Please log in again.');
    }

    final updatedUser = await _updateMe(
      accessToken: accessToken,
      fullName: fullName,
      email: email,
      phone: phone,
    );

    if (user.roleId == UserRole.individual.id) {
      await _savePersonalProfile(
        userId: updatedUser.id,
        accessToken: accessToken,
        fullName: fullName,
        phone: phone,
      );
    } else if (user.roleId == UserRole.agency.id || user.roleId == UserRole.promoter.id) {
      await _saveBusinessProfile(
        user: updatedUser,
        accessToken: accessToken,
        companyName: companyName ?? '',
        ownerName: ownerName ?? '',
        registrationNumber: registrationNumber ?? '',
        communeId: communeId,
        description: description ?? '',
      );
    }

    await _persistUser(updatedUser);
    return updatedUser;
  }

  Future<BusinessProfileData?> _loadBusinessProfile(AuthUser user) async {
    if (user.roleId != UserRole.agency.id && user.roleId != UserRole.promoter.id) {
      return null;
    }

    Object? lastError;
    final endpoint = user.roleId == UserRole.agency.id
        ? '/agences/by-user/${user.id}/'
        : '/promoteurs/by-user/${user.id}/';
    final accessToken = await _accessToken();
    final baseUrls = await _currentBaseUrls(_accountBaseUrls, _mapAuthBaseToAccountBase);

    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .get(
              Uri.parse('$baseUrl$endpoint'),
              headers: {
                'Accept': 'application/json',
                if (accessToken != null && accessToken.isNotEmpty)
                  'Authorization': 'Bearer $accessToken',
              },
            )
            .timeout(_requestTimeout);

        if (response.statusCode == 404) {
          return null;
        }
        if (response.statusCode >= 200 && response.statusCode < 300) {
          final payload = _asJsonMap(response.body);
          return BusinessProfileData(
            companyName: _asText(payload['company_name']),
            ownerName: _asText(payload['owner_name']),
            registrationNumber: _asText(payload['registration_number']),
            communeId: _asIntOrNull(payload['commune_id']),
            description: _asText(payload['description']),
            logoUrl: _asText(payload['logo_url']),
          );
        }
        lastError = _extractErrorMessage(response.body);
      } on TimeoutException catch (error) {
        lastError = error;
      } on SocketException catch (error) {
        lastError = error;
      } on http.ClientException catch (error) {
        lastError = error;
      } on FormatException catch (error) {
        lastError = error;
      }
    }

    throw AccountSettingsException(
      'Unable to load account details. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<List<LocationItem>> _fetchLocations(String path) async {
    Object? lastError;
    final baseUrls = await _currentBaseUrls(_locationBaseUrls, _mapAuthBaseToLocationBase);

    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .get(Uri.parse('$baseUrl$path'), headers: const {'Accept': 'application/json'})
            .timeout(_requestTimeout);
        if (response.statusCode >= 200 && response.statusCode < 300) {
          final decoded = jsonDecode(response.body);
          if (decoded is List) {
            return decoded
                .whereType<Map>()
                .map((item) => LocationItem.fromJson(Map<String, dynamic>.from(item)))
                .toList();
          }
          throw const FormatException('Expected list response');
        }
        lastError = _extractErrorMessage(response.body);
      } on TimeoutException catch (error) {
        lastError = error;
      } on SocketException catch (error) {
        lastError = error;
      } on http.ClientException catch (error) {
        lastError = error;
      } on FormatException catch (error) {
        lastError = error;
      }
    }

    throw AccountSettingsException(
      'Unable to load locations. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<AuthUser> _updateMe({
    required String accessToken,
    required String fullName,
    required String email,
    required String phone,
  }) async {
    Object? lastError;
    final baseUrls = await _currentBaseUrls(_authBaseUrls, (value) => value);

    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .patch(
              Uri.parse('$baseUrl/me/'),
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer $accessToken',
              },
              body: jsonEncode({
                'name': fullName.trim(),
                'email': email.trim(),
                'phone': phone.trim(),
              }),
            )
            .timeout(_requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          return AuthUser.fromJson(_asJsonMap(response.body));
        }
        lastError = _extractErrorMessage(response.body);
      } on TimeoutException catch (error) {
        lastError = error;
      } on SocketException catch (error) {
        lastError = error;
      } on http.ClientException catch (error) {
        lastError = error;
      } on FormatException catch (error) {
        lastError = error;
      }
    }

    throw AccountSettingsException(
      'Unable to update your account. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<void> _savePersonalProfile({
    required int userId,
    required String accessToken,
    required String fullName,
    required String phone,
  }) async {
    final payload = {
      'user_id': userId,
      'full_name': fullName.trim(),
      'phone': phone.trim(),
    };
    final baseUrls = await _currentBaseUrls(_accountBaseUrls, _mapAuthBaseToAccountBase);
    Object? lastError;

    for (final baseUrl in baseUrls) {
      try {
        final profileUrl = '$baseUrl/profiles/by-user/$userId/';
        final response = await _client
            .patch(
              Uri.parse(profileUrl),
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer $accessToken',
              },
              body: jsonEncode(payload),
            )
            .timeout(_requestTimeout);

        if (response.statusCode == 404) {
          final createResponse = await _client
              .post(
                Uri.parse('$baseUrl/profiles/'),
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': 'Bearer $accessToken',
                },
                body: jsonEncode(payload),
              )
              .timeout(_requestTimeout);
          if (createResponse.statusCode >= 200 && createResponse.statusCode < 300) {
            return;
          }
          lastError = _extractErrorMessage(createResponse.body);
          continue;
        }

        if (response.statusCode >= 200 && response.statusCode < 300) {
          return;
        }
        lastError = _extractErrorMessage(response.body);
      } on TimeoutException catch (error) {
        lastError = error;
      } on SocketException catch (error) {
        lastError = error;
      } on http.ClientException catch (error) {
        lastError = error;
      }
    }

    throw AccountSettingsException(
      'Unable to save profile details. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<void> _saveBusinessProfile({
    required AuthUser user,
    required String accessToken,
    required String companyName,
    required String ownerName,
    required String registrationNumber,
    required int? communeId,
    required String description,
  }) async {
    if (companyName.trim().isEmpty) {
      throw const AccountSettingsException('Company name is required.');
    }
    if (ownerName.trim().isEmpty) {
      throw const AccountSettingsException('Owner name is required.');
    }
    if (registrationNumber.trim().isEmpty) {
      throw const AccountSettingsException('Registration number is required.');
    }
    if (communeId == null || communeId <= 0) {
      throw const AccountSettingsException('Please select a valid commune.');
    }

    final payload = {
      'user_id': user.id,
      'company_name': companyName.trim(),
      'owner_name': ownerName.trim(),
      'registration_number': registrationNumber.trim(),
      'commune_id': communeId,
      'description': description.trim(),
    };

    final baseUrls = await _currentBaseUrls(_accountBaseUrls, _mapAuthBaseToAccountBase);
    final singular = user.roleId == UserRole.agency.id ? 'agences' : 'promoteurs';
    Object? lastError;

    for (final baseUrl in baseUrls) {
      try {
        final updateResponse = await _client
            .patch(
              Uri.parse('$baseUrl/$singular/by-user/${user.id}/'),
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer $accessToken',
              },
              body: jsonEncode(payload),
            )
            .timeout(_requestTimeout);

        if (updateResponse.statusCode == 404) {
          final createResponse = await _client
              .post(
                Uri.parse('$baseUrl/$singular/'),
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': 'Bearer $accessToken',
                },
                body: jsonEncode(payload),
              )
              .timeout(_requestTimeout);
          if (createResponse.statusCode >= 200 && createResponse.statusCode < 300) {
            return;
          }
          lastError = _extractErrorMessage(createResponse.body);
          continue;
        }

        if (updateResponse.statusCode >= 200 && updateResponse.statusCode < 300) {
          return;
        }
        lastError = _extractErrorMessage(updateResponse.body);
      } on TimeoutException catch (error) {
        lastError = error;
      } on SocketException catch (error) {
        lastError = error;
      } on http.ClientException catch (error) {
        lastError = error;
      }
    }

    throw AccountSettingsException(
      'Unable to save business profile. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<List<String>> _currentBaseUrls(
    List<String> defaults,
    String? Function(String?) mapPreferred,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    final preferredAuth = prefs.getString(_preferredBaseUrlKey);
    final preferred = mapPreferred(preferredAuth);
    return <String>[
      if (preferred != null && preferred.trim().isNotEmpty) preferred,
      ...defaults,
    ].map((url) => url.trim().replaceAll(RegExp(r'/+$'), ''))
        .where((url) => url.isNotEmpty)
        .toSet()
        .toList();
  }

  Future<String?> _accessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_accessTokenKey);
  }

  Future<void> _persistUser(AuthUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  String? _mapAuthBaseToAccountBase(String? authBaseUrl) {
    if (authBaseUrl == null || authBaseUrl.isEmpty) return null;
    if (authBaseUrl.contains('auth-service-56qw.onrender.com')) {
      return 'https://account-service-jdqy.onrender.com';
    }
    return authBaseUrl.replaceFirst('/api/auth', '/api/account');
  }

  String? _mapAuthBaseToLocationBase(String? authBaseUrl) {
    if (authBaseUrl == null || authBaseUrl.isEmpty) return null;
    if (authBaseUrl.contains('auth-service-56qw.onrender.com')) {
      return 'https://location-service-vmm4.onrender.com';
    }
    return authBaseUrl.replaceFirst('/api/auth', '/api/location');
  }

  Map<String, dynamic> _asJsonMap(String rawBody) {
    final decoded = jsonDecode(rawBody);
    if (decoded is Map<String, dynamic>) return decoded;
    throw const FormatException('Expected object JSON');
  }

  String _extractErrorMessage(String rawBody) {
    try {
      final decoded = jsonDecode(rawBody);
      if (decoded is Map<String, dynamic>) {
        final detail = decoded['detail'];
        if (detail is String && detail.trim().isNotEmpty) return detail.trim();
        for (final value in decoded.values) {
          if (value is String && value.trim().isNotEmpty) return value.trim();
          if (value is List && value.isNotEmpty && value.first is String) {
            return (value.first as String).trim();
          }
        }
      }
    } catch (_) {
      return rawBody.trim().isEmpty ? 'Unexpected server error.' : rawBody.trim();
    }
    return 'Unexpected server error.';
  }

  static String _asText(Object? value) => (value as String? ?? '').trim();

  static int? _asIntOrNull(Object? value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse('$value');
  }
}

class AccountSettingsException implements Exception {
  const AccountSettingsException(this.message);

  final String message;

  @override
  String toString() => message;
}
