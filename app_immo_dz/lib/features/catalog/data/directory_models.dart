class DirectoryEntry {
  const DirectoryEntry({
    required this.id,
    required this.userId,
    required this.companyName,
    required this.ownerName,
    required this.registrationNumber,
    required this.communeId,
    required this.logoUrl,
    required this.description,
  });

  final int id;
  final int userId;
  final String companyName;
  final String ownerName;
  final String registrationNumber;
  final int communeId;
  final String logoUrl;
  final String description;

  String get subtitle {
    if (ownerName.isNotEmpty) return ownerName;
    if (registrationNumber.isNotEmpty) return 'Reg. $registrationNumber';
    return 'Professional account';
  }
}

class DirectoryPageData {
  const DirectoryPageData({
    required this.items,
    required this.hasNextPage,
  });

  final List<DirectoryEntry> items;
  final bool hasNextPage;
}
