import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_cached_image.dart';
import '../property_details/property_details_page.dart';
import 'data/directory_detail_service.dart';
import 'data/directory_models.dart';

enum DirectoryProfileType { agency, promoter }

class DirectoryDetailPage extends StatefulWidget {
  const DirectoryDetailPage({
    super.key,
    required this.entry,
    required this.type,
  });

  final DirectoryEntry entry;
  final DirectoryProfileType type;

  @override
  State<DirectoryDetailPage> createState() => _DirectoryDetailPageState();
}

class _DirectoryDetailPageState extends State<DirectoryDetailPage> {
  late Future<DirectoryDetailBundle> _future;

  bool get _isAgency => widget.type == DirectoryProfileType.agency;

  @override
  void initState() {
    super.initState();
    _future = DirectoryDetailService().fetchBundle(widget.entry);
  }

  Future<void> _reload() async {
    final future = DirectoryDetailService().fetchBundle(widget.entry);
    setState(() => _future = future);
    await future;
  }

  @override
  Widget build(BuildContext context) {
    final accent = _isAgency ? const Color(0xFF2563EB) : const Color(0xFF943700);
    final soft = _isAgency ? const Color(0xFFDCE8FF) : const Color(0xFFFFE2D3);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      body: FutureBuilder<DirectoryDetailBundle>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting &&
              !snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return _ErrorState(message: '${snapshot.error}', onRetry: _reload);
          }

          final bundle = snapshot.data;
          if (bundle == null) {
            return _ErrorState(
              message: 'Profile details are unavailable.',
              onRetry: _reload,
            );
          }

