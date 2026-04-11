import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'auth_models.dart';

class AuthService {
  AuthService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;
  // Render services can take a few extra seconds to wake up after inactivity.
  static const Duration _requestTimeout = Duration(seconds: 12);

  static const _accessTokenKey = 'auth.access_token';
  static const _refreshTokenKey = 'auth.refresh_token';
  static const _userKey = 'auth.user';
  static const _baseUrlKey = 'auth.base_url';
  static const _preferredBaseUrlKey = 'auth.preferred_base_url';

  static const _defaultBaseUrls = [
    String.fromEnvironment('AUTH_BASE_URL'),
    'https://auth-service-56qw.onrender.com',
  ];

  static const _defaultAccountBaseUrls = [
    String.fromEnvironment('ACCOUNT_BASE_URL'),
    'https://account-service-jdqy.onrender.com',
  ];

  static const _defaultLocationBaseUrls = [
    String.fromEnvironment('LOCATION_BASE_URL'),
    'https://location-service-vmm4.onrender.com',
  ];

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    Object? lastTransportError;
    final baseUrls = await _authBaseUrls();

    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .post(
              Uri.parse('$baseUrl/login/'),
              headers: const {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: jsonEncode({'email': email.trim(), 'password': password}),
            )
            .timeout(_requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          final body = _asJsonMap(response.body);
          final userJson = body['user'];
          if (userJson is! Map<String, dynamic>) {
            throw const AuthException('Malformed response from server.');
          }

          await _rememberPreferredBaseUrl(baseUrl);

          return AuthSession(
            accessToken: (body['access'] as String? ?? '').trim(),
            refreshToken: (body['refresh'] as String? ?? '').trim(),
            user: AuthUser.fromJson(userJson),
            baseUrl: baseUrl,
          );
        }

        throw AuthException(_extractErrorMessage(response.body));
      } on http.ClientException catch (error) {
        // Try next base URL on transport/network failures.
        lastTransportError = '$error on $baseUrl';
      } on TimeoutException catch (error) {
        // Try next base URL on timeout failures.
        lastTransportError = '$error on $baseUrl';
      } on FormatException catch (error) {
        // Try next base URL on invalid payload failures.
        lastTransportError = '$error on $baseUrl';
      } on AuthException {
        rethrow;
      } catch (error) {
        lastTransportError = '$error on $baseUrl';
      }
    }

    throw AuthException(
      'Unable to reach auth service. Check API server/base URL. '
      'Last error: ${lastTransportError ?? "unknown"}',
    );
  }

  Future<AuthUser> register(RegisterPayload payload) async {
    Object? lastTransportError;
    final baseUrls = await _authBaseUrls();

    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .post(
              Uri.parse('$baseUrl/register/'),
              headers: const {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: jsonEncode(payload.toJson()),
            )
            .timeout(_requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          final body = _asJsonMap(response.body);
          await _rememberPreferredBaseUrl(baseUrl);
          return AuthUser.fromJson(body);
        }

        throw AuthException(_extractErrorMessage(response.body));
      } on http.ClientException catch (error) {
        lastTransportError = '$error on $baseUrl';
      } on TimeoutException catch (error) {
        lastTransportError = '$error on $baseUrl';
      } on FormatException catch (error) {
        lastTransportError = '$error on $baseUrl';
      } on AuthException {
        rethrow;
      } catch (error) {
        lastTransportError = '$error on $baseUrl';
      }
    }

    throw AuthException(
      'Unable to reach auth service. Check API server/base URL. '
      'Last error: ${lastTransportError ?? "unknown"}',
    );
  }

  Future<List<LocationItem>> fetchWilayas() async {
    final data = await _fetchListFromLocation('/wilayas/');
    return data.map((item) => LocationItem.fromJson(item)).toList();
  }

  Future<List<LocationItem>> fetchDairas() async {
    final data = await _fetchListFromLocation('/dairas/');
    return data.map((item) => LocationItem.fromJson(item)).toList();
  }

  Future<List<LocationItem>> fetchCommunes() async {
    final data = await _fetchListFromLocation('/communes/');
    return data.map((item) => LocationItem.fromJson(item)).toList();
  }

  Future<void> createProfessionalAccountDetails({
    required int roleId,
    required int userId,
    required String companyName,
    required String ownerName,
    required String registrationNumber,
    required int communeId,
    required String description,
    required String accessToken,
    String? logoFilePath,
  }) async {
    final endpoint = roleId == UserRole.agency.id
        ? '/agences/'
        : '/promoteurs/';
    Object? lastTransportError;
    final baseUrls = await _accountBaseUrls();

    for (final baseUrl in baseUrls) {
      try {
        final request =
            http.MultipartRequest('POST', Uri.parse('$baseUrl$endpoint'))
              ..headers['Accept'] = 'application/json'
              ..headers['Authorization'] = 'Bearer $accessToken'
              ..fields['user_id'] = '$userId'
              ..fields['company_name'] = companyName.trim()
              ..fields['owner_name'] = ownerName.trim()
              ..fields['registration_number'] = registrationNumber.trim()
              ..fields['commune_id'] = '$communeId'
              ..fields['description'] = description.trim();

        if (logoFilePath != null && logoFilePath.trim().isNotEmpty) {
          final logoFile = File(logoFilePath);
          if (logoFile.existsSync()) {
            request.files.add(
              await http.MultipartFile.fromPath('logo_file', logoFilePath),
            );
          }
        }

        final streamed = await _client
            .send(request)
            .timeout(const Duration(seconds: 8));
        final response = await http.Response.fromStream(streamed);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          return;
        }
        throw AuthException(_extractErrorMessage(response.body));
      } on http.ClientException catch (error) {
        lastTransportError = '$error on $baseUrl';
      } on TimeoutException catch (error) {
        lastTransportError = '$error on $baseUrl';
      } on FormatException catch (error) {
        lastTransportError = '$error on $baseUrl';
      } on AuthException {
        rethrow;
      } catch (error) {
        lastTransportError = '$error on $baseUrl';
      }
    }

    throw AuthException(
      'Unable to reach account service. Check API server/base URL. '
      'Last error: ${lastTransportError ?? "unknown"}',
    );
  }

  Future<void> saveSession(AuthSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_accessTokenKey, session.accessToken);
    await prefs.setString(_refreshTokenKey, session.refreshToken);
    await prefs.setString(_userKey, jsonEncode(session.user.toJson()));
    await prefs.setString(_baseUrlKey, session.baseUrl);
    await prefs.setString(_preferredBaseUrlKey, session.baseUrl);
  }

  Future<bool> hasSession() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_accessTokenKey)?.isNotEmpty == true;
  }

  Future<AuthUser?> getSavedUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_userKey);
    if (raw == null || raw.isEmpty) return null;

    try {
      final jsonValue = jsonDecode(raw);
      if (jsonValue is Map<String, dynamic>) {
        return AuthUser.fromJson(jsonValue);
      }
    } catch (_) {
      return null;
    }
    return null;
  }

  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_accessTokenKey);
    await prefs.remove(_refreshTokenKey);
    await prefs.remove(_userKey);
    await prefs.remove(_baseUrlKey);
  }

  Map<String, dynamic> _asJsonMap(String rawBody) {
    final dynamic decoded = jsonDecode(rawBody);
    if (decoded is Map<String, dynamic>) return decoded;
    throw const FormatException('Expected object JSON');
  }

  Future<List<Map<String, dynamic>>> _fetchListFromLocation(String path) async {
    Object? lastTransportError;
    final baseUrls = await _locationBaseUrls();
    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .get(
              Uri.parse('$baseUrl$path'),
              headers: const {'Accept': 'application/json'},
            )
            .timeout(_requestTimeout);
        if (response.statusCode >= 200 && response.statusCode < 300) {
          await _rememberPreferredBaseUrl(_mapLocationBaseToAuthBase(baseUrl));
          final decoded = jsonDecode(response.body);
          if (decoded is List) {
            return decoded.whereType<Map<String, dynamic>>().toList();
          }
          throw const FormatException('Expected array JSON');
        }
        throw AuthException(_extractErrorMessage(response.body));
      } on http.ClientException catch (error) {
        lastTransportError = '$error on $baseUrl';
      } on TimeoutException catch (error) {
        lastTransportError = '$error on $baseUrl';
      } on FormatException catch (error) {
        lastTransportError = '$error on $baseUrl';
      } on AuthException {
        rethrow;
      } catch (error) {
        lastTransportError = '$error on $baseUrl';
      }
    }

    throw AuthException(
      'Unable to reach location service. Check API server/base URL. '
      'Last error: ${lastTransportError ?? "unknown"}',
    );
  }

  String _extractErrorMessage(String rawBody) {
    try {
      final decoded = jsonDecode(rawBody);
      if (decoded is Map<String, dynamic>) {
        final detail = decoded['detail'];
        if (detail is String && detail.trim().isNotEmpty) {
          return detail.trim();
        }

        for (final entry in decoded.entries) {
          final value = entry.value;
          if (value is String && value.trim().isNotEmpty) {
            return value.trim();
          }
          if (value is List && value.isNotEmpty) {
            final first = value.first;
            if (first is String && first.trim().isNotEmpty) {
              return first.trim();
            }
          }
        }
      }
    } catch (_) {
      // ignore and fallback below
    }
    return 'Login failed. Please verify your email and password.';
  }

  Future<List<String>> _authBaseUrls() async {
    final prefs = await SharedPreferences.getInstance();
    final preferred = prefs.getString(_preferredBaseUrlKey);
    return _orderedUrls(preferred, _defaultBaseUrls);
  }

  Future<List<String>> _accountBaseUrls() async {
    final prefs = await SharedPreferences.getInstance();
    final preferredAuth = prefs.getString(_preferredBaseUrlKey);
    final preferred = _mapAuthBaseToAccountBase(preferredAuth);
    return _orderedUrls(preferred, _defaultAccountBaseUrls);
  }

  Future<List<String>> _locationBaseUrls() async {
    final prefs = await SharedPreferences.getInstance();
    final preferredAuth = prefs.getString(_preferredBaseUrlKey);
    final preferred = _mapAuthBaseToLocationBase(preferredAuth);
    return _orderedUrls(preferred, _defaultLocationBaseUrls);
  }

  List<String> _orderedUrls(String? preferred, List<String> defaults) {
    final normalized = <String>[
      if (preferred != null && preferred.trim().isNotEmpty) preferred,
      ...defaults,
    ].map((url) => url.trim().replaceAll(RegExp(r'/+$'), '')).where((url) {
      return url.isNotEmpty;
    });

    return normalized.toSet().toList();
  }

  Future<void> _rememberPreferredBaseUrl(String authBaseUrl) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_preferredBaseUrlKey, authBaseUrl);
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

  String _mapLocationBaseToAuthBase(String locationBaseUrl) {
    if (locationBaseUrl.contains('location-service-vmm4.onrender.com')) {
      return 'https://auth-service-56qw.onrender.com';
    }
    return locationBaseUrl.replaceFirst('/api/location', '/api/auth');
  }
}
