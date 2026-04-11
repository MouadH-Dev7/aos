import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../auth/data/auth_models.dart';
import '../../auth/data/auth_service.dart';
import '../../../core/theme/app_colors.dart';
import 'home_models.dart';

class HomeService {
  HomeService({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  static const Duration _requestTimeout = Duration(seconds: 5);
  static const _preferredBaseUrlKey = 'auth.preferred_base_url';

  static const _listingBaseUrls = [
    String.fromEnvironment('LISTING_BASE_URL'),
    'https://listing-service-9ma6.onrender.com',
  ];

  Future<HomeFeedData> fetchHomeFeed({int pageSize = 10}) async {
    Object? lastError;
    final baseUrls = await _listingBaseUrlsForCurrentDevice();
    final locationBundle = await _fetchLocationBundle();

    for (final baseUrl in baseUrls) {
      try {
        final response = await _client
            .get(
              Uri.parse('$baseUrl/properties/list/?page=1&page_size=$pageSize'),
              headers: const {'Accept': 'application/json'},
            )
            .timeout(_requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          final items = _extractItems(response.body);

          await _rememberListingBaseUrl(baseUrl);
          return _mapFeed(items, locationBundle);
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

    throw HomeFeedException(
      'Unable to load listings from API. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<HomeFilterData> fetchFilterData() async {
    Object? lastError;
    final baseUrls = await _listingBaseUrlsForCurrentDevice();

    for (final baseUrl in baseUrls) {
      try {
        final responses = await Future.wait([
          _getJsonList('$baseUrl/categories/'),
          _getJsonList('$baseUrl/types/'),
          AuthService().fetchWilayas(),
          AuthService().fetchDairas(),
          AuthService().fetchCommunes(),
        ]);

        await _rememberListingBaseUrl(baseUrl);
        return HomeFilterData(
          categories: _mapFilterItems(
            responses[0] as List<Map<String, dynamic>>,
          ),
          types: _mapFilterItems(
            responses[1] as List<Map<String, dynamic>>,
          ),
          wilayas: responses[2] as List<LocationItem>,
          dairas: responses[3] as List<LocationItem>,
          communes: responses[4] as List<LocationItem>,
        );
      } catch (error) {
        lastError = '$error on $baseUrl';
      }
    }

    throw HomeFeedException(
      'Unable to load filter data. Last error: ${lastError ?? "unknown"}',
    );
  }

  Future<PropertyPageData> fetchListingsPage({
    required int page,
    int pageSize = 10,
    String search = '',
  }) async {
    Object? lastError;
    final baseUrls = await _listingBaseUrlsForCurrentDevice();
    final locationBundle = await _fetchLocationBundle();

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
              Uri.parse('$baseUrl/properties/list/')
                  .replace(queryParameters: queryParameters),
              headers: const {'Accept': 'application/json'},
            )
            .timeout(_requestTimeout);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          final decoded = jsonDecode(response.body);
          final items = _extractItemsFromDecoded(decoded);
          await _rememberListingBaseUrl(baseUrl);
          return PropertyPageData(
            items: items
                .map((item) => _toFeaturedCard(item, locationBundle))
                .toList(),
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

    throw HomeFeedException(
      'Unable to load listings page. Last error: ${lastError ?? "unknown"}',
    );
  }

  HomeFeedData _mapFeed(
    List<Map<String, dynamic>> items,
    _LocationBundle locationBundle,
  ) {
    final active = items.where((item) {
      final status = (item['status_name'] as String? ?? '').toLowerCase();
      return status == 'active' || status == 'approved';
    }).toList();

    final source = active.isNotEmpty ? active : items;
    final featuredSource = source.take(2).toList();
    final recommendedSource = source.skip(featuredSource.length).toList();
    final recommendedItems =
        (recommendedSource.isNotEmpty ? recommendedSource : source).take(8);

    return HomeFeedData(
      featured: featuredSource
          .map((item) => _toFeaturedCard(item, locationBundle))
          .toList(),
      recommended: recommendedItems
          .map((item) => _toRecommendedCard(item, locationBundle))
          .toList(),
    );
  }

  List<Map<String, dynamic>> _extractItems(String rawBody) {
    final decoded = jsonDecode(rawBody);
    return _extractItemsFromDecoded(decoded);
  }

  List<Map<String, dynamic>> _extractItemsFromDecoded(Object? decoded) {
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

    throw const FormatException('Expected listing array');
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

  PropertyCardData _toFeaturedCard(
    Map<String, dynamic> item,
    _LocationBundle locationBundle,
  ) {
    final status = (item['status_name'] as String? ?? '').trim();
    final location = _resolveLocation(item, locationBundle);
    return PropertyCardData(
      id: _asInt(item['id']),
      title: _asText(item['title'], fallback: 'Untitled property'),
      location: _locationLine(item),
      categoryName: _asText(item['category_name']),
      typeName: _asText(item['type_name']),
      wilayaName: location.wilayaName,
      dairaName: location.dairaName,
      communeName: location.communeName,
      price: _formatPrice(item['price']),
      imageUrl: _imageUrl(item),
      badge: status.isEmpty ? 'Listing' : status,
      badgeColor: _badgeColor(status),
    );
  }

  RecommendedCardData _toRecommendedCard(
    Map<String, dynamic> item,
    _LocationBundle locationBundle,
  ) {
    final location = _resolveLocation(item, locationBundle);
    return RecommendedCardData(
      id: _asInt(item['id']),
      title: _asText(item['title'], fallback: 'Untitled property'),
      location: _locationLine(item),
      categoryName: _asText(item['category_name']),
      typeName: _asText(item['type_name']),
      wilayaName: location.wilayaName,
      dairaName: location.dairaName,
      communeName: location.communeName,
      price: _formatPrice(item['price']),
      imageUrl: _imageUrl(item),
      stats: _stats(item),
    );
  }

  Future<List<Map<String, dynamic>>> _getJsonList(String url) async {
    final response = await _client
        .get(
          Uri.parse(url),
          headers: const {'Accept': 'application/json'},
        )
        .timeout(_requestTimeout);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw HomeFeedException('HTTP ${response.statusCode} for $url');
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

  List<HomeFilterOption> _mapFilterItems(List<Map<String, dynamic>> items) {
    return items
        .map(
          (item) => HomeFilterOption(
            id: _asInt(item['id']),
            name: _asText(
              item['name'] ?? item['name_en'] ?? item['name_ar'],
            ),
          ),
        )
        .where((item) => item.id > 0 && item.name.isNotEmpty)
        .toList();
  }

  List<StatItem> _stats(Map<String, dynamic> item) {
    return [
      StatItem(
        icon: Icons.bed_rounded,
        value: '${_asInt(item['bedrooms'])} beds',
      ),
      StatItem(
        icon: Icons.bathtub_outlined,
        value: '${_asInt(item['bathrooms'])} baths',
      ),
      StatItem(
        icon: Icons.square_foot_rounded,
        value: '${_asInt(item['area'])} m2',
      ),
    ];
  }

  String _locationLine(Map<String, dynamic> item) {
    final category = _asText(item['category_name']);
    final type = _asText(item['type_name']);
    final parts = [category, type].where((value) => value.isNotEmpty).toList();
    return parts.isEmpty ? 'Algeria' : parts.join(' | ');
  }

  Future<_LocationBundle> _fetchLocationBundle() async {
    final authService = AuthService();
    final responses = await Future.wait([
      authService.fetchWilayas(),
      authService.fetchDairas(),
      authService.fetchCommunes(),
    ]);
    return _LocationBundle(
      wilayas: responses[0],
      dairas: responses[1],
      communes: responses[2],
    );
  }

  _ResolvedLocation _resolveLocation(
    Map<String, dynamic> item,
    _LocationBundle bundle,
  ) {
    final explicitWilaya = _asText(item['wilaya_name']);
    final explicitDaira = _asText(item['daira_name']);
    final explicitCommune = _asText(item['commune_name']);
    if (explicitWilaya.isNotEmpty ||
        explicitDaira.isNotEmpty ||
        explicitCommune.isNotEmpty) {
      return _ResolvedLocation(
        wilayaName: explicitWilaya,
        dairaName: explicitDaira,
        communeName: explicitCommune,
      );
    }

    final communeId = _asInt(item['commune_id']);
    LocationItem? commune;
    for (final current in bundle.communes) {
      if (current.id == communeId) {
        commune = current;
        break;
      }
    }

    LocationItem? daira;
    final dairaId = commune?.dairaId;
    if (dairaId != null) {
      for (final current in bundle.dairas) {
        if (current.id == dairaId) {
          daira = current;
          break;
        }
      }
    }

    LocationItem? wilaya;
    final wilayaId = daira?.wilayaId ?? commune?.wilayaId;
    if (wilayaId != null) {
      for (final current in bundle.wilayas) {
        if (current.id == wilayaId) {
          wilaya = current;
          break;
        }
      }
    }

    return _ResolvedLocation(
      wilayaName: wilaya?.name ?? '',
      dairaName: daira?.name ?? '',
      communeName: commune?.name ?? '',
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

  String _formatPrice(Object? value) {
    final amount = value is num ? value.toDouble() : double.tryParse('$value');
    if (amount == null) return 'Price unavailable';
    return '${amount.toStringAsFixed(0)} DZD';
  }

  String _asText(Object? value, {String fallback = ''}) {
    final text = (value as String? ?? '').trim();
    return text.isEmpty ? fallback : text;
  }

  int _asInt(Object? value) {
    if (value is int) return value;
    if (value is num) return value.round();
    return int.tryParse('$value') ?? 0;
  }

  Color _badgeColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return AppColors.primary;
      case 'approved':
        return const Color(0xFF0F766E);
      case 'pending':
        return const Color(0xFFB45309);
      default:
        return AppColors.primary;
    }
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

class HomeFeedException implements Exception {
  const HomeFeedException(this.message);

  final String message;

  @override
  String toString() => message;
}

class _LocationBundle {
  const _LocationBundle({
    required this.wilayas,
    required this.dairas,
    required this.communes,
  });

  final List<LocationItem> wilayas;
  final List<LocationItem> dairas;
  final List<LocationItem> communes;
}

class _ResolvedLocation {
  const _ResolvedLocation({
    required this.wilayaName,
    required this.dairaName,
    required this.communeName,
  });

  final String wilayaName;
  final String dairaName;
  final String communeName;
}
