import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'directory_models.dart';

class DirectoryService {
  DirectoryService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static const Duration _requestTimeout = Duration(seconds: 5);
  static const _preferredBaseUrlKey = 'auth.preferred_base_url';

  static const _accountBaseUrls = [
    String.fromEnvironment('ACCOUNT_BASE_URL'),
    'https://account-service-jdqy.onrender.com',
  ];

  Future<List<DirectoryEntry>> fetchAgencies() {
    return _fetchEntries('/agences/');
  }

  Future<List<DirectoryEntry>> fetchPromoters() {
    return _fetchEntries('/promoteurs/');
  }

  Future<DirectoryPageData> fetchAgenciesPage({
    required int page,
    int pageSize = 10,
    String search = '',
  }) {
    return _fetchEntriesPage(
      '/agences/',
      page: page,
      pageSize: pageSize,
      search: search,
    );
  }

  Future<DirectoryPageData> fetchPromotersPage({
    required int page,
    int pageSize = 10,
    String search = '',
  }) {
    return _fetchEntriesPage(
      '/promoteurs/',
      page: page,
      pageSize: pageSize,
      search: search,
    );
  }

  Future<List<DirectoryEntry>> _fetchEntries(String path) async {
    final page = await _fetchEntriesPage(path, page: 1, pageSize: 100);
    return page.items;
  }

  Future<DirectoryPageData> _fetchEntriesPage(
    String path, {
    required int page,
    required int pageSize,
    String search = '',
  }) async {
    Object? lastError;
    final baseUrls = await _accountBaseUrlsForCurrentDevice();
    final searchQuery = search.trim();

    for (final baseUrl in baseUrls) {
      try {
        final queryParameters = <String, String>{
          'page': '$page',
          'page_size': '$pageSize',
          if (searchQuery.isNotEmpty) 'search': searchQuery,
        };
        final response = await _client
            .get(
              Uri.parse('$baseUrl$path').replace(queryParameters: queryParameters),
              headers: const {'Accept': 'application/json'},
            )
            .timeout(_requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          final decoded = jsonDecode(response.body);
          final items = _extractItems(decoded);
          await _rememberAccountBaseUrl(baseUrl);
          return DirectoryPageData(
            items: items.map(_fromJson).toList(),
            hasNextPage: _hasNextPage(decoded, page, pageSize, items.length),
          );
        }

        lastError = 'HTTP ${response.statusCode} on $baseUrl';
      } on TimeoutException catch (error) {
        lastError = '$error on $baseUrl';
      } on SocketException catch (error) {
        lastError = '$error on $baseUrl';
      } on http.ClientException catch (error) {
        lastError = '$error on $baseUrl';
      } on FormatException catch (error) {
        lastError = '$error on $baseUrl';
      } catch (error) {
        lastError = '$error on $baseUrl';
      }
    }

    throw DirectoryException(
      'Unable to load directory data. Last error: ${lastError ?? "unknown"}',
    );
  }

  List<Map<String, dynamic>> _extractItems(Object? decoded) {
    if (decoded is List) {
      return decoded
          .whereType<Map>()
          .map((raw) => Map<String, dynamic>.from(raw))
          .toList();
    }
    if (decoded is Map<String, dynamic>) {
      final results = decoded['results'];
      if (results is List) {
        return results
            .whereType<Map>()
            .map((raw) => Map<String, dynamic>.from(raw))
            .toList();
      }
    }
    throw const FormatException('Expected directory array');
  }

  bool _hasNextPage(Object? decoded, int page, int pageSize, int itemCount) {
    if (decoded is Map<String, dynamic>) {
      final next = decoded['next'];
      if (next is String) return next.trim().isNotEmpty;
      final count = decoded['count'];
      if (count is int) return page * pageSize < count;
      if (count is num) return page * pageSize < count.toInt();
    }
    return itemCount >= pageSize;
  }

  DirectoryEntry _fromJson(Map<String, dynamic> json) {
    return DirectoryEntry(
      id: _asInt(json['id']),
      userId: _asInt(json['user_id']),
      companyName: _asText(json['company_name'], fallback: 'Untitled company'),
      ownerName: _asText(json['owner_name']),
      registrationNumber: _asText(json['registration_number']),
      communeId: _asInt(json['commune_id']),
      logoUrl: _asText(json['logo_url']),
      description: _asText(json['description']),
    );
  }

  Future<List<String>> _accountBaseUrlsForCurrentDevice() async {
    final prefs = await SharedPreferences.getInstance();
    final preferredAuthBase = prefs.getString(_preferredBaseUrlKey);
    final preferredAccountBase = _mapAuthBaseToAccountBase(preferredAuthBase);

    return <String>[
      if (preferredAccountBase != null && preferredAccountBase.isNotEmpty)
        preferredAccountBase,
      ..._accountBaseUrls,
    ].map((url) => url.trim().replaceAll(RegExp(r'/+$'), '')).where((url) {
      return url.isNotEmpty;
    }).toSet().toList();
  }

  String? _mapAuthBaseToAccountBase(String? authBaseUrl) {
    if (authBaseUrl == null || authBaseUrl.isEmpty) return null;
    if (authBaseUrl.contains('auth-service-56qw.onrender.com')) {
      return 'https://account-service-jdqy.onrender.com';
    }
    if (authBaseUrl.contains('/api/auth')) {
      return authBaseUrl.replaceFirst('/api/auth', '/api/account');
    }
    if (authBaseUrl.endsWith(':8001')) {
      return authBaseUrl.replaceFirst(':8001', ':8002');
    }
    return null;
  }

  Future<void> _rememberAccountBaseUrl(String baseUrl) async {
    final prefs = await SharedPreferences.getInstance();
    final authBase = baseUrl.contains('account-service-jdqy.onrender.com')
        ? 'https://auth-service-56qw.onrender.com'
        : baseUrl.contains('/api/account')
            ? baseUrl.replaceFirst('/api/account', '/api/auth')
            : baseUrl.replaceFirst(':8002', ':8001');
    await prefs.setString(_preferredBaseUrlKey, authBase);
  }

  static int _asInt(Object? value) {
    if (value is int) return value;
    if (value is num) return value.round();
    return int.tryParse('$value') ?? 0;
  }

  static String _asText(Object? value, {String fallback = ''}) {
    final text = (value as String? ?? '').trim();
    return text.isEmpty ? fallback : text;
  }
}

class DirectoryException implements Exception {
  const DirectoryException(this.message);

  final String message;

  @override
  String toString() => message;
}
