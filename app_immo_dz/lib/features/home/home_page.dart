import 'package:flutter/material.dart';

import '../../app_routes.dart';
import '../auth/data/auth_models.dart';
import '../account/account_dashboard_page.dart';
import '../add_property/add_property_page.dart';
import '../auth/data/auth_service.dart';
import '../catalog/listings_shell_page.dart';
import 'data/home_models.dart';
import 'data/home_service.dart';
import '../property_details/property_details_page.dart';
import 'widgets/bottom_navigation.dart';
import 'widgets/featured_carousel.dart';
import 'widgets/home_header.dart';
import 'widgets/recommended_card.dart';
import 'widgets/section_header.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.user});

  final AuthUser user;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;
  late Future<HomeFeedData> _homeFeedFuture;

  @override
  void initState() {
    super.initState();
    _homeFeedFuture = HomeService().fetchHomeFeed();
  }

  Future<void> _handleAuthAction() async {
    if (widget.user.isGuest) {
      if (!mounted) return;
      Navigator.of(context).pushNamed(AppRoutes.login);
      return;
    }

    await AuthService().clearSession();
    if (!mounted) return;
    Navigator.of(context).pushNamedAndRemoveUntil(
      AppRoutes.login,
      (route) => false,
    );
  }

  Future<void> _openDashboard() async {
    if (widget.user.isGuest) {
      Navigator.of(context).pushNamed(AppRoutes.login);
      return;
    }

    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => AccountDashboardPage(user: widget.user),
      ),
    );
    if (!mounted) return;
    await _reloadHomeFeed();
  }

  Future<void> _openAddProperty() async {
    if (widget.user.isGuest) {
      Navigator.of(context).pushNamed(AppRoutes.login);
      return;
    }

    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => AddPropertyPage(user: widget.user),
      ),
    );
    if (!mounted) return;
    await _reloadHomeFeed();
  }

  Future<void> _reloadHomeFeed() async {
    final future = HomeService().fetchHomeFeed();
    setState(() {
      _homeFeedFuture = future;
    });
    await future;
  }

  Future<void> _openPropertyDetails(int propertyId) async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => PropertyDetailsPage(propertyId: propertyId),
      ),
    );
    if (!mounted) return;
    await _reloadHomeFeed();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth < 360 ? 18.0 : 22.0;

    final body = DecoratedBox(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFFF9FBFF), Color(0xFFF3F6FB), Color(0xFFEEF3F8)],
            ),
          ),
          child: SafeArea(
            child: FutureBuilder<HomeFeedData>(
              future: _homeFeedFuture,
              builder: (context, snapshot) {
                final featured = snapshot.data?.featured ?? const <PropertyCardData>[];
                final recommended =
                    snapshot.data?.recommended ?? const <RecommendedCardData>[];
                return RefreshIndicator(
                      onRefresh: _reloadHomeFeed,
                      child: CustomScrollView(
                        physics: const BouncingScrollPhysics(
                          parent: AlwaysScrollableScrollPhysics(),
                        ),
                        slivers: [
                          SliverPadding(
                            padding: EdgeInsets.fromLTRB(
                              horizontalPadding,
                              14,
                              horizontalPadding,
                              18,
                            ),
                            sliver: SliverList(
                              delegate: SliverChildListDelegate([
                                HomeHeader(
                                  onAuthAction: _handleAuthAction,
                                  onDashboardTap: _openDashboard,
                                ),
                                const SizedBox(height: 32),
                                const SectionHeader(
                                  eyebrow: 'Top Picks',
                                  title: 'Featured Homes',
                                  subtitle:
                                      'Discover standout properties selected to help you find the right place faster.',
                                ),
                                const SizedBox(height: 16),
                                if (snapshot.connectionState ==
                                        ConnectionState.waiting &&
                                    !snapshot.hasData)
                                  const _HomeLoadingState()
                                else if (snapshot.hasError)
                                  _HomeErrorState(
                                    message: '${snapshot.error}',
                                    onRetry: () {
                                      _reloadHomeFeed();
                                    },
                                  )
                                else if ((snapshot.data?.featured.isEmpty ?? true) &&
                                    (snapshot.data?.recommended.isEmpty ?? true))
                                  _HomeErrorState(
                                    message:
                                        'No listings are available right now.',
                                    onRetry: () {
                                      _reloadHomeFeed();
                                    },
                                  )
                                else ...[
                                  FeaturedCarousel(
                                    items: featured,
                                    onItemTap: (item) =>
                                        _openPropertyDetails(item.id),
                                  ),
                                  const SizedBox(height: 34),
                                  const SectionHeader(
                                    eyebrow: 'Handpicked For You',
                                    title: 'Homes You May Love',
                                    subtitle:
                                        'Explore attractive opportunities matched to the way people search and live.',
                                  ),
                                  const SizedBox(height: 16),
                                ],
                              ]),
                            ),
                          ),
                          if (recommended.isNotEmpty)
                            SliverPadding(
                              padding: EdgeInsets.fromLTRB(
                                horizontalPadding,
                                0,
                                horizontalPadding,
                                120,
                              ),
                              sliver: SliverLayoutBuilder(
                                builder: (context, constraints) {
                                  final width = constraints.crossAxisExtent;
                                  final columns = width >= 920
                                      ? 3
                                      : width >= 620
                                          ? 2
                                          : 1;
                                  final spacing =
                                      width < 360 ? 12.0 : 16.0;
                                  if (columns == 1) {
                                    return SliverList.separated(
                                      itemBuilder: (context, index) {
                                        return RecommendedCard(
                                          data: recommended[index],
                                          onTap: () => _openPropertyDetails(
                                            recommended[index].id,
                                          ),
                                        );
                                      },
                                      separatorBuilder: (_, _) =>
                                          SizedBox(height: spacing),
                                      itemCount: recommended.length,
                                    );
                                  }

                                  final mainAxisExtent =
                                      columns == 2 ? 430.0 : 450.0;

                                  return SliverGrid(
                                    delegate: SliverChildBuilderDelegate(
                                      (context, index) {
                                        return RecommendedCard(
                                          data: recommended[index],
                                          onTap: () => _openPropertyDetails(
                                            recommended[index].id,
                                          ),
                                        );
                                      },
                                      childCount: recommended.length,
                                    ),
                                    gridDelegate:
                                        SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: columns,
                                      crossAxisSpacing: spacing,
                                      mainAxisSpacing: spacing,
                                      mainAxisExtent: mainAxisExtent,
                                    ),
                                  );
                                },
                                ),
                            ),
                        ],
                      ),
                    );
              },
            ),
          ),
        );

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB),
      bottomNavigationBar: HomeBottomNavigation(
        currentIndex: _selectedIndex,
        onDestinationSelected: (index) {
          if (index == 1) {
            Navigator.of(context).push(
              MaterialPageRoute<void>(
                builder: (_) => ListingsShellPage(
                  onOpenProperty: _openPropertyDetails,
                ),
              ),
            ).then((_) {
              if (mounted) {
                _reloadHomeFeed();
              }
            });
            return;
          }
          if (index == 2) {
            _openAddProperty();
            return;
          }
          if (index == 3) {
            _openDashboard();
            return;
          }
          setState(() => _selectedIndex = index);
        },
      ),
      body: body,
    );
  }
}

class _HomeLoadingState extends StatelessWidget {
  const _HomeLoadingState();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 220,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
      ),
      child: const CircularProgressIndicator(),
    );
  }
}

class _HomeErrorState extends StatelessWidget {
  const _HomeErrorState({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFFFD9D4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Could not load listings',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 14),
          ElevatedButton(
            onPressed: onRetry,
            child: const Text('Try again'),
          ),
        ],
      ),
    );
  }
}
