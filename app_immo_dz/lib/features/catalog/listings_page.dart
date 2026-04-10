import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_cached_image.dart';
import '../../core/widgets/app_shimmer.dart';
import '../auth/data/auth_models.dart';
import '../home/data/home_models.dart';
import '../home/data/home_service.dart';
import '../home/widgets/search_panel.dart';

class ListingsPage extends StatefulWidget {
  const ListingsPage({
    super.key,
    required this.onOpenProperty,
  });

  final ValueChanged<int> onOpenProperty;

  @override
  State<ListingsPage> createState() => _ListingsPageState();
}

class _ListingsPageState extends State<ListingsPage> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  final List<PropertyCardData> _items = [];
  late Future<HomeFilterData> _filterDataFuture;
  int _page = 1;
  bool _loading = true;
  bool _loadingMore = false;
  bool _hasNextPage = true;
  String? _error;
  String _activeSearchQuery = '';
  int? _selectedCategoryId;
  int? _selectedTypeId;
  int? _selectedWilayaId;
  int? _selectedDairaId;
  int? _selectedCommuneId;
  static const int _pageSize = 10;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _filterDataFuture = HomeService().fetchFilterData();
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
    final filtersFuture = HomeService().fetchFilterData();
    setState(() {
      _loading = true;
      _error = null;
      _page = 1;
      _hasNextPage = true;
      _items.clear();
      _filterDataFuture = filtersFuture;
    });

    try {
      final pageData = await HomeService().fetchListingsPage(
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
    if (_loadingMore || !_hasNextPage || _loading) return;

    setState(() => _loadingMore = true);
    try {
      final pageData = await HomeService().fetchListingsPage(
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
    if (position.pixels >= position.maxScrollExtent - 320) {
      _loadMore();
    }
  }

  String? _nameForOption(List<HomeFilterOption> items, int? id) {
    if (id == null) return null;
    for (final item in items) {
      if (item.id == id) return item.name;
    }
    return null;
  }

  String? _locationName(List<LocationItem> items, int? id) {
    if (id == null) return null;
    for (final item in items) {
      if (item.id == id) return item.name;
    }
    return null;
  }

  List<PropertyCardData> _applyLocalFilters(
    List<PropertyCardData> items,
    HomeFilterData filterData,
  ) {
    return items.where((item) {
      final matchesCategory = _selectedCategoryId == null ||
          item.categoryName ==
              _nameForOption(filterData.categories, _selectedCategoryId);
      final matchesType = _selectedTypeId == null ||
          item.typeName == _nameForOption(filterData.types, _selectedTypeId);
      final matchesWilaya = _selectedWilayaId == null ||
          item.wilayaName == _locationName(filterData.wilayas, _selectedWilayaId);
      final matchesDaira = _selectedDairaId == null ||
          item.dairaName == _locationName(filterData.dairas, _selectedDairaId);
      final matchesCommune = _selectedCommuneId == null ||
          item.communeName ==
              _locationName(filterData.communes, _selectedCommuneId);
      return matchesCategory &&
          matchesType &&
          matchesWilaya &&
          matchesDaira &&
          matchesCommune;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return FutureBuilder<HomeFilterData>(
      future: _filterDataFuture,
      builder: (context, filterSnapshot) {
        final filterData = filterSnapshot.data ??
            const HomeFilterData(
              categories: [],
              types: [],
              wilayas: [],
              dairas: [],
              communes: [],
            );
        final filteredDairas = _selectedWilayaId == null
            ? filterData.dairas
            : filterData.dairas
                .where((item) => item.wilayaId == _selectedWilayaId)
                .toList();
        final filteredCommunes = _selectedDairaId == null
            ? filterData.communes
            : filterData.communes
                .where((item) => item.dairaId == _selectedDairaId)
                .toList();
        final visibleItems = _applyLocalFilters(_items, filterData);

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
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 8),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Expanded(
                            child: Text(
                              'All Ads',
                              style: theme.textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.9,
                              ),
                            ),
                          ),
                          Text(
                            '${visibleItems.length} Shown',
                            style: theme.textTheme.labelMedium?.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      SearchPanel(
                        searchController: _searchController,
                        categories: filterData.categories,
                        types: filterData.types,
                        wilayas: filterData.wilayas,
                        dairas: filteredDairas,
                        communes: filteredCommunes,
                        selectedCategoryId: _selectedCategoryId,
                        selectedTypeId: _selectedTypeId,
                        selectedWilayaId: _selectedWilayaId,
                        selectedDairaId: _selectedDairaId,
                        selectedCommuneId: _selectedCommuneId,
                        onSearchChanged: (_) => setState(() {}),
                        onSearchSubmitted: _applySearch,
                        onCategoryChanged: (value) {
                          setState(() => _selectedCategoryId = value);
                        },
                        onTypeChanged: (value) {
                          setState(() => _selectedTypeId = value);
                        },
                        onWilayaChanged: (value) {
                          setState(() {
                            _selectedWilayaId = value;
                            _selectedDairaId = null;
                            _selectedCommuneId = null;
                          });
                        },
                        onDairaChanged: (value) {
                          setState(() {
                            _selectedDairaId = value;
                            _selectedCommuneId = null;
                          });
                        },
                        onCommuneChanged: (value) {
                          setState(() => _selectedCommuneId = value);
                        },
                      ),
                    ],
                  ),
                ),
              ),
              if (_loading)
                const SliverToBoxAdapter(child: _ListingsLoadingState())
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
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                  sliver: SliverList.separated(
                    itemCount: visibleItems.length + (_loadingMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index >= visibleItems.length) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 24),
                          child: Center(child: CircularProgressIndicator()),
                        );
                      }
                      final item = visibleItems[index];
                      return _ListingCard(
                        data: item,
                        onTap: () => widget.onOpenProperty(item.id),
                      );
                    },
                    separatorBuilder: (context, index) => const SizedBox(height: 28),
                  ),
                ),
              const SliverToBoxAdapter(child: SizedBox(height: 120)),
            ],
          ),
        );
      },
    );
  }
}

class _ListingsLoadingState extends StatelessWidget {
  const _ListingsLoadingState();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      child: Column(
        children: List.generate(
          3,
          (index) => Padding(
            padding: const EdgeInsets.only(bottom: 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                ShimmerBox(height: 220, borderRadius: BorderRadius.all(Radius.circular(24))),
                SizedBox(height: 16),
                ShimmerBox(height: 24, width: 220),
                SizedBox(height: 8),
                ShimmerBox(height: 22, width: 140),
                SizedBox(height: 8),
                ShimmerBox(height: 18, width: 260),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ListingCard extends StatelessWidget {
  const _ListingCard({
    required this.data,
    required this.onTap,
  });

  final PropertyCardData data;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            height: 220,
            child: AppCachedImage(
              imageUrl: data.imageUrl,
              borderRadius: BorderRadius.circular(24),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            data.title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            data.price,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            data.location,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.onSurfaceVariant,
                ),
          ),
        ],
      ),
    );
  }
}
