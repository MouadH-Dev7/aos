import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_cached_image.dart';
import '../../core/widgets/app_shimmer.dart';
import 'data/directory_models.dart';
import 'data/directory_service.dart';
import 'directory_detail_page.dart';

class PromotersPage extends StatefulWidget {
  const PromotersPage({super.key});

  @override
  State<PromotersPage> createState() => _PromotersPageState();
}

class _PromotersPageState extends State<PromotersPage> {
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
      final pageData = await DirectoryService().fetchPromotersPage(
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
      final pageData = await DirectoryService().fetchPromotersPage(
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
    final spotlight = visibleItems.take(2).toList();

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
              padding: const EdgeInsets.fromLTRB(20, 18, 20, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Promoters',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.w800,
                                letterSpacing: -1,
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
                      hintText: 'Search by promoter name',
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
            const SliverToBoxAdapter(child: _PromotersLoadingState())
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
                height: 390,
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 22, 20, 0),
                  scrollDirection: Axis.horizontal,
                  itemCount: spotlight.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 18),
                  itemBuilder: (context, index) {
                    return _PromoterHeroCard(entry: spotlight[index]);
                  },
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 120),
              sliver: SliverList.separated(
                itemCount: visibleItems.length + 1 + (_loadingMore ? 1 : 0),
                separatorBuilder: (context, index) => const SizedBox(height: 18),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return Text(
                      'Promoter Results',
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
                  return _PromoterListCard(entry: visibleItems[index - 1]);
                },
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _PromotersLoadingState extends StatelessWidget {
  const _PromotersLoadingState();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      child: Column(
        children: List.generate(
          3,
          (index) => const Padding(
            padding: EdgeInsets.only(bottom: 18),
            child: Column(
              children: [
                ShimmerBox(
                  height: 220,
                  borderRadius: BorderRadius.all(Radius.circular(24)),
                ),
                SizedBox(height: 12),
                ShimmerBox(height: 22, width: 220),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _PromoterHeroCard extends StatelessWidget {
  const _PromoterHeroCard({required this.entry});

  final DirectoryEntry entry;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(28),
      onTap: () => _openDetails(context),
      child: Container(
        width: MediaQuery.of(context).size.width * 0.78,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(28),
          gradient: const LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF6B8FDB), Color(0xFF1D2A39)],
          ),
        ),
        child: Stack(
          children: [
            Positioned(
              top: 24,
              right: 24,
              child: SizedBox(
                width: 72,
                height: 72,
                child: AppCachedImage(
                  imageUrl: entry.logoUrl,
                  borderRadius: BorderRadius.circular(999),
                  placeholderIcon: Icons.domain_rounded,
                ),
              ),
            ),
            Positioned(
              left: 20,
              right: 20,
              bottom: 22,
              child: Text(
                entry.companyName,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                    ),
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
          type: DirectoryProfileType.promoter,
        ),
      ),
    );
  }
}

class _PromoterListCard extends StatelessWidget {
  const _PromoterListCard({required this.entry});

  final DirectoryEntry entry;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(24),
      onTap: () => _openDetails(context),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Column(
          children: [
            Row(
              children: [
                SizedBox(
                  width: 56,
                  height: 56,
                  child: AppCachedImage(
                    imageUrl: entry.logoUrl,
                    borderRadius: BorderRadius.circular(16),
                    placeholderIcon: Icons.domain_rounded,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Text(
                    entry.companyName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              entry.description.isNotEmpty
                  ? entry.description
                  : 'No description provided.',
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.onSurfaceVariant,
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
          type: DirectoryProfileType.promoter,
        ),
      ),
    );
  }
}
