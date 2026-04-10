import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../auth/data/auth_models.dart';
import '../../auth/data/auth_service.dart';
import 'directory_models.dart';

class DirectoryDetailBundle {
  const DirectoryDetailBundle({
    required this.communeName,
    required this.wilayaName,
    required this.listings,
  });

  final String communeName;
  final String wilayaName;
  final List<DirectoryLinkedListing> listings;

  String get locationLabel {
    final parts = [communeName, wilayaName].where((item) => item.isNotEmpty);
    return parts.isEmpty ? 'Location unavailable' : parts.join(', ');
  }
}

class DirectoryLinkedListing {
  const DirectoryLinkedListing({
    required this.id,
    required this.title,
    required this.priceLabel,
    required this.imageUrl,
    required this.locationLabel,
    required this.bedrooms,
    required this.bathrooms,
    required this.areaLabel,
    required this.contacts,
  });

  final int id;
  final String title;
  final String priceLabel;
  final String imageUrl;
  final String locationLabel;
  final int bedrooms;
  final int bathrooms;
  final String areaLabel;
  final List<DirectoryListingContact> contacts;
}

class DirectoryListingContact {
  const DirectoryListingContact({
    required this.typeName,
    required this.value,
    required this.isPrimary,
  });

  final String typeName;
  final String value;
  final bool isPrimary;
}

class DirectoryDetailService {
  DirectoryDetailService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static const Duration _requestTimeout = Duration(seconds: 5);
  static const _preferredBaseUrlKey = 'auth.preferred_base_url';

  static const _listingBaseUrls = [
    String.fromEnvironment('LISTING_BASE_URL'),
    'http://192.168.100.6:8080/api/listing',
    'http://192.168.100.6:8004',
    'http://10.0.2.2:8080/api/listing',
  ];

  Future<DirectoryDetailBundle> fetchBundle(DirectoryEntry entry) async {
    final authService = AuthService(client: _client);
    final futures = await Future.wait([
      authService.fetchCommunes(),
      authService.fetchWilayas(),
      if (entry.userId > 0)
        _fetchLinkedListings(entry.userId)
      else
        Future<List<DirectoryLinkedListing>>.value(const []),
    ]);

    final communes = futures[0] as List<LocationItem>;
    final wilayas = futures[1] as List<LocationItem>;
    final listings = futures[2] as List<DirectoryLinkedListing>;

    LocationItem? commune;
    for (final item in communes) {
      if (item.id == entry.communeId) {
        commune = item;
        break;
      }
    }

    LocationItem? wilaya;
    for (final item in wilayas) {
      if (item.id == commune?.wilayaId) {
        wilaya = item;
        break;
      }
    }

    return DirectoryDetailBundle(
      communeName: commune?.name ?? '',
      wilayaName: wilaya?.name ?? '',
      listings: listings,
    );
  }

  Future<List<DirectoryLinkedListing>> _fetchLinkedListings(int userId) async {
    Object? lastError;
    final baseUrls = await _listingBaseUrlsForCurrentDevice();

    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .get(
              Uri.parse('$baseUrl/properties/list/?user_id=$userId'),
              headers: const {'Accept': 'application/json'},
            )
            .timeout(_requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          final decoded = jsonDecode(response.body);
          if (decoded is! List) {
            throw const FormatException('Expected listing array');
          }
          await _rememberListingBaseUrl(baseUrl);
          return decoded
              .whereType<Map>()
              .map((raw) => _mapListing(Map<String, dynamic>.from(raw)))
              .toList();
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

    throw DirectoryDetailException(
      'Unable to load related listings. Last error: ${lastError ?? "unknown"}',
    );
  }

  DirectoryLinkedListing _mapListing(Map<String, dynamic> json) {
    final contacts = json['contacts'];
    return DirectoryLinkedListing(
      id: _asInt(json['id']),
      title: _asText(json['title'], fallback: 'Untitled listing'),
      priceLabel: _formatPrice(json['price']),
      imageUrl: _resolveImage(json),
      locationLabel: _locationLine(json),
      bedrooms: _asInt(json['bedrooms']),
      bathrooms: _asInt(json['bathrooms']),
      areaLabel: '${_asInt(json['area'])} m2',
      contacts: contacts is List
          ? contacts
              .whereType<Map>()
              .map((raw) => Map<String, dynamic>.from(raw))
              .map(
                (raw) => DirectoryListingContact(
                  typeName: _asText(raw['contact_type_name'], fallback: 'Contact'),
                  value: _asText(raw['value']),
                  isPrimary: raw['is_primary'] == true,
                ),
              )
              .where((contact) => contact.value.isNotEmpty)
              .toList()
          : const [],
    );
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

  static int _asInt(Object? value) {
    if (value is int) return value;
    if (value is num) return value.round();
    return int.tryParse('$value') ?? 0;
  }

  static String _asText(Object? value, {String fallback = ''}) {
    final text = (value as String? ?? '').trim();
    return text.isEmpty ? fallback : text;
  }

  String _resolveImage(Map<String, dynamic> json) {
    final mainImage = _asText(json['main_image_url']);
    if (mainImage.isNotEmpty) return mainImage;

    final images = json['images'];
    if (images is List) {
      for (final image in images.whereType<Map>()) {
        final url = _asText(image['image_url']);
        if (url.isNotEmpty) return url;
      }
    }

    return '';
  }

  String _locationLine(Map<String, dynamic> json) {
    final category = _asText(json['category_name']);
    final type = _asText(json['type_name']);
    final parts = [category, type].where((item) => item.isNotEmpty).toList();
    return parts.isEmpty ? 'Property listing' : parts.join(' • ');
  }

  String _formatPrice(Object? value) {
    final amount = value is num ? value.toDouble() : double.tryParse('$value');
    if (amount == null) return 'Price unavailable';
    return '${amount.toStringAsFixed(0)} DZD';
  }
}

class DirectoryDetailException implements Exception {
  const DirectoryDetailException(this.message);

  final String message;

  @override
  String toString() => message;
}
