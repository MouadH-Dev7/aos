import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_cached_image.dart';
import '../auth/login/login_page.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  static const completedKey = 'onboarding.completed';

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  static const _items = [
    _OnboardingItem(
      badge: 'Exclusive Portfolio',
      titleA: 'Find Your',
      titleB: 'Future ',
      titleAccent: 'Home.',
      description:
          'Discover refined living spaces curated for the architectural enthusiast.',
      imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDlE1PL4toZb1Koci4rMPqdVTvCbpQe0UEOQb_wArUJMdlZh8xZjwQS9AsYGAiqthKtOetNbkKHyeeaj9ySh4TcnBIBrp4KElG4NbED828G3Hzh8dEWEo1vUFSGGP-OSqdYeo-CtV-N0XovZ7cLcTYoL8bogZBKdMmQznkSGwj9IRr6CV8plR2uD_udVMWxIa_sUmYqv61pAqKpGD36p0cUzd5iLI1yT6zIV0mNz16-Z6l_-PL-IIGHGpo7wcMAHHJMKHIRoo-W45RO',
      cards: [
        _MiniCardData(icon: Icons.search_rounded, title: 'Smart AI Search'),
        _MiniCardData(icon: Icons.location_on_rounded, title: 'Algiers Coast'),
      ],
    ),
    _OnboardingItem(
      badge: 'Partnerships',
      titleA: 'Connect with',
      titleB: 'Industry ',
      titleAccent: 'Experts',
      description:
          'Gain exclusive access to premier agencies and promoters across Algeria.',
      imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD9UDMmjbBlE1spAGnPSdN0BIRqgpbzDCEPY9axJn3SAbbRiOc-6RPkeRnwTpkSww9eqakSn4rYDa_kCwbJ1Ia1EG56sJGbit_H4NzwWKaJACfsDuMK7I_kNC2AJaPi0yaVSbZjVJHggxhcDm_WYFWWx-VL4Z3Eafh3ZwXzFW7BfBieuHRvVxR20awMgwIwblZNMzSUBL0AByVMTlr8mVmG5MzRkg6MM8jvf_DxFAEKnrc0CvLS_A5P95h67ArnizweRY90pIGMjNiH',
      cards: [
        _MiniCardData(icon: Icons.handshake_rounded, title: 'Trusted Agencies'),
        _MiniCardData(icon: Icons.domain_rounded, title: 'Top Promoters'),
      ],
    ),
    _OnboardingItem(
      badge: 'Step 03 - Final',
      titleA: 'List Your',
      titleB: 'Property ',
      titleAccent: 'Fast.',
      description:
          'Publish premium listings quickly and reach serious buyers in real time.',
      imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA7z_znRU5nYeYFKT2MaYzfPk4OeRn_cJlwhcpGH6ZAiEfKRYgDlycTJe9SiSsfrb_Znp6136RIje7NBJobsrTND6YNu7Y4LjruTWYA4ZLPC0_Zyr_WQ0buZ2sNPuo9Alt2shlReM227BuDK3EN8eM-QEAGeAHp5G4cDNp7oo1hOsy9xm7kWGCCXD1gGkftXpSZnX_b8NPxTja55xI0RonL4xx5Z0EbjSRYoh_NDtXiWF_FqODlTLvI--KVZJjQ71DAWEVOmuWZt5rn',
      cards: [
        _MiniCardData(icon: Icons.bolt_rounded, title: 'Fast Track'),
        _MiniCardData(icon: Icons.add_a_photo_rounded, title: 'List in Minutes'),
      ],
    ),
  ];

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(OnboardingPage.completedKey, true);
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute<void>(builder: (_) => const LoginPage()),
    );
  }

  void _next() {
    if (_currentPage == _items.length - 1) {
      _finish();
      return;
    }
    _pageController.nextPage(
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Stack(
          children: [
            PageView.builder(
              controller: _pageController,
              onPageChanged: (value) => setState(() => _currentPage = value),
              itemCount: _items.length,
              itemBuilder: (context, index) {
                return _OnboardingStep(item: _items[index]);
              },
            ),
            Positioned(
              top: 10,
              left: 20,
              right: 20,
              child: Row(
                children: [
                  IconButton(
                    onPressed: _finish,
                    icon: const Icon(Icons.close_rounded),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: _finish,
                    child: const Text('Skip'),
                  ),
                ],
              ),
            ),
            Positioned(
              left: 20,
              right: 20,
              bottom: 28,
              child: Row(
                children: [
                  _CircleNavButton(
                    icon: Icons.west_rounded,
                    active: false,
                    onTap: _currentPage == 0
                        ? null
                        : () => _pageController.previousPage(
                              duration: const Duration(milliseconds: 280),
                              curve: Curves.easeOutCubic,
                            ),
                  ),
                  const Spacer(),
                  Row(
                    children: List.generate(_items.length, (index) {
                      final active = index == _currentPage;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 220),
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: active ? 34 : 10,
                        height: 6,
                        decoration: BoxDecoration(
                          color: active
                              ? AppColors.primary
                              : AppColors.outlineVariant,
                          borderRadius: BorderRadius.circular(999),
                        ),
                      );
                    }),
                  ),
                  const Spacer(),
                  _CircleNavButton(
                    icon: _currentPage == _items.length - 1
                        ? Icons.arrow_forward_rounded
                        : Icons.east_rounded,
                    active: true,
                    onTap: _next,
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

class _OnboardingStep extends StatelessWidget {
  const _OnboardingStep({required this.item});

  final _OnboardingItem item;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final height = constraints.maxHeight;
        final imageHeight = height < 760 ? 260.0 : 390.0;
        final cardSpacing = height < 760 ? 10.0 : 12.0;
        final sectionSpacing = height < 760 ? 16.0 : 24.0;

        return SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 84, 24, 110),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: height - 194),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: SizedBox(
                    height: imageHeight,
                    width: double.infinity,
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        AppCachedImage(
                          imageUrl: item.imageUrl,
                          fit: BoxFit.cover,
                        ),
                        DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                AppColors.primary.withValues(alpha: 0.18),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: sectionSpacing),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    item.badge,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1,
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                RichText(
                  text: TextSpan(
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: AppColors.onSurface,
                      fontWeight: FontWeight.w900,
                      height: 1.05,
                      letterSpacing: -1.0,
                    ),
                    children: [
                      TextSpan(text: '${item.titleA}\n'),
                      TextSpan(text: item.titleB),
                      TextSpan(
                        text: item.titleAccent,
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  item.description,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.onSurfaceVariant,
                    height: 1.5,
                  ),
                ),
                SizedBox(height: sectionSpacing),
                Row(
                  children: item.cards.map((card) {
                    return Expanded(
                      child: Container(
                        margin: EdgeInsets.only(
                          right: card == item.cards.last ? 0 : cardSpacing,
                        ),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.03),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(card.icon, color: AppColors.primary, size: 28),
                            const SizedBox(height: 14),
                            Text(
                              card.title,
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
                  }).toList(),
                ),
                if (item == _OnboardingPageState._items.last) ...[
                  SizedBox(height: sectionSpacing),
                  SizedBox(
                    width: double.infinity,
                    height: 58,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF004AC6), Color(0xFF2563EB)],
                        ),
                        borderRadius: BorderRadius.circular(999),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF004AC6).withValues(alpha: 0.16),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Get Started',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                              ),
                            ),
                            SizedBox(width: 8),
                            Icon(Icons.east_rounded, color: Colors.white),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}

class _CircleNavButton extends StatelessWidget {
  const _CircleNavButton({
    required this.icon,
    required this.active,
    required this.onTap,
  });

  final IconData icon;
  final bool active;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: active ? AppColors.primary : const Color(0xFFF0F2F5),
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 56,
          height: 56,
          child: Icon(
            icon,
            color: active ? Colors.white : AppColors.outline,
          ),
        ),
      ),
    );
  }
}

class _OnboardingItem {
  const _OnboardingItem({
    required this.badge,
    required this.titleA,
    required this.titleB,
    required this.titleAccent,
    required this.description,
    required this.imageUrl,
    required this.cards,
  });

  final String badge;
  final String titleA;
  final String titleB;
  final String titleAccent;
  final String description;
  final String imageUrl;
  final List<_MiniCardData> cards;
}

class _MiniCardData {
  const _MiniCardData({
    required this.icon,
    required this.title,
  });

  final IconData icon;
  final String title;
}
