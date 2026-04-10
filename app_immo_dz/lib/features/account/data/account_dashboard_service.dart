import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../auth/data/auth_models.dart';

class AccountDashboardData {
  const AccountDashboardData({
    required this.totalListings,
    required this.activeListings,
    required this.accountTypeLabel,
    required this.recentListings,
  });

  final int totalListings;
  final int activeListings;
  final String accountTypeLabel;
  final List<AccountListingPreview> recentListings;
}

class AccountListingPreview {
  const AccountListingPreview({
    required this.id,
    required this.title,
    required this.priceLabel,
    required this.imageUrl,
    required this.statusLabel,
    required this.locationLabel,
  });

  final int id;
  final String title;
  final String priceLabel;
  final String imageUrl;
  final String statusLabel;
  final String locationLabel;
}

class AccountDashboardService {
  AccountDashboardService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static const Duration _requestTimeout = Duration(seconds: 5);
  static const _preferredBaseUrlKey = 'auth.preferred_base_url';

  static const _listingBaseUrls = [
    String.fromEnvironment('LISTING_BASE_URL'),
    'http://192.168.100.6:8080/api/listing',
    'http://192.168.100.6:8004',
    'http://10.0.2.2:8080/api/listing',
  ];

  Future<AccountDashboardData> fetchDashboard(AuthUser user) async {
    if (user.isGuest) {
      return const AccountDashboardData(
        totalListings: 0,
        activeListings: 0,
        accountTypeLabel: 'Guest',
        recentListings: [],
      );
    }

    Object? lastError;
    final baseUrls = await _listingBaseUrlsForCurrentDevice();

    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .get(
              Uri.parse('$baseUrl/properties/list/').replace(
                queryParameters: {
                  'user_id': '${user.id}',
                  'page': '1',
                  'page_size': '100',
                },
              ),
              headers: const {'Accept': 'application/json'},
            )
            .timeout(_requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          final decoded = jsonDecode(response.body);
          final items = _extractItems(decoded);
          final totalListings = _extractCount(decoded, items.length);
          final activeListings = items.where(_isActiveListing).length;

          await _rememberListingBaseUrl(baseUrl);
          return AccountDashboardData(
            totalListings: totalListings,
            activeListings: activeListings,
            accountTypeLabel: _accountTypeLabel(user),
            recentListings: items.take(3).map(_toPreview).toList(),
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

    throw AccountDashboardException(
      'Unable to load account dashboard. Last error: ${lastError ?? "unknown"}',
    );
  }

  List<Map<String, dynamic>> _extractItems(Object? decoded) {
    if (decoded is List) {
      return decoded
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList();
    }

    if (decoded is Map<String, dynamic>) {
      final results = decoded['results'];
      if (results is List) {
        return results
            .whereType<Map>()
            .map((item) => Map<String, dynamic>.from(item))
            .toList();
      }
    }

    throw const FormatException('Expected listing array');
  }

  int _extractCount(Object? decoded, int fallback) {
    if (decoded is Map<String, dynamic>) {
      final count = decoded['count'];
      if (count is int) return count;
      if (count is num) return count.toInt();
    }
    return fallback;
  }

  bool _isActiveListing(Map<String, dynamic> item) {
    final status = _asText(item['status_name']).toLowerCase();
    return status == 'active' || status == 'approved';
  }

  AccountListingPreview _toPreview(Map<String, dynamic> item) {
    return AccountListingPreview(
      id: _asInt(item['id']),
      title: _asText(item['title'], fallback: 'Untitled property'),
      priceLabel: _formatPrice(item['price']),
      imageUrl: _imageUrl(item),
      statusLabel: _asText(item['status_name'], fallback: 'Listing'),
      locationLabel: _locationLine(item),
    );
  }

  String _accountTypeLabel(AuthUser user) {
    final rawRole = user.roleName.trim();
    if (rawRole.isNotEmpty) return rawRole;
    switch (user.roleId) {
      case 2:
        return 'Agency';
      case 3:
        return 'Promoter';
      default:
        return 'Member';
    }
  }

  String _imageUrl(Map<String, dynamic> item) {
    final main = _asText(item['main_image_url']);
    if (main.isNotEmpty) return main;

    final images = item['images'];
    if (images is List) {
      for (final raw in images) {
        if (raw is Map) {
          final url = _asText(raw['image_url']);
          if (url.isNotEmpty) return url;
        }
      }
    }

    return '';
  }

  String _locationLine(Map<String, dynamic> item) {
    final category = _asText(item['category_name']);
    final type = _asText(item['type_name']);
    final parts = [category, type].where((value) => value.isNotEmpty).toList();
    return parts.isEmpty ? 'Property listing' : parts.join(' | ');
  }

  String _formatPrice(Object? value) {
    final amount = value is num ? value.toDouble() : double.tryParse('$value');
    if (amount == null) return 'Price unavailable';
    return '${amount.toStringAsFixed(0)} DZD';
  }

  static String _asText(Object? value, {String fallback = ''}) {
    final text = (value as String? ?? '').trim();
    return text.isEmpty ? fallback : text;
  }

  static int _asInt(Object? value) {
    if (value is int) return value;
    if (value is num) return value.round();
    return int.tryParse('$value') ?? 0;
  }

  Future<List<String>> _listingBaseUrlsForCurrentDevice() async {
    final prefs = await SharedPreferences.getInstance();
    final preferredAuthBase = prefs.getString(_preferredBaseUrlKey);
    final preferredListingBase = _mapAuthBaseToListingBase(preferredAuthBase);

    final urls = <String>[
      if (preferredListingBase != null && preferredListingBase.isNotEmpty)
        preferredListingBase,
      ..._listingBaseUrls,
    ];

    return urls
        .map((url) => url.trim().replaceAll(RegExp(r'/+$'), ''))
        .where((url) => url.isNotEmpty)
        .toSet()
        .toList();
  }

  String? _mapAuthBaseToListingBase(String? authBaseUrl) {
    if (authBaseUrl == null || authBaseUrl.isEmpty) return null;
    if (authBaseUrl.contains('/api/auth')) {
      return authBaseUrl.replaceFirst('/api/auth', '/api/listing');
    }
    if (authBaseUrl.endsWith(':8001')) {
      return authBaseUrl.replaceFirst(':8001', ':8004');
    }
    return null;
  }

  Future<void> _rememberListingBaseUrl(String baseUrl) async {
    final prefs = await SharedPreferences.getInstance();
    final authBase = baseUrl.contains('/api/listing')
        ? baseUrl.replaceFirst('/api/listing', '/api/auth')
        : baseUrl.replaceFirst(':8004', ':8001');
    await prefs.setString(_preferredBaseUrlKey, authBase);
  }
}

class AccountDashboardException implements Exception {
  const AccountDashboardException(this.message);

  final String message;

  @override
  String toString() => message;
}
