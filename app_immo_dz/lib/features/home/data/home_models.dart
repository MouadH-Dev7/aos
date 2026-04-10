import 'package:flutter/material.dart';

import '../../auth/data/auth_models.dart';

class PropertyCardData {
  const PropertyCardData({
    required this.id,
    required this.title,
    required this.location,
    required this.categoryName,
    required this.typeName,
    required this.wilayaName,
    required this.dairaName,
    required this.communeName,
    required this.price,
    required this.imageUrl,
    required this.badge,
    required this.badgeColor,
  });

  final int id;
  final String title;
  final String location;
  final String categoryName;
  final String typeName;
  final String wilayaName;
  final String dairaName;
  final String communeName;
  final String price;
  final String imageUrl;
  final String badge;
  final Color badgeColor;
}

class RecommendedCardData {
  const RecommendedCardData({
    required this.id,
    required this.title,
    required this.location,
    required this.categoryName,
    required this.typeName,
    required this.wilayaName,
    required this.dairaName,
    required this.communeName,
    required this.price,
    required this.imageUrl,
    required this.stats,
  });

  final int id;
  final String title;
  final String location;
  final String categoryName;
  final String typeName;
  final String wilayaName;
  final String dairaName;
  final String communeName;
  final String price;
  final String imageUrl;
  final List<StatItem> stats;
}

class HomeFeedData {
  const HomeFeedData({
    required this.featured,
    required this.recommended,
  });

  final List<PropertyCardData> featured;
  final List<RecommendedCardData> recommended;
}

class PropertyPageData {
  const PropertyPageData({
    required this.items,
    required this.hasNextPage,
  });

  final List<PropertyCardData> items;
  final bool hasNextPage;
}

class StatItem {
  const StatItem({required this.icon, required this.value});

  final IconData icon;
  final String value;
}

class HomeFilterOption {
  const HomeFilterOption({
    required this.id,
    required this.name,
  });

  final int id;
  final String name;
}

class HomeFilterData {
  const HomeFilterData({
    required this.categories,
    required this.types,
    required this.wilayas,
    required this.dairas,
    required this.communes,
  });

  final List<HomeFilterOption> categories;
  final List<HomeFilterOption> types;
  final List<LocationItem> wilayas;
  final List<LocationItem> dairas;
  final List<LocationItem> communes;
}
