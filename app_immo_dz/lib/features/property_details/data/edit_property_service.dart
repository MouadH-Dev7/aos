import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../add_property/data/add_property_service.dart';
import 'property_details_models.dart';
import 'property_details_service.dart';

class EditPropertyBundle {
  const EditPropertyBundle({
    required this.property,
    required this.referenceData,
  });

  final PropertyDetailsData property;
  final AddPropertyReferenceData referenceData;
}

class EditPropertyService {
  EditPropertyService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static const Duration _requestTimeout = Duration(seconds: 12);
  static const _preferredBaseUrlKey = 'auth.preferred_base_url';
  static const _accessTokenKey = 'auth.access_token';

  static const _listingBaseUrls = [
    String.fromEnvironment('LISTING_BASE_URL'),
    'https://listing-service-9ma6.onrender.com',
  ];

  Future<EditPropertyBundle> load(int propertyId) async {
    final property = await PropertyDetailsService().fetchProperty(propertyId);
    final referenceData = await AddPropertyService().fetchReferenceData();
    return EditPropertyBundle(property: property, referenceData: referenceData);
  }

  Future<void> update({
    required int propertyId,
    required int categoryId,
    required int typeId,
    required int communeId,
    required String title,
    required String description,
    required String price,
    required String area,
    required String bedrooms,
    required String bathrooms,
    required String latitude,
    required String longitude,
    required List<int> amenityIds,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final accessToken = prefs.getString(_accessTokenKey)?.trim() ?? '';
    if (accessToken.isEmpty) {
      throw const EditPropertyException('Session expired. Please log in again.');
    }

    final baseUrls = await _listingBaseUrlsForCurrentDevice();
    Object? lastError;

    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .patch(
              Uri.parse('$baseUrl/properties/$propertyId/'),
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer $accessToken',
              },
              body: jsonEncode({
                'commune_id': communeId,
                'category': categoryId,
                'type': typeId,
                'title': title.trim(),
                'description': description.trim(),
                'price': price.trim(),
                'area': area.trim(),
                'bedrooms': int.tryParse(bedrooms.trim()) ?? 0,
                'bathrooms': int.tryParse(bathrooms.trim()) ?? 0,
                'latitude': latitude.trim(),
                'longitude': longitude.trim(),
                'amenity_ids': amenityIds,
              }),
            )
            .timeout(_requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          await _rememberListingBaseUrl(baseUrl);
          return;
        }

        lastError = _extractErrorMessage(response.body);
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

    throw EditPropertyException(
      'Unable to update property. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<void> addImages({
    required int propertyId,
    required List<String> imagePaths,
  }) async {
    if (imagePaths.isEmpty) return;
    final accessToken = await _accessToken();
    if (accessToken.isEmpty) {
      throw const EditPropertyException('Session expired. Please log in again.');
    }
    final baseUrls = await _listingBaseUrlsForCurrentDevice();
    Object? lastError;
    for (final baseUrl in baseUrls) {
      try {
        final request = http.MultipartRequest(
          'PATCH',
          Uri.parse('$baseUrl/properties/$propertyId/'),
        )
          ..headers['Accept'] = 'application/json'
          ..headers['Authorization'] = 'Bearer $accessToken';
        for (final imagePath in imagePaths) {
          final file = File(imagePath);
          if (file.existsSync()) {
            request.files.add(
              await http.MultipartFile.fromPath('image_files', imagePath),
            );
          }
        }
        final streamed = await _client.send(request).timeout(_requestTimeout);
        final response = await http.Response.fromStream(streamed);
        if (response.statusCode >= 200 && response.statusCode < 300) {
          await _rememberListingBaseUrl(baseUrl);
          return;
        }
        lastError = _extractErrorMessage(response.body);
      } catch (error) {
        lastError = '$error on $baseUrl';
      }
    }
    throw EditPropertyException(
      'Unable to upload images. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<void> deleteImage({
    required int propertyId,
    required int imageId,
  }) async {
    await _deleteWithAuth('/properties/$propertyId/images/$imageId/');
  }

  Future<void> addDocument({
    required int propertyId,
    required int documentTypeId,
  }) async {
    final response = await _postWithAuth(
      '/properties/$propertyId/documents/',
      body: {'document_type': documentTypeId},
    );
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw EditPropertyException(_extractErrorMessage(response.body));
    }
  }

  Future<void> deleteDocument({
    required int propertyId,
    required int documentId,
  }) async {
    await _deleteWithAuth('/properties/$propertyId/documents/$documentId/');
  }

  Future<void> addContact({
    required int propertyId,
    required int contactTypeId,
    required String value,
    required bool isPrimary,
  }) async {
    final response = await _postWithAuth(
      '/properties/$propertyId/contacts/',
      body: {
        'contact_type': contactTypeId,
        'value': value.trim(),
        'is_primary': isPrimary,
      },
    );
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw EditPropertyException(_extractErrorMessage(response.body));
    }
  }

  Future<void> deleteContact({
    required int propertyId,
    required int contactId,
  }) async {
    await _deleteWithAuth('/properties/$propertyId/contacts/$contactId/');
  }

  Future<http.Response> _postWithAuth(
    String path, {
    required Map<String, dynamic> body,
  }) async {
    final accessToken = await _accessToken();
    if (accessToken.isEmpty) {
      throw const EditPropertyException('Session expired. Please log in again.');
    }
    final baseUrls = await _listingBaseUrlsForCurrentDevice();
    Object? lastError;
    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .post(
              Uri.parse('$baseUrl$path'),
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer $accessToken',
              },
              body: jsonEncode(body),
            )
            .timeout(_requestTimeout);
        await _rememberListingBaseUrl(baseUrl);
        return response;
      } catch (error) {
        lastError = '$error on $baseUrl';
      }
    }
    throw EditPropertyException(
      'Request failed. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<void> _deleteWithAuth(String path) async {
    final accessToken = await _accessToken();
    if (accessToken.isEmpty) {
      throw const EditPropertyException('Session expired. Please log in again.');
    }
    final baseUrls = await _listingBaseUrlsForCurrentDevice();
    Object? lastError;
    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .delete(
              Uri.parse('$baseUrl$path'),
              headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer $accessToken',
              },
            )
            .timeout(_requestTimeout);
        if (response.statusCode >= 200 && response.statusCode < 300) {
          await _rememberListingBaseUrl(baseUrl);
          return;
        }
        lastError = _extractErrorMessage(response.body);
      } catch (error) {
        lastError = '$error on $baseUrl';
      }
    }
    throw EditPropertyException(
      'Delete request failed. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<String> _accessToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_accessTokenKey)?.trim() ?? '';
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

  String _extractErrorMessage(String rawBody) {
    try {
      final decoded = jsonDecode(rawBody);
      if (decoded is Map<String, dynamic>) {
        final detail = decoded['detail'];
        if (detail is String && detail.trim().isNotEmpty) {
          return detail.trim();
        }
        for (final value in decoded.values) {
          if (value is String && value.trim().isNotEmpty) {
            return value.trim();
          }
          if (value is List && value.isNotEmpty && value.first is String) {
            return (value.first as String).trim();
          }
        }
      }
    } catch (_) {}
    return 'The server could not update this property.';
  }
}

class EditPropertyException implements Exception {
  const EditPropertyException(this.message);

  final String message;

  @override
  String toString() => message;
}
