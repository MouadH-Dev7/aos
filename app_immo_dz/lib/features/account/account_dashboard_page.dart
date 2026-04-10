import 'package:flutter/material.dart';

import '../../app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../add_property/add_property_page.dart';
import '../auth/data/auth_models.dart';
import '../auth/data/auth_service.dart';
import '../catalog/listings_shell_page.dart';
import '../property_details/property_details_page.dart';
import 'data/account_dashboard_service.dart';

class AccountDashboardPage extends StatefulWidget {
  const AccountDashboardPage({super.key, required this.user});

  final AuthUser user;

  @override
  State<AccountDashboardPage> createState() => _AccountDashboardPageState();
}

class _AccountDashboardPageState extends State<AccountDashboardPage> {
  late Future<AccountDashboardData> _dashboardFuture;

  @override
  void initState() {
    super.initState();
    _dashboardFuture = _loadDashboard();
  }

  Future<AccountDashboardData> _loadDashboard() {
    return AccountDashboardService().fetchDashboard(widget.user);
  }

  Future<void> _refreshDashboard() async {
    final future = _loadDashboard();
    setState(() {
      _dashboardFuture = future;
    });
    await future;
  }

  Future<void> _logout() async {
    await AuthService().clearSession();
    if (!mounted) return;
    Navigator.of(context).pushNamedAndRemoveUntil(
      AppRoutes.login,
      (route) => false,
    );
  }

  void _openListings({int initialIndex = 0}) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ListingsShellPage(
          onOpenProperty: _openPropertyDetails,
          initialIndex: initialIndex,
        ),
      ),
    );
  }

  void _openAddProperty() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => AddPropertyPage(user: widget.user),
      ),
    );
  }

  void _openPropertyDetails(int propertyId) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => PropertyDetailsPage(propertyId: propertyId),
      ),
    );
  }

  void _showComingSoon(String label) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$label will be available soon.')),
    );
  }

  void _showAccountSettings() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          ),
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 30),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Account details',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
              ),
              const SizedBox(height: 18),
              _SettingLine(label: 'Name', value: widget.user.name),
              _SettingLine(label: 'Email', value: widget.user.email),
              _SettingLine(
                label: 'Phone',
                value: widget.user.phone.isEmpty ? 'Not provided' : widget.user.phone,
              ),
              _SettingLine(
                label: 'Account type',
                value: widget.user.roleName.isEmpty ? 'Member' : widget.user.roleName,
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Close'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final initials = widget.user.name.trim().isEmpty
        ? 'A'
        : widget.user.name.trim().characters.first.toUpperCase();

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FB),
      appBar: AppBar(
        backgroundColor: Colors.white.withValues(alpha: 0.86),
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        titleSpacing: 24,
        title: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.surfaceLow,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Text(
                initials,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Account',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: IconButton(
              onPressed: _showAccountSettings,
              icon: const Icon(Icons.settings_outlined),
            ),
          ),
        ],
      ),
      body: FutureBuilder<AccountDashboardData>(
        future: _dashboardFuture,
        builder: (context, snapshot) {
          return RefreshIndicator(
            onRefresh: _refreshDashboard,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(24, 18, 24, 120),
              children: [
                _ProfileHero(user: widget.user),
                const SizedBox(height: 24),
                if (snapshot.connectionState == ConnectionState.waiting &&
                    !snapshot.hasData)
                  const _DashboardLoadingState()
                else if (snapshot.hasError)
                  _DashboardErrorState(
                    message: '${snapshot.error}',
                    onRetry: _refreshDashboard,
                  )
                else ...[
                  _StatsSection(data: snapshot.data!),
                  const SizedBox(height: 20),
                  _PrimaryActionButton(
                    onTap: _openAddProperty,
                  ),
                  const SizedBox(height: 28),
                  const _SectionTitle(title: 'Management'),
                  const SizedBox(height: 12),
                  _ManagementCard(
                    totalListings: snapshot.data!.totalListings,
                    onListingsTap: () => _openListings(initialIndex: 0),
                    onAddListingTap: _openAddProperty,
                    onSettingsTap: _showAccountSettings,
                    onLogoutTap: _logout,
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ProfileHero extends StatelessWidget {
  const _ProfileHero({required this.user});

  final AuthUser user;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Flexible(
              child: Text(
                user.name.isEmpty ? 'Your account' : user.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.9,
                    ),
              ),
            ),
            const SizedBox(width: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                _membershipLabel(user),
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.6,
                    ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Text(
          user.email.isEmpty ? 'No email available' : user.email,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.onSurfaceVariant,
                fontWeight: FontWeight.w600,
              ),
        ),
      ],
    );
  }

  String _membershipLabel(AuthUser user) {
    switch (user.roleId) {
      case 2:
      case 3:
        return 'PRO';
      default:
        return 'MEMBER';
    }
  }
}

class _StatsSection extends StatelessWidget {
  const _StatsSection({required this.data});

  final AccountDashboardData data;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _HighlightStatCard(
          title: 'Total Listings',
          value: '${data.totalListings}',
          icon: Icons.trending_up_rounded,
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: _CompactStatCard(
                title: 'Active Listings',
                value: '${data.activeListings}',
                icon: Icons.home_work_rounded,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: _CompactStatCard(
                title: 'Account Type',
                value: data.accountTypeLabel,
                icon: Icons.workspace_premium_rounded,
                compactText: true,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _HighlightStatCard extends StatelessWidget {
  const _HighlightStatCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  final String title;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 136,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.onSurfaceVariant,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1,
                ),
          ),
          const Spacer(),
          Row(
            children: [
              Text(
                value,
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w900,
                    ),
              ),
              const Spacer(),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(icon, color: AppColors.primary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CompactStatCard extends StatelessWidget {
  const _CompactStatCard({
    required this.title,
    required this.value,
    required this.icon,
    this.compactText = false,
  });

  final String title;
  final String value;
  final IconData icon;
  final bool compactText;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 136,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.onSurfaceVariant,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1,
                ),
          ),
          const Spacer(),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: Text(
                  value,
                  maxLines: compactText ? 2 : 1,
                  overflow: TextOverflow.ellipsis,
                  style: compactText
                      ? Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                          )
                      : Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                ),
              ),
              const SizedBox(width: 12),
              Icon(icon, color: AppColors.outline),
            ],
          ),
        ],
      ),
    );
  }
}

