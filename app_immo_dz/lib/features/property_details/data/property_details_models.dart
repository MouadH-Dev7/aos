class PropertyDetailsData {
  const PropertyDetailsData({
    required this.id,
    required this.title,
    required this.categoryName,
    required this.typeName,
    required this.statusName,
    required this.description,
    required this.price,
    required this.area,
    required this.bedrooms,
    required this.bathrooms,
    required this.communeId,
    required this.latitude,
    required this.longitude,
    required this.images,
    required this.amenities,
    required this.documents,
    required this.contacts,
    required this.createdAt,
  });

  final int id;
  final String title;
  final String categoryName;
  final String typeName;
  final String statusName;
  final String description;
  final double? price;
  final int area;
  final int bedrooms;
  final int bathrooms;
  final int communeId;
  final double? latitude;
  final double? longitude;
  final List<PropertyImageData> images;
  final List<PropertyAmenityData> amenities;
  final List<PropertyDocumentData> documents;
  final List<PropertyContactData> contacts;
  final DateTime? createdAt;

  String get mainImageUrl => images.isNotEmpty ? images.first.imageUrl : '';
}

class PropertyImageData {
  const PropertyImageData({
    required this.id,
    required this.imageUrl,
    required this.position,
  });

  final int id;
  final String imageUrl;
  final int position;
}

class PropertyAmenityData {
  const PropertyAmenityData({
    required this.id,
    required this.name,
  });

  final int id;
  final String name;
}

class PropertyDocumentData {
  const PropertyDocumentData({
    required this.id,
    required this.documentTypeName,
    required this.name,
  });

  final int id;
  final String documentTypeName;
  final String name;
}

class PropertyContactData {
  const PropertyContactData({
    required this.id,
    required this.contactTypeName,
    required this.value,
    required this.isPrimary,
  });

  final int id;
  final String contactTypeName;
  final String value;
  final bool isPrimary;
}
