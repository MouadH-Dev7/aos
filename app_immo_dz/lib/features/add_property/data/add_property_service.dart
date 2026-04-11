import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../auth/data/auth_models.dart';
import '../../auth/data/auth_service.dart';

class AddPropertyService {
  AddPropertyService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static const Duration _requestTimeout = Duration(seconds: 8);
  static const _preferredBaseUrlKey = 'auth.preferred_base_url';
  static const _accessTokenKey = 'auth.access_token';

  static const _listingBaseUrls = [
    String.fromEnvironment('LISTING_BASE_URL'),
    'https://listing-service-9ma6.onrender.com',
  ];

  Future<AddPropertyReferenceData> fetchReferenceData() async {
    final baseUrls = await _listingBaseUrlsForCurrentDevice();
    Object? lastError;

    for (final baseUrl in baseUrls) {
      try {
        final responses = await Future.wait([
          _getJsonList('$baseUrl/categories/'),
          _getJsonList('$baseUrl/types/'),
          _getJsonList('$baseUrl/amenities/'),
          _getJsonList('$baseUrl/document-types/'),
          _getJsonList('$baseUrl/contact-types/'),
          AuthService().fetchWilayas(),
          AuthService().fetchDairas(),
          AuthService().fetchCommunes(),
        ]);

        await _rememberListingBaseUrl(baseUrl);

        return AddPropertyReferenceData(
          categories: _mapItems(responses[0] as List<Map<String, dynamic>>),
          types: _mapItems(responses[1] as List<Map<String, dynamic>>),
          amenities: _mapItems(responses[2] as List<Map<String, dynamic>>),
          documentTypes: _mapItems(responses[3] as List<Map<String, dynamic>>),
          contactTypes: _mapItems(responses[4] as List<Map<String, dynamic>>),
          wilayas: responses[5] as List<LocationItem>,
          dairas: responses[6] as List<LocationItem>,
          communes: responses[7] as List<LocationItem>,
        );
      } catch (error) {
        lastError = '$error on $baseUrl';
      }
    }

    throw AddPropertyException(
      'Unable to load property reference data. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<void> submitProperty({
    required AuthUser user,
    required AddPropertySubmission submission,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final accessToken = prefs.getString(_accessTokenKey)?.trim() ?? '';
    if (accessToken.isEmpty) {
      throw const AddPropertyException(
        'Session expired. Please log in again.',
      );
    }

    final baseUrls = await _listingBaseUrlsForCurrentDevice();
    Object? lastError;

    for (final baseUrl in baseUrls) {
      try {
        final request =
            http.MultipartRequest('POST', Uri.parse('$baseUrl/properties/'))
              ..headers['Accept'] = 'application/json'
              ..headers['Authorization'] = 'Bearer $accessToken'
              ..fields['user_id'] = '${user.id}'
              ..fields['commune_id'] = '${submission.communeId}'
              ..fields['category'] = '${submission.categoryId}'
              ..fields['type'] = '${submission.typeId}'
              ..fields['title'] = submission.title.trim()
              ..fields['description'] = submission.description.trim()
              ..fields['price'] = submission.price.trim()
              ..fields['bedrooms'] = '${submission.bedrooms}'
              ..fields['bathrooms'] = '${submission.bathrooms}';

        if (submission.area.trim().isNotEmpty) {
          request.fields['area'] = submission.area.trim();
        }
        if (submission.latitude.trim().isNotEmpty) {
          request.fields['latitude'] = submission.latitude.trim();
        }
        if (submission.longitude.trim().isNotEmpty) {
          request.fields['longitude'] = submission.longitude.trim();
        }

        for (final amenityId in submission.amenityIds) {
          request.fields.addAll({'amenity_ids': '$amenityId'});
        }

        for (final imagePath in submission.imagePaths) {
          final file = File(imagePath);
          if (file.existsSync()) {
            request.files.add(
              await http.MultipartFile.fromPath('image_files', imagePath),
            );
          }
        }

        final streamed = await _client.send(request).timeout(_requestTimeout);
        final response = await http.Response.fromStream(streamed);

        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw AddPropertyException(_extractErrorMessage(response.body));
        }

        final body = _asJsonMap(response.body);
        final propertyId = body['id'] as int? ?? 0;
        if (propertyId <= 0) return;

        await _submitContacts(
          baseUrl: baseUrl,
          propertyId: propertyId,
          accessToken: accessToken,
          contacts: submission.contacts,
        );
        await _submitDocuments(
          baseUrl: baseUrl,
          propertyId: propertyId,
          accessToken: accessToken,
          documents: submission.documents,
        );
        await _rememberListingBaseUrl(baseUrl);
        return;
      } catch (error) {
        lastError = '$error on $baseUrl';
      }
    }

    throw AddPropertyException(
      'Failed to publish property. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<void> _submitContacts({
    required String baseUrl,
    required int propertyId,
    required String accessToken,
    required List<PropertyContactDraft> contacts,
  }) async {
    if (contacts.isEmpty) return;

    for (final contact in contacts) {
      final response = await _client
          .post(
            Uri.parse('$baseUrl/properties/$propertyId/contacts/'),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
            },
            body: jsonEncode({
              'contact_type': contact.contactTypeId,
              'value': contact.value,
              'is_primary': contact.isPrimary,
            }),
          )
          .timeout(_requestTimeout);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw AddPropertyException(_extractErrorMessage(response.body));
      }
    }
  }

  Future<void> _submitDocuments({
    required String baseUrl,
    required int propertyId,
    required String accessToken,
    required List<PropertyDocumentDraft> documents,
  }) async {
    if (documents.isEmpty) return;

    for (final document in documents) {
      final response = await _client
          .post(
            Uri.parse('$baseUrl/properties/$propertyId/documents/'),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $accessToken',
            },
            body: jsonEncode({
              'document_type': document.documentTypeId,
            }),
          )
          .timeout(_requestTimeout);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw AddPropertyException(_extractErrorMessage(response.body));
      }
    }
  }

  Future<List<Map<String, dynamic>>> _getJsonList(String url) async {
    final response = await _client.get(
      Uri.parse(url),
      headers: const {'Accept': 'application/json'},
    ).timeout(_requestTimeout);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw AddPropertyException(_extractErrorMessage(response.body));
    }

    final decoded = jsonDecode(response.body);
    if (decoded is List) {
      return decoded
          .whereType<Map>()
          .map((item) => Map<String, dynamic>.from(item))
          .toList();
    }
    throw const FormatException('Expected array JSON');
  }

  List<ReferenceItem> _mapItems(List<Map<String, dynamic>> items) {
    return items.map(ReferenceItem.fromJson).toList();
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
        if (detail is String && detail.trim().isNotEmpty) {
          return detail.trim();
        }

        for (final entry in decoded.entries) {
          final value = entry.value;
          if (value is String && value.trim().isNotEmpty) return value.trim();
          if (value is List && value.isNotEmpty) {
            final first = value.first;
            if (first is String && first.trim().isNotEmpty) {
              return first.trim();
            }
          }
        }
      }
    } catch (_) {}

    return 'The server could not process this property.';
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
}