          return RefreshIndicator(
            onRefresh: _reload,
            child: CustomScrollView(
              physics: const BouncingScrollPhysics(
                parent: AlwaysScrollableScrollPhysics(),
              ),
              slivers: [
                SliverAppBar(
                  pinned: true,
                  backgroundColor: Colors.white.withValues(alpha: 0.94),
                  elevation: 0,
                  surfaceTintColor: Colors.transparent,
                  leading: IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.arrow_back_rounded, color: AppColors.primary),
                  ),
                  title: const SizedBox.shrink(),
                ),
                SliverToBoxAdapter(
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(20, 24, 20, 28),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [soft, Colors.white],
                      ),
                      borderRadius: const BorderRadius.vertical(
                        bottom: Radius.circular(32),
                      ),
                    ),
                    child: Column(
                      children: [
                        _LogoBox(
                          url: widget.entry.logoUrl,
                          accent: accent,
                          icon: _isAgency
                              ? Icons.real_estate_agent_rounded
                              : Icons.domain_rounded,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          widget.entry.companyName,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          widget.entry.description.isNotEmpty
                              ? widget.entry.description
                              : 'No description provided.',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColors.onSurfaceVariant,
                                height: 1.55,
                              ),
                        ),
                        const SizedBox(height: 18),
                        LayoutBuilder(
                          builder: (context, constraints) {
                            final itemWidth = (constraints.maxWidth - 24) / 3;
                            return Wrap(
                              spacing: 12,
                              runSpacing: 12,
                              children: [
                                SizedBox(
                                  width: itemWidth,
                                  child: _MiniStat(
                                    label: 'Wilaya',
                                    value: bundle.wilayaName.isNotEmpty
                                        ? bundle.wilayaName
                                        : 'Unknown',
                                    accent: accent,
                                  ),
                                ),
                                SizedBox(
                                  width: itemWidth,
                                  child: _MiniStat(
                                    label: 'Commune',
                                    value: bundle.communeName.isNotEmpty
                                        ? bundle.communeName
                                        : 'Unknown',
                                    accent: accent,
                                  ),
                                ),
                                SizedBox(
                                  width: itemWidth,
                                  child: _MiniStat(
                                    label: 'Listings',
                                    value: '${bundle.listings.length}',
                                    accent: accent,
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
                    child: Row(
                      children: [
                        Expanded(
                          child: _ActionBtn(
                            label: 'Call',
                            icon: Icons.call_rounded,
                            filled: true,
                            accent: accent,
                            onPressed: () => _call(bundle),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _ActionBtn(
                            label: 'Email',
                            icon: Icons.mail_rounded,
                            filled: false,
                            accent: accent,
                            onPressed: () => _email(bundle),
                          ),
                        ),
                        const SizedBox(width: 12),
                        _CircleAction(
                          icon: Icons.chat_bubble_rounded,
                          accent: accent,
                          onPressed: () => _chat(bundle),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                    child: _InfoCard(
                      title: _isAgency ? 'Agency Information' : 'Promoter Information',
                      child: Column(
                        children: [
                          _InfoRow(label: 'Owner', value: widget.entry.ownerName),
                          _InfoRow(label: 'Wilaya', value: bundle.wilayaName),
                          _InfoRow(label: 'Commune', value: bundle.communeName),
                          _InfoRow(
                            label: 'Registration',
                            value: widget.entry.registrationNumber,
                            isLast: true,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 28, 20, 14),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            _isAgency ? 'Linked Listings' : 'Promoter Listings',
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.w800,
                                ),
                          ),
                        ),
                        Text(
                          '${bundle.listings.length} total',
                          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                                color: accent,
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (bundle.listings.isEmpty)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 28),
                      child: _InfoCard(
                        title: 'No listings',
                        child: Text(
                          'No linked listings are available for this profile.',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColors.onSurfaceVariant,
                              ),
                        ),
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 28),
                    sliver: SliverList.separated(
                      itemCount: bundle.listings.length,
                      separatorBuilder: (context, index) => const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        final listing = bundle.listings[index];
                        return _ListingCard(
                          listing: listing,
                          accent: accent,
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute<void>(
                                builder: (_) => PropertyDetailsPage(propertyId: listing.id),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  DirectoryListingContact? _primaryContact(DirectoryDetailBundle bundle) {
    for (final listing in bundle.listings) {
      for (final contact in listing.contacts) {
        if (contact.isPrimary) return contact;
      }
    }
    for (final listing in bundle.listings) {
      if (listing.contacts.isNotEmpty) return listing.contacts.first;
    }
    return null;
  }

  Future<void> _call(DirectoryDetailBundle bundle) async {
    final contact = _primaryContact(bundle);
    final phone = contact == null ? null : _extractPhone(contact.value);
    if (phone == null) {
      _showSnack('No phone contact found.');
      return;
    }
    await _launch(Uri.parse('tel:$phone'), 'Could not open the dialer.');
  }

  Future<void> _email(DirectoryDetailBundle bundle) async {
    for (final listing in bundle.listings) {
      for (final contact in listing.contacts) {
        if (_looksLikeEmail(contact.value)) {
          await _launch(
            Uri(
              scheme: 'mailto',
              path: contact.value.trim(),
              queryParameters: {'subject': 'Inquiry about ${widget.entry.companyName}'},
            ),
            'Could not open the mail app.',
          );
          return;
        }
      }
    }
    _showSnack('No email contact found.');
  }

  Future<void> _chat(DirectoryDetailBundle bundle) async {
    final contact = _primaryContact(bundle);
    final phone = contact == null ? null : _extractPhone(contact.value);
    if (phone == null) {
      _showSnack('No chat contact found.');
      return;
    }
    final whatsapp = Uri.parse(
      'https://wa.me/$phone?text=${Uri.encodeComponent('Hello, I am interested in ${widget.entry.companyName}.')}',
    );
    if (await canLaunchUrl(whatsapp)) {
      await launchUrl(whatsapp, mode: LaunchMode.externalApplication);
      return;
    }
    await _launch(
      Uri(
        scheme: 'sms',
        path: phone,
        queryParameters: {'body': 'Hello, I am interested in ${widget.entry.companyName}.'},
      ),
      'Could not open chat or SMS.',
    );
  }

  Future<void> _launch(Uri uri, String failureMessage) async {
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
      return;
    }
    _showSnack(failureMessage);
  }

  void _showSnack(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }
}

class _LogoBox extends StatelessWidget {
  const _LogoBox({
    required this.url,
    required this.accent,
    required this.icon,
  });

  final String url;
  final Color accent;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          width: 96,
          height: 96,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
          ),
          child: url.isEmpty
              ? Icon(icon, color: accent, size: 40)
              : ClipRRect(
                  borderRadius: BorderRadius.circular(28),
                  child: AppCachedImage(
                    imageUrl: url,
                    fit: BoxFit.cover,
                    placeholderIcon: icon,
                  ),
                ),
        ),
        Positioned(
          right: -2,
          bottom: -6,
          child: Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: accent,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 4),
            ),
            child: const Icon(Icons.verified_rounded, color: Colors.white, size: 16),
          ),
        ),
      ],
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({
    required this.label,
    required this.value,
    required this.accent,
  });

  final String label;
  final String value;
  final Color accent;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 92),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            value.isEmpty ? 'Unknown' : value,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: accent,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.onSurfaceVariant,
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  const _ActionBtn({
    required this.label,
    required this.icon,
    required this.filled,
    required this.accent,
    required this.onPressed,
  });

  final String label;
  final IconData icon;
  final bool filled;
  final Color accent;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 54,
      child: TextButton.icon(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          backgroundColor: filled ? accent : const Color(0xFFE9EEF6),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
        icon: Icon(icon, color: filled ? Colors.white : accent, size: 18),
        label: Text(
          label,
          style: Theme.of(context).textTheme.labelLarge?.copyWith(
                color: filled ? Colors.white : accent,
                fontWeight: FontWeight.w800,
              ),
        ),
      ),
    );
  }
}

class _CircleAction extends StatelessWidget {
  const _CircleAction({
    required this.icon,
    required this.accent,
    required this.onPressed,
  });

  final IconData icon;
  final Color accent;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 54,
      height: 54,
      child: TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          backgroundColor: const Color(0xFFE9EEF6),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          padding: EdgeInsets.zero,
        ),
        child: Icon(icon, color: accent, size: 20),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
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
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    this.isLast = false,
  });

  final String label;
  final String value;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 14),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  value.isEmpty ? 'Not available' : value,
                  textAlign: TextAlign.right,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
            ],
          ),
          if (!isLast) ...[
            const SizedBox(height: 14),
            const Divider(height: 1),
          ],
        ],
      ),
    );
  }
}

class _ListingCard extends StatelessWidget {
  const _ListingCard({
    required this.listing,
    required this.accent,
    required this.onTap,
  });

  final DirectoryLinkedListing listing;
  final Color accent;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              child: SizedBox(
                height: 220,
                width: double.infinity,
                child: listing.imageUrl.isEmpty
                    ? Container(
                        color: const Color(0xFFE9EEF6),
                        alignment: Alignment.center,
                        child: const Icon(Icons.image_outlined, color: AppColors.outline),
                      )
                    : AppCachedImage(
                        imageUrl: listing.imageUrl,
                        fit: BoxFit.cover,
                      ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          listing.title,
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        listing.priceLabel,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: accent,
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    listing.locationLabel,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.onSurfaceVariant,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${listing.bedrooms} beds • ${listing.bathrooms} baths • ${listing.areaLabel}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({
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
            Text(message, textAlign: TextAlign.center),
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
