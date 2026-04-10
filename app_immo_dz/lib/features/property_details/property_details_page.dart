import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_cached_image.dart';
import 'data/property_details_models.dart';
import 'data/property_details_service.dart';

class PropertyDetailsPage extends StatefulWidget {
  const PropertyDetailsPage({
    super.key,
    required this.propertyId,
  });

  final int propertyId;

  @override
  State<PropertyDetailsPage> createState() => _PropertyDetailsPageState();
}

class _PropertyDetailsPageState extends State<PropertyDetailsPage> {
  late Future<PropertyDetailsData> _detailsFuture;
  final PageController _galleryController = PageController();
  int _activeImageIndex = 0;

  @override
  void initState() {
    super.initState();
    _detailsFuture = PropertyDetailsService().fetchProperty(widget.propertyId);
  }

  Future<void> _reload() async {
    final future = PropertyDetailsService().fetchProperty(widget.propertyId);
    setState(() {
      _detailsFuture = future;
    });
    await future;
  }

  @override
  void dispose() {
    _galleryController.dispose();
    super.dispose();
  }

  Future<void> _goToImage(int index) async {
    await _galleryController.animateToPage(
      index,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
    );
  }

  Future<void> _shareProperty(PropertyDetailsData property) async {
    await Share.share(_buildShareText(property), subject: property.title);
  }

  Future<void> _callPrimaryContact(PropertyDetailsData property) async {
    final contact = _primaryContact(property);
    if (contact == null) {
      _showMessage('No contact number available for this listing.');
      return;
    }

    final phone = _extractPhone(contact.value);
    if (phone == null) {
      _showMessage('The main contact is not a phone number.');
      return;
    }

    await _launchExternal(
      Uri.parse('tel:$phone'),
      failureMessage: 'Could not open the dialer.',
    );
  }

  Future<void> _chatPrimaryContact(PropertyDetailsData property) async {
    final contact = _primaryContact(property);
    if (contact == null) {
      _showMessage('No contact available for messaging.');
      return;
    }

    final value = contact.value.trim();
    if (_looksLikeEmail(value)) {
      await _launchExternal(
        Uri(
          scheme: 'mailto',
          path: value,
          queryParameters: {
            'subject': 'Inquiry about ${property.title}',
          },
        ),
        failureMessage: 'Could not open your mail app.',
      );
      return;
    }

    final phone = _extractPhone(value);
    if (phone == null) {
      _showMessage('This contact does not support chat.');
      return;
    }

    final whatsappUri = Uri.parse(
      'https://wa.me/$phone?text=${Uri.encodeComponent('Hello, I am interested in ${property.title}.')}',
    );
    if (await canLaunchUrl(whatsappUri)) {
      await launchUrl(whatsappUri, mode: LaunchMode.externalApplication);
      return;
    }

    await _launchExternal(
      Uri(
        scheme: 'sms',
        path: phone,
        queryParameters: {
          'body': 'Hello, I am interested in ${property.title}.',
        },
      ),
      failureMessage: 'Could not open chat or SMS.',
    );
  }

  Future<void> _openInMaps(PropertyDetailsData property) async {
    final lat = property.latitude;
    final lng = property.longitude;

    if (lat == null || lng == null) {
      _showMessage('This property has no map coordinates.');
      return;
    }

    final candidates = [
      Uri.parse('google.navigation:q=$lat,$lng&mode=d'),
      Uri.parse('geo:$lat,$lng?q=$lat,$lng'),
      Uri.parse(
        'https://www.google.com/maps/dir/?api=1&destination=$lat,$lng&travelmode=driving',
      ),
    ];

    for (final uri in candidates) {
      try {
        final launched = await launchUrl(
          uri,
          mode: LaunchMode.externalApplication,
        );
        if (launched) {
          return;
        }
      } catch (_) {
        continue;
      }
    }

    _showMessage('Could not open Google Maps.');
  }

  Future<void> _launchExternal(
    Uri uri, {
    required String failureMessage,
  }) async {
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
      return;
    }
    _showMessage(failureMessage);
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: FutureBuilder<PropertyDetailsData>(
        future: _detailsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting &&
              !snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return _PropertyErrorState(
              message: '${snapshot.error}',
              onRetry: _reload,
            );
          }

