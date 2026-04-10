import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import 'agencies_page.dart';
import 'listings_page.dart';
import 'promoters_page.dart';

class ListingsShellPage extends StatefulWidget {
  const ListingsShellPage({
    super.key,
    required this.onOpenProperty,
    this.initialIndex = 0,
  });

  final ValueChanged<int> onOpenProperty;
  final int initialIndex;

  @override
  State<ListingsShellPage> createState() => _ListingsShellPageState();
}

class _ListingsShellPageState extends State<ListingsShellPage> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex.clamp(0, 2);
  }

  @override
  Widget build(BuildContext context) {
    Widget body;
    switch (_selectedIndex) {
      case 1:
        body = const AgenciesPage();
        break;
      case 2:
        body = const PromotersPage();
        break;
      default:
        body = ListingsPage(
          onOpenProperty: widget.onOpenProperty,
        );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.arrow_back_rounded),
                  ),
                  Expanded(
                    child: Text(
                      _titleForIndex(_selectedIndex),
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),
            Expanded(child: body),
          ],
        ),
      ),
      bottomNavigationBar: _ListingsBottomNavigation(
        currentIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
        },
      ),
    );
  }

  String _titleForIndex(int index) {
    switch (index) {
      case 1:
        return 'Agencies';
      case 2:
        return 'Promoters';
      default:
        return 'Listings';
    }
  }
}

class _ListingsBottomNavigation extends StatelessWidget {
  const _ListingsBottomNavigation({
    required this.currentIndex,
    required this.onDestinationSelected,
  });

  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;

  static const _items = [
    _ListingsNavItem(
      label: 'Listings',
      icon: Icons.home_work_rounded,
      inactiveIcon: Icons.home_work_outlined,
    ),
    _ListingsNavItem(
      label: 'Agencies',
      icon: Icons.real_estate_agent_rounded,
      inactiveIcon: Icons.real_estate_agent_outlined,
    ),
    _ListingsNavItem(
      label: 'Promoters',
      icon: Icons.domain_rounded,
      inactiveIcon: Icons.domain_outlined,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.95),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: Colors.white.withValues(alpha: 0.85)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 26,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Row(
            children: List.generate(_items.length, (index) {
              final item = _items[index];
              final isActive = currentIndex == index;
              return Expanded(
                child: InkWell(
                  onTap: () => onDestinationSelected(index),
                  borderRadius: BorderRadius.circular(20),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOutCubic,
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: isActive
                          ? const LinearGradient(
                              colors: [Color(0xFFEAF1FF), Color(0xFFDDE9FF)],
                            )
                          : null,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 220),
                          curve: Curves.easeOutCubic,
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color:
                                isActive ? AppColors.primary : const Color(0xFFF4F6FA),
                          ),
                          child: Icon(
                            isActive ? item.icon : item.inactiveIcon,
                            color:
                                isActive ? Colors.white : AppColors.onSurfaceVariant,
                            size: 20,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          item.label,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color:
                                    isActive ? AppColors.primary : AppColors.outline,
                                fontWeight:
                                    isActive ? FontWeight.w800 : FontWeight.w600,
                                fontSize: 10,
                                height: 1.05,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _ListingsNavItem {
  const _ListingsNavItem({
    required this.label,
    required this.icon,
    required this.inactiveIcon,
  });

  final String label;
  final IconData icon;
  final IconData inactiveIcon;
}
