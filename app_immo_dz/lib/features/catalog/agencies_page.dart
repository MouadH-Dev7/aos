import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_cached_image.dart';
import '../../core/widgets/app_shimmer.dart';
import 'data/directory_models.dart';
import 'data/directory_service.dart';
import 'directory_detail_page.dart';

class AgenciesPage extends StatefulWidget {
  const AgenciesPage({super.key});

  @override
  State<AgenciesPage> createState() => _AgenciesPageState();
}

class _AgenciesPageState extends State<AgenciesPage> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  final List<DirectoryEntry> _items = [];
  int _page = 1;
  bool _loading = true;
  bool _loadingMore = false;
  bool _hasNextPage = true;
  String? _error;
  String _activeSearchQuery = '';
  static const int _pageSize = 10;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _loadFirstPage();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _applySearch() {
    final nextQuery = _searchController.text.trim();
    if (nextQuery == _activeSearchQuery) return;
    setState(() => _activeSearchQuery = nextQuery);
    _loadFirstPage();
  }

  Future<void> _loadFirstPage() async {
    setState(() {
      _loading = true;
      _loadingMore = false;
      _error = null;
      _page = 1;
      _hasNextPage = true;
      _items.clear();
    });

    try {
      final pageData = await DirectoryService().fetchAgenciesPage(
        page: 1,
        pageSize: _pageSize,
        search: _activeSearchQuery,
      );
      if (!mounted) return;
      setState(() {
        _items.addAll(pageData.items);
        _hasNextPage = pageData.hasNextPage;
        _page = 2;
      });
      _prefetchNextPage();
    } catch (error) {
      if (!mounted) return;
      setState(() => _error = '$error');
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _loadMore() async {
    if (_loading || _loadingMore || !_hasNextPage) return;

    setState(() => _loadingMore = true);
    try {
      final pageData = await DirectoryService().fetchAgenciesPage(
        page: _page,
        pageSize: _pageSize,
        search: _activeSearchQuery,
      );
      if (!mounted) return;
      setState(() {
        _items.addAll(pageData.items);
        _hasNextPage = pageData.hasNextPage;
        _page += 1;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _hasNextPage = false);
    } finally {
      if (mounted) {
        setState(() => _loadingMore = false);
      }
    }
  }

  Future<void> _prefetchNextPage() async {
    if (_loading || _loadingMore || !_hasNextPage) return;
    await _loadMore();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final position = _scrollController.position;
    if (position.pixels >= position.maxScrollExtent - 280) {
      _loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final visibleItems = _items;
    final topItems = visibleItems.take(3).toList();

    return RefreshIndicator(
      onRefresh: _loadFirstPage,
      child: CustomScrollView(
        controller: _scrollController,
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Agencies',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                      ),
                      Text(
                        '${visibleItems.length} shown',
                        style: Theme.of(context).textTheme.labelMedium?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  TextField(
                    controller: _searchController,
                    textInputAction: TextInputAction.search,
                    onSubmitted: (_) => _applySearch(),
                    decoration: InputDecoration(
                      hintText: 'Search by agency name',
                      prefixIcon: const Icon(Icons.search_rounded),
                      suffixIcon: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (_searchController.text.isNotEmpty)
                            IconButton(
                              onPressed: () {
                                _searchController.clear();
                                _applySearch();
                              },
                              icon: const Icon(Icons.close_rounded),
                            ),
                          IconButton(
                            onPressed: _applySearch,
                            icon: const Icon(Icons.search_rounded),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (_loading)
            const SliverToBoxAdapter(child: _DirectoryLoadingState())
          else if (_error != null)
            SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(_error!, textAlign: TextAlign.center),
                ),
              ),
            )
          else ...[
            SliverToBoxAdapter(
              child: SizedBox(
                height: 216,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  scrollDirection: Axis.horizontal,
                  itemCount: topItems.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 18),
                  itemBuilder: (context, index) {
                    return _TopAgencyCard(entry: topItems[index]);
                  },
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 120),
              sliver: SliverList.separated(
                itemCount: visibleItems.length + 1 + (_loadingMore ? 1 : 0),
                separatorBuilder: (context, index) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return Text(
                      'Agency Results',
                      style: Theme.of(context)
                          .textTheme
                          .headlineSmall
                          ?.copyWith(fontWeight: FontWeight.w800),
                    );
                  }
                  if (_loadingMore && index == visibleItems.length + 1) {
                    return const Padding(
                      padding: EdgeInsets.symmetric(vertical: 20),
                      child: Center(child: CircularProgressIndicator()),
                    );
                  }
                  return _AgencyListCard(entry: visibleItems[index - 1]);
                },
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _DirectoryLoadingState extends StatelessWidget {
  const _DirectoryLoadingState();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      child: Column(
        children: List.generate(
          4,
          (index) => const Padding(
            padding: EdgeInsets.only(bottom: 16),
            child: Row(
              children: [
                ShimmerBox(
                  width: 76,
                  height: 76,
                  borderRadius: BorderRadius.all(Radius.circular(18)),
                ),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ShimmerBox(height: 22, width: 180),
                      SizedBox(height: 8),
                      ShimmerBox(height: 16, width: 220),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _TopAgencyCard extends StatelessWidget {
  const _TopAgencyCard({required this.entry});

  final DirectoryEntry entry;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: () => _openDetails(context),
      child: Container(
        width: 176,
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _LogoAvatar(url: entry.logoUrl, icon: Icons.domain_rounded, size: 64),
            const SizedBox(height: 18),
            Text(
              entry.companyName,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  void _openDetails(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => DirectoryDetailPage(
          entry: entry,
          type: DirectoryProfileType.agency,
        ),
      ),
    );
  }
}

class _AgencyListCard extends StatelessWidget {
  const _AgencyListCard({required this.entry});

  final DirectoryEntry entry;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: () => _openDetails(context),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
        ),
        child: Row(
          children: [
            _LogoAvatar(url: entry.logoUrl, icon: Icons.business_rounded, size: 76),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    entry.companyName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    entry.description.isNotEmpty
                        ? entry.description
                        : 'No description provided.',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.onSurfaceVariant,
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

  void _openDetails(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => DirectoryDetailPage(
          entry: entry,
          type: DirectoryProfileType.agency,
        ),
      ),
    );
  }
}

class _LogoAvatar extends StatelessWidget {
  const _LogoAvatar({
    required this.url,
    required this.icon,
    required this.size,
  });

  final String url;
  final IconData icon;
  final double size;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(size / 2);
    return SizedBox(
      width: size,
      height: size,
      child: AppCachedImage(
        imageUrl: url,
        borderRadius: radius,
        placeholderIcon: icon,
      ),
    );
  }
}