class AddPropertyReferenceData {
  const AddPropertyReferenceData({
    required this.categories,
    required this.types,
    required this.amenities,
    required this.documentTypes,
    required this.contactTypes,
    required this.wilayas,
    required this.dairas,
    required this.communes,
  });

  final List<ReferenceItem> categories;
  final List<ReferenceItem> types;
  final List<ReferenceItem> amenities;
  final List<ReferenceItem> documentTypes;
  final List<ReferenceItem> contactTypes;
  final List<LocationItem> wilayas;
  final List<LocationItem> dairas;
  final List<LocationItem> communes;
}

class AddPropertySubmission {
  const AddPropertySubmission({
    required this.categoryId,
    required this.typeId,
    required this.communeId,
    required this.title,
    required this.description,
    required this.price,
    required this.area,
    required this.bedrooms,
    required this.bathrooms,
    required this.latitude,
    required this.longitude,
    required this.amenityIds,
    required this.imagePaths,
    required this.contacts,
    required this.documents,
  });

  final int categoryId;
  final int typeId;
  final int communeId;
  final String title;
  final String description;
  final String price;
  final String area;
  final int bedrooms;
  final int bathrooms;
  final String latitude;
  final String longitude;
  final List<int> amenityIds;
  final List<String> imagePaths;
  final List<PropertyContactDraft> contacts;
  final List<PropertyDocumentDraft> documents;
}

class ReferenceItem {
  const ReferenceItem({
    required this.id,
    required this.name,
  });

  final int id;
  final String name;

  factory ReferenceItem.fromJson(Map<String, dynamic> json) {
    return ReferenceItem(
      id: json['id'] as int? ?? 0,
      name: (json['name'] as String? ??
              json['name_en'] as String? ??
              json['name_ar'] as String? ??
              '')
          .trim(),
    );
  }
}

class PropertyContactDraft {
  const PropertyContactDraft({
    required this.contactTypeId,
    required this.contactTypeName,
    required this.value,
    required this.isPrimary,
  });

  final int contactTypeId;
  final String contactTypeName;
  final String value;
  final bool isPrimary;
}

class PropertyDocumentDraft {
  const PropertyDocumentDraft({
    required this.documentTypeId,
    required this.documentTypeName,
  });

  final int documentTypeId;
  final String documentTypeName;
}

class AddPropertyException implements Exception {
  const AddPropertyException(this.message);

  final String message;

  @override
  String toString() => message;
}
