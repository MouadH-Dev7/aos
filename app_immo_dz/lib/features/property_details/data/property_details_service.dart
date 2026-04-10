import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'property_details_models.dart';

class PropertyDetailsService {
  PropertyDetailsService({http.Client? client})
    : _client = client ?? http.Client();

  final http.Client _client;

  static const Duration _requestTimeout = Duration(seconds: 5);
  static const _preferredBaseUrlKey = 'auth.preferred_base_url';
  static const _listingBaseUrls = [
    String.fromEnvironment('LISTING_BASE_URL'),
    'http://192.168.100.6:8080/api/listing',
    'http://192.168.100.6:8004',
    'http://10.0.2.2:8080/api/listing',
  ];

  Future<PropertyDetailsData> fetchProperty(int propertyId) async {
    final baseUrls = await _listingBaseUrlsForCurrentDevice();
    Object? lastError;

    for (final baseUrl in baseUrls) {
      try {
        final listResponse = await _client
            .get(
              Uri.parse('$baseUrl/properties/list/'),
              headers: const {'Accept': 'application/json'},
            )
            .timeout(_requestTimeout);

        if (listResponse.statusCode >= 200 && listResponse.statusCode < 300) {
          final decoded = jsonDecode(listResponse.body);
          if (decoded is List) {
            final match = decoded.whereType<Map>().map((raw) {
              return Map<String, dynamic>.from(raw);
            }).where((item) => _asInt(item['id']) == propertyId).cast<Map<String, dynamic>>().toList();

            if (match.isNotEmpty) {
              await _rememberListingBaseUrl(baseUrl);
              return _fromJson(match.first);
            }
          }
        }

        final detailResponse = await _client
            .get(
              Uri.parse('$baseUrl/properties/$propertyId/'),
              headers: const {'Accept': 'application/json'},
            )
            .timeout(_requestTimeout);

        if (detailResponse.statusCode >= 200 && detailResponse.statusCode < 300) {
          final decoded = jsonDecode(detailResponse.body);
          if (decoded is Map<String, dynamic>) {
            await _rememberListingBaseUrl(baseUrl);
            return _fromJson(decoded);
          }
        }

        lastError = 'Property $propertyId not found on $baseUrl';
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

    throw PropertyDetailsException(
      'Unable to load property details. Last error: ${lastError ?? "unknown"}',
    );
  }

  PropertyDetailsData _fromJson(Map<String, dynamic> json) {
    final imagesRaw = (json['images'] as List? ?? const []).whereType<Map>();
    final amenitiesRaw = (json['amenities'] as List? ?? const []).whereType<Map>();
    final documentsRaw = (json['documents'] as List? ?? const []).whereType<Map>();
    final contactsRaw = (json['contacts'] as List? ?? const []).whereType<Map>();

    final images = imagesRaw
        .map((raw) => PropertyImageData(
              id: _asInt(raw['id']),
              imageUrl: _asText(raw['image_url']),
              position: _asInt(raw['position']),
            ))
        .where((item) => item.imageUrl.isNotEmpty)
        .toList()
      ..sort((a, b) => a.position.compareTo(b.position));

    return PropertyDetailsData(
      id: _asInt(json['id']),
      title: _asText(json['title'], fallback: 'Untitled property'),
      categoryName: _asText(json['category_name'], fallback: 'Property'),
      typeName: _asText(json['type_name'], fallback: 'Listing'),
      statusName: _asText(json['status_name'], fallback: 'Pending'),
      description: _asText(json['description']),
      price: _asDouble(json['price']),
      area: _asInt(json['area']),
      bedrooms: _asInt(json['bedrooms']),
      bathrooms: _asInt(json['bathrooms']),
      communeId: _asInt(json['commune_id']),
      latitude: _asDouble(json['latitude']),
      longitude: _asDouble(json['longitude']),
      images: images,
      amenities: amenitiesRaw
          .map((raw) => PropertyAmenityData(
                id: _asInt(raw['id']),
                name: _asText(raw['name'], fallback: 'Amenity'),
              ))
          .toList(),
      documents: documentsRaw
          .map((raw) => PropertyDocumentData(
                id: _asInt(raw['id']),
                documentTypeName: _asText(
                  raw['document_type_name'],
                  fallback: 'Document',
                ),
                name: _asText(raw['name']),
              ))
          .toList(),
      contacts: contactsRaw
          .map((raw) => PropertyContactData(
                id: _asInt(raw['id']),
                contactTypeName: _asText(
                  raw['contact_type_name'],
                  fallback: 'Contact',
                ),
                value: _asText(raw['value']),
                isPrimary: raw['is_primary'] == true,
              ))
          .toList(),
      createdAt: DateTime.tryParse(_asText(json['created_at'])),
    );
  }

  Future<List<String>> _listingBaseUrlsForCurrentDevice() async {
    final prefs = await SharedPreferences.getInstance();
    final preferredAuthBase = prefs.getString(_preferredBaseUrlKey);
    final preferredListingBase = _mapAuthBaseToListingBase(preferredAuthBase);

    return <String>[
      if (preferredListingBase != null && preferredListingBase.isNotEmpty)
        preferredListingBase,
      ..._listingBaseUrls,
    ].map((url) => url.trim().replaceAll(RegExp(r'/+$'), '')).where((url) {
      return url.isNotEmpty;
    }).toSet().toList();
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

  static double? _asDouble(Object? value) {
    if (value is double) return value;
    if (value is num) return value.toDouble();
    return double.tryParse('$value');
  }

  static String _asText(Object? value, {String fallback = ''}) {
    final text = (value as String? ?? '').trim();
    return text.isEmpty ? fallback : text;
  }
}

class PropertyDetailsException implements Exception {
  const PropertyDetailsException(this.message);

  final String message;

  @override
  String toString() => message;
}