          final property = snapshot.data;
          if (property == null) {
            return _PropertyErrorState(
              message: 'Property not found.',
              onRetry: _reload,
            );
          }

          final images = property.images.isNotEmpty
              ? property.images
              : const [
                  PropertyImageData(
                    id: 0,
                    imageUrl: '',
                    position: 0,
                  ),
                ];

          return Stack(
            children: [
              RefreshIndicator(
                onRefresh: _reload,
                child: CustomScrollView(
                  physics: const BouncingScrollPhysics(
                    parent: AlwaysScrollableScrollPhysics(),
                  ),
                  slivers: [
                    SliverToBoxAdapter(
                      child: _HeroGallery(
                        images: images,
                        controller: _galleryController,
                        activeIndex: _activeImageIndex,
                        onPageChanged: (value) {
                          setState(() => _activeImageIndex = value);
                        },
                      ),
                    ),
                    SliverToBoxAdapter(
                      child: Transform.translate(
                        offset: const Offset(0, -28),
                        child: Container(
                          decoration: const BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.vertical(
                              top: Radius.circular(34),
                            ),
                          ),
                          padding: const EdgeInsets.fromLTRB(20, 20, 20, 164),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _GalleryThumbnails(
                                images: images,
                                activeIndex: _activeImageIndex,
                                onTap: _goToImage,
                              ),
                              const SizedBox(height: 20),
                              _TitleSection(property: property),
                              const SizedBox(height: 28),
                              _StatsGrid(property: property),
                              const SizedBox(height: 18),
                              _QuickActionRow(
                                onCall: () => _callPrimaryContact(property),
                                onChat: () => _chatPrimaryContact(property),
                                onShare: () => _shareProperty(property),
                              ),
                              const SizedBox(height: 18),
                              _SectionCard(
                                title: 'About this Residence',
                                child: Text(
                                  property.description.isEmpty
                                      ? 'No description available for this listing.'
                                      : property.description,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(
                                        color: AppColors.onSurfaceVariant,
                                        height: 1.65,
                                      ),
                                ),
                              ),
                              const SizedBox(height: 18),
                              _AmenitiesSection(property: property),
                              const SizedBox(height: 18),
                              _LocationSection(
                                property: property,
                                onOpenMaps: () => _openInMaps(property),
                              ),
                              const SizedBox(height: 18),
                              _DocumentsSection(property: property),
                              const SizedBox(height: 18),
                              _ContactsSection(
                                property: property,
                                onCall: () => _callPrimaryContact(property),
                                onChat: () => _chatPrimaryContact(property),
                                onCopy: () async {
                                  final contact = _primaryContact(property);
                                  if (contact == null) {
                                    _showMessage('No contact to copy.');
                                    return;
                                  }
                                  await Clipboard.setData(
                                    ClipboardData(text: contact.value),
                                  );
                                  _showMessage('Contact copied.');
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              _TopBar(
                onBack: () => Navigator.of(context).pop(),
                onShare: () => _shareProperty(property),
              ),
              _StickyCta(
                onCall: () => _callPrimaryContact(property),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.onBack,
    required this.onShare,
  });

  final VoidCallback onBack;
  final VoidCallback onShare;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
        child: Row(
          children: [
            _TopButton(icon: Icons.arrow_back_rounded, onTap: onBack),
            const Spacer(),
            _TopButton(icon: Icons.ios_share_rounded, onTap: onShare),
          ],
        ),
      ),
    );
  }
}

class _TopButton extends StatelessWidget {
  const _TopButton({
    required this.icon,
    required this.onTap,
  });

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white.withValues(alpha: 0.88),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: SizedBox(
          width: 46,
          height: 46,
          child: Icon(icon, color: AppColors.onSurface),
        ),
      ),
    );
  }
}

class _HeroGallery extends StatelessWidget {
  const _HeroGallery({
    required this.images,
    required this.controller,
    required this.activeIndex,
    required this.onPageChanged,
  });

  final List<PropertyImageData> images;
  final PageController controller;
  final int activeIndex;
  final ValueChanged<int> onPageChanged;

  @override
  Widget build(BuildContext context) {
    final height = MediaQuery.of(context).size.width * 1.12;

    return SizedBox(
      height: height.clamp(320.0, 470.0),
      child: Stack(
        children: [
          PageView.builder(
            controller: controller,
            itemCount: images.length,
            onPageChanged: onPageChanged,
            itemBuilder: (context, index) {
              return _GalleryImage(imageUrl: images[index].imageUrl);
            },
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 24,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(images.length, (index) {
                final active = index == activeIndex;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: active ? 18 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: active
                        ? Colors.white
                        : Colors.white.withValues(alpha: 0.42),
                    borderRadius: BorderRadius.circular(999),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

class _GalleryThumbnails extends StatelessWidget {
  const _GalleryThumbnails({
    required this.images,
    required this.activeIndex,
    required this.onTap,
  });

  final List<PropertyImageData> images;
  final int activeIndex;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 76,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: images.length,
        separatorBuilder: (_, _) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final image = images[index];
          final isActive = index == activeIndex;

          return GestureDetector(
            onTap: () => onTap(index),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: 76,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isActive ? AppColors.primary : Colors.transparent,
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isActive ? 0.08 : 0.03),
                    blurRadius: isActive ? 16 : 10,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: _GalleryImage(imageUrl: image.imageUrl),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _GalleryImage extends StatelessWidget {
  const _GalleryImage({required this.imageUrl});

  final String imageUrl;

  @override
  Widget build(BuildContext context) {
    if (imageUrl.isEmpty) {
      return Container(
        color: const Color(0xFFE8EEF8),
        alignment: Alignment.center,
        child: const Icon(
          Icons.image_outlined,
          size: 42,
          color: AppColors.outline,
        ),
      );
    }

    return AppCachedImage(
      imageUrl: imageUrl,
      fit: BoxFit.cover,
    );
  }
}

class _TitleSection extends StatelessWidget {
  const _TitleSection({required this.property});

  final PropertyDetailsData property;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _prettyTitle(property.title),
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.8,
                          height: 1.05,
                        ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(top: 1),
                        child: Icon(
                          Icons.location_on_rounded,
                          size: 16,
                          color: AppColors.outline,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          _buildPropertySubtitle(property),
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: AppColors.onSurfaceVariant,
                                  ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  _formatPrice(property.price),
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.7,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatDate(property.createdAt),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.onSurfaceVariant,
                      ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.property});

  final PropertyDetailsData property;

  @override
  Widget build(BuildContext context) {
    final items = [
      _StatData(
        icon: Icons.square_foot_rounded,
        value: '${property.area}m2',
        label: 'Living Area',
      ),
      _StatData(
        icon: Icons.bed_rounded,
        value: '${property.bedrooms} Beds',
        label: 'Bedrooms',
      ),
      _StatData(
        icon: Icons.bathtub_outlined,
        value: '${property.bathrooms} Baths',
        label: 'Bathrooms',
      ),
    ];

    return Row(
      children: items.map((item) {
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(
              right: item == items.last ? 0 : 10,
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFF2F5FA),
                borderRadius: BorderRadius.circular(22),
              ),
              child: Column(
                children: [
                  Icon(item.icon, color: AppColors.primary),
                  const SizedBox(height: 8),
                  Text(
                    item.value,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.label,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: AppColors.onSurfaceVariant,
                          letterSpacing: 0.8,
                        ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _QuickActionRow extends StatelessWidget {
  const _QuickActionRow({
    required this.onCall,
    required this.onChat,
    required this.onShare,
  });

  final VoidCallback onCall;
  final VoidCallback onChat;
  final VoidCallback onShare;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ActionChip(
            icon: Icons.call_rounded,
            label: 'Call',
            onTap: onCall,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _ActionChip(
            icon: Icons.chat_bubble_rounded,
            label: 'Chat',
            onTap: onChat,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _ActionChip(
            icon: Icons.ios_share_rounded,
            label: 'Share',
            onTap: onShare,
          ),
        ),
      ],
    );
  }
}

class _ActionChip extends StatelessWidget {
  const _ActionChip({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          height: 54,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.outlineVariant),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 18, color: AppColors.primary),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({
    required this.title,
    required this.child,
  });

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(26),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class _AmenitiesSection extends StatelessWidget {
  const _AmenitiesSection({required this.property});

  final PropertyDetailsData property;

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Premium Amenities',
      child: property.amenities.isEmpty
          ? Text(
              'No amenities listed.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.onSurfaceVariant,
                  ),
            )
          : Wrap(
              spacing: 12,
              runSpacing: 12,
              children: property.amenities.map((amenity) {
                return Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F7FB),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.check_circle_rounded,
                        size: 18,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        amenity.name,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
    );
  }
}

class _LocationSection extends StatelessWidget {
  const _LocationSection({
    required this.property,
    required this.onOpenMaps,
  });

  final PropertyDetailsData property;
  final VoidCallback onOpenMaps;

  @override
  Widget build(BuildContext context) {
    final lat = property.latitude;
    final lng = property.longitude;

    return _SectionCard(
      title: 'Location',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (lat != null && lng != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(22),
              child: SizedBox(
                height: 220,
                child: FlutterMap(
                  options: MapOptions(
                    initialCenter: LatLng(lat, lng),
                    initialZoom: 14.5,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate:
                          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'app_immo_dz',
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: LatLng(lat, lng),
                          width: 56,
                          height: 56,
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(999),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(alpha: 0.28),
                                  blurRadius: 16,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.location_on_rounded,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            )
          else
            Container(
              height: 160,
              decoration: BoxDecoration(
                color: const Color(0xFFF5F7FB),
                borderRadius: BorderRadius.circular(22),
              ),
              alignment: Alignment.center,
              child: Text(
                'Map coordinates are not available.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.onSurfaceVariant,
                    ),
              ),
            ),
          const SizedBox(height: 14),
          Text(
            _buildPropertySubtitle(property),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.onSurfaceVariant,
                ),
          ),
          if (lat != null && lng != null) ...[
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: onOpenMaps,
                icon: const Icon(Icons.directions_rounded),
                label: const Text('Open Directions'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _DocumentsSection extends StatelessWidget {
  const _DocumentsSection({required this.property});

  final PropertyDetailsData property;

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Documents',
      child: property.documents.isEmpty
          ? Text(
              'No documents attached.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.onSurfaceVariant,
                  ),
            )
          : Column(
              children: property.documents.map((document) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F7FB),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.description_outlined,
                        color: AppColors.primary,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              document.documentTypeName,
                              style:
                                  Theme.of(context).textTheme.bodyMedium?.copyWith(
                                        fontWeight: FontWeight.w700,
                                      ),
                            ),
                            if (document.name.isNotEmpty) ...[
                              const SizedBox(height: 3),
                              Text(
                                document.name,
                                style: Theme.of(context)
                                    .textTheme
                                    .bodySmall
                                    ?.copyWith(
                                      color: AppColors.onSurfaceVariant,
                                    ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
    );
  }
}

class _ContactsSection extends StatelessWidget {
  const _ContactsSection({
    required this.property,
    required this.onCall,
    required this.onChat,
    required this.onCopy,
  });

  final PropertyDetailsData property;
  final VoidCallback onCall;
  final VoidCallback onChat;
  final VoidCallback onCopy;

  @override
  Widget build(BuildContext context) {
    return _SectionCard(
      title: 'Agent & Contact',
      child: property.contacts.isEmpty
          ? Text(
              'No contacts listed.',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.onSurfaceVariant,
                  ),
            )
          : Column(
              children: [
                ...property.contacts.map((contact) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F7FB),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 46,
                          height: 46,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Icon(
                            _contactIcon(contact),
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      contact.contactTypeName,
                                      style: Theme.of(context)
                                          .textTheme
                                          .bodySmall
                                          ?.copyWith(
                                            color: AppColors.onSurfaceVariant,
                                          ),
                                    ),
                                  ),
                                  if (contact.isPrimary)
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withValues(
                                          alpha: 0.12,
                                        ),
                                        borderRadius: BorderRadius.circular(999),
                                      ),
                                      child: Text(
                                        'Primary',
                                        style: Theme.of(context)
                                            .textTheme
                                            .labelSmall
                                            ?.copyWith(
                                              color: AppColors.primary,
                                              fontWeight: FontWeight.w800,
                                            ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                contact.value,
                                style:
                                    Theme.of(context).textTheme.bodyLarge?.copyWith(
                                          fontWeight: FontWeight.w700,
                                        ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onCall,
                        icon: const Icon(Icons.call_rounded),
                        label: const Text('Call'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: onChat,
                        icon: const Icon(Icons.chat_bubble_rounded),
                        label: const Text('Chat'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    SizedBox(
                      width: 54,
                      height: 54,
                      child: OutlinedButton(
                        onPressed: onCopy,
                        style: OutlinedButton.styleFrom(
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: const Icon(Icons.copy_rounded),
                      ),
                    ),
                  ],
                ),
              ],
            ),
    );
  }
}

class _StickyCta extends StatelessWidget {
  const _StickyCta({
    required this.onCall,
  });

  final VoidCallback onCall;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: 20,
      right: 20,
      bottom: 20,
      child: SafeArea(
        top: false,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.92),
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 18,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: onCall,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    minimumSize: const Size.fromHeight(54),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  child: const Text('Call This Agent'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PropertyErrorState extends StatelessWidget {
  const _PropertyErrorState({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onRetry,
              child: const Text('Try again'),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatData {
  const _StatData({
    required this.icon,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final String value;
  final String label;
}

PropertyContactData? _primaryContact(PropertyDetailsData property) {
  if (property.contacts.isEmpty) return null;
  for (final contact in property.contacts) {
    if (contact.isPrimary) return contact;
  }
  return property.contacts.first;
}

IconData _contactIcon(PropertyContactData contact) {
  final value = contact.value.trim().toLowerCase();
  final type = contact.contactTypeName.trim().toLowerCase();

  if (_looksLikeEmail(value) || type.contains('mail')) {
    return Icons.mail_outline_rounded;
  }
  if (type.contains('whatsapp')) {
    return Icons.chat_rounded;
  }
  return Icons.call_outlined;
}

String? _extractPhone(String value) {
  final normalized = value.replaceAll(RegExp(r'[^0-9+]'), '');
  if (normalized.isEmpty) return null;
  final digitsOnly = normalized.replaceAll('+', '');
  if (digitsOnly.length < 8) return null;
  return digitsOnly;
}

bool _looksLikeEmail(String value) {
  return value.contains('@') && value.contains('.');
}

String _prettyTitle(String value) {
  final cleaned = value.trim().replaceAll(RegExp(r'\s+'), ' ');
  if (cleaned.isEmpty) return 'Exceptional Property';
  return cleaned;
}

String _buildPropertySubtitle(PropertyDetailsData property) {
  final parts = <String>[
    property.categoryName.trim(),
    property.typeName.trim(),
  ].where((part) => part.isNotEmpty).toList();

  if (parts.isEmpty) return 'Premium property';
  return parts.join(' · ');
}

String _buildShareText(PropertyDetailsData property) {
  final buffer = StringBuffer()
    ..writeln(_prettyTitle(property.title))
    ..writeln(_formatPrice(property.price))
    ..writeln(_buildPropertySubtitle(property));

  if (property.description.isNotEmpty) {
    buffer.writeln();
    buffer.writeln(property.description);
  }

  if (property.latitude != null && property.longitude != null) {
    buffer.writeln();
    buffer.writeln(
      'Map: https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}',
    );
  }

  return buffer.toString().trim();
}

String _formatPrice(double? value) {
  if (value == null) return 'Price unavailable';
  final formatter = NumberFormat.decimalPattern('fr_FR');
  return '${formatter.format(value.round())} DZD';
}

String _formatDate(DateTime? value) {
  if (value == null) return 'Recently listed';
  return DateFormat('dd/MM/yyyy').format(value);
}