class _PrimaryActionButton extends StatelessWidget {
  const _PrimaryActionButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton.icon(
        onPressed: onTap,
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 18),
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(22),
          ),
        ),
        icon: const Icon(Icons.add_circle_rounded),
        label: const Text(
          'Add Listing',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title.toUpperCase(),
      style: Theme.of(context).textTheme.labelMedium?.copyWith(
            color: AppColors.onSurfaceVariant,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.2,
          ),
    );
  }
}

class _ManagementCard extends StatelessWidget {
  const _ManagementCard({
    required this.totalListings,
    required this.onListingsTap,
    required this.onAddListingTap,
    required this.onSettingsTap,
    required this.onLogoutTap,
  });

  final int totalListings;
  final VoidCallback onListingsTap;
  final VoidCallback onAddListingTap;
  final VoidCallback onSettingsTap;
  final VoidCallback onLogoutTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.24)),
      ),
      child: Column(
        children: [
          _ManagementTile(
            icon: Icons.home_work_rounded,
            title: 'My Listings',
            trailingLabel: '$totalListings Active',
            onTap: onListingsTap,
          ),
          _ManagementTile(
            icon: Icons.add_box_rounded,
            title: 'Add Listing',
            onTap: onAddListingTap,
          ),
          _ManagementTile(
            icon: Icons.manage_accounts_rounded,
            title: 'Account Settings',
            onTap: onSettingsTap,
          ),
          _ManagementTile(
            icon: Icons.logout_rounded,
            title: 'Log Out',
            onTap: onLogoutTap,
            iconColor: const Color(0xFFBA1A1A),
            textColor: const Color(0xFFBA1A1A),
            isLast: true,
          ),
        ],
      ),
    );
  }
}

class _ManagementTile extends StatelessWidget {
  const _ManagementTile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.trailingLabel,
    this.iconColor = AppColors.onSurfaceVariant,
    this.textColor = AppColors.onSurface,
    this.isLast = false,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final String? trailingLabel;
  final Color iconColor;
  final Color textColor;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          border: isLast
              ? null
              : Border(
                  bottom: BorderSide(
                    color: AppColors.outlineVariant.withValues(alpha: 0.2),
                  ),
                ),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.surfaceLow,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Icon(
                      icon,
                      color: iconColor,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: textColor,
                      fontWeight: FontWeight.w800,
                    ),
              ),
            ),
            if (trailingLabel != null && trailingLabel!.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  trailingLabel!,
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: AppColors.onSurfaceVariant,
                        fontWeight: FontWeight.w800,
                      ),
                ),
              ),
              const SizedBox(width: 10),
            ],
            const Icon(Icons.chevron_right_rounded, color: AppColors.outline),
          ],
        ),
      ),
    );
  }
}

class _SettingLine extends StatelessWidget {
  const _SettingLine({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: AppColors.onSurfaceVariant,
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}

class _DashboardLoadingState extends StatelessWidget {
  const _DashboardLoadingState();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        3,
        (index) => Container(
          height: index == 0 ? 136 : 96,
          margin: EdgeInsets.only(bottom: index == 2 ? 0 : 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
          ),
        ),
      ),
    );
  }
}

class _DashboardErrorState extends StatelessWidget {
  const _DashboardErrorState({
    required this.message,
    required this.onRetry,
  });

  final String message;
  final Future<void> Function() onRetry;

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
            'Could not load dashboard',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
          ),
          const SizedBox(height: 8),
          Text(message),
          const SizedBox(height: 14),
          FilledButton(
            onPressed: onRetry,
            child: const Text('Try again'),
          ),
        ],
      ),
    );
  }
}
