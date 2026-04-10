import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

class HomeBottomNavigation extends StatelessWidget {
  const HomeBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onDestinationSelected,
  });

  final int currentIndex;
  final ValueChanged<int> onDestinationSelected;

  static const _items = [
    _BottomNavItemData(
      label: 'Home',
      icon: Icons.home_rounded,
      inactiveIcon: Icons.home_outlined,
    ),
    _BottomNavItemData(
      label: 'Listings',
      icon: Icons.home_work_rounded,
      inactiveIcon: Icons.home_work_outlined,
    ),
    _BottomNavItemData(
      label: 'Add',
      icon: Icons.add_circle_rounded,
      inactiveIcon: Icons.add_circle_outline_rounded,
    ),
    _BottomNavItemData(
      label: 'Profile',
      icon: Icons.person_rounded,
      inactiveIcon: Icons.person_outline_rounded,
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
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 14,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Row(
            children: List.generate(_items.length, (index) {
              final item = _items[index];
              final isActive = currentIndex == index;
              return Expanded(
                child: _BottomNavigationButton(
                  data: item,
                  isActive: isActive,
                  onTap: () => onDestinationSelected(index),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _BottomNavigationButton extends StatelessWidget {
  const _BottomNavigationButton({
    required this.data,
    required this.isActive,
    required this.onTap,
  });

  final _BottomNavItemData data;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
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
                color: isActive ? AppColors.primary : const Color(0xFFF4F6FA),
                boxShadow: [
                  if (isActive)
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.16),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                ],
              ),
              child: Icon(
                isActive ? data.icon : data.inactiveIcon,
                color: isActive ? Colors.white : AppColors.onSurfaceVariant,
                size: 20,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              data.label,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: theme.textTheme.labelSmall?.copyWith(
                color: isActive ? AppColors.primary : AppColors.outline,
                fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                letterSpacing: 0.1,
                fontSize: 10,
                height: 1.05,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BottomNavItemData {
  const _BottomNavItemData({
    required this.label,
    required this.icon,
    required this.inactiveIcon,
  });

  final String label;
  final IconData icon;
  final IconData inactiveIcon;
}
