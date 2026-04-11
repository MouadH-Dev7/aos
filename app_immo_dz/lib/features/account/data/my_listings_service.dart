import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../auth/data/auth_models.dart';

class MyListingItem {
  const MyListingItem({
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

class MyListingsService {
  MyListingsService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static const Duration _requestTimeout = Duration(seconds: 8);
  static const _preferredBaseUrlKey = 'auth.preferred_base_url';

  static const _listingBaseUrls = [
    String.fromEnvironment('LISTING_BASE_URL'),
    'https://listing-service-9ma6.onrender.com',
  ];

  Future<List<MyListingItem>> fetch(AuthUser user) async {
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
          final items = _extractItems(decoded).map(_toPreview).toList();
          await _rememberListingBaseUrl(baseUrl);
          return items;
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

    throw MyListingsException(
      'Unable to load your listings. Last error: ${lastError ?? "unknown"}',
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

  MyListingItem _toPreview(Map<String, dynamic> item) {
    return MyListingItem(
      id: _asInt(item['id']),
      title: _asText(item['title'], fallback: 'Untitled property'),
      priceLabel: _formatPrice(item['price']),
      imageUrl: _imageUrl(item),
      statusLabel: _asText(item['status_name'], fallback: 'Listing'),
      locationLabel: _locationLine(item),
    );
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
    if (authBaseUrl.contains('auth-service-56qw.onrender.com')) {
      return 'https://listing-service-9ma6.onrender.com';
    }
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
    final authBase = baseUrl.contains('listing-service-9ma6.onrender.com')
        ? 'https://auth-service-56qw.onrender.com'
        : baseUrl.contains('/api/listing')
            ? baseUrl.replaceFirst('/api/listing', '/api/auth')
            : baseUrl.replaceFirst(':8004', ':8001');
    await prefs.setString(_preferredBaseUrlKey, authBase);
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
}

class MyListingsException implements Exception {
  const MyListingsException(this.message);

  final String message;

  @override
  String toString() => message;
}
