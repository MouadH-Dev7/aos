import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../auth/data/auth_models.dart';
import '../data/home_models.dart';

class SearchPanel extends StatelessWidget {
  const SearchPanel({
    super.key,
    required this.searchController,
    required this.categories,
    required this.types,
    required this.selectedCategoryId,
    required this.selectedTypeId,
    required this.wilayas,
    required this.dairas,
    required this.communes,
    required this.selectedWilayaId,
    required this.selectedDairaId,
    required this.selectedCommuneId,
    required this.onSearchChanged,
    required this.onCategoryChanged,
    required this.onTypeChanged,
    required this.onWilayaChanged,
    required this.onDairaChanged,
    required this.onCommuneChanged,
    this.onSearchSubmitted,
  });

  final TextEditingController searchController;
  final List<HomeFilterOption> categories;
  final List<HomeFilterOption> types;
  final List<LocationItem> wilayas;
  final List<LocationItem> dairas;
  final List<LocationItem> communes;
  final int? selectedCategoryId;
  final int? selectedTypeId;
  final int? selectedWilayaId;
  final int? selectedDairaId;
  final int? selectedCommuneId;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<int?> onCategoryChanged;
  final ValueChanged<int?> onTypeChanged;
  final ValueChanged<int?> onWilayaChanged;
  final ValueChanged<int?> onDairaChanged;
  final ValueChanged<int?> onCommuneChanged;
  final VoidCallback? onSearchSubmitted;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 26,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Discover your next address',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
              letterSpacing: -0.4,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Search by listing title, then refine by category and type.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.onSurfaceVariant,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: searchController,
            textInputAction: TextInputAction.search,
            onChanged: onSearchChanged,
            onSubmitted: (_) => onSearchSubmitted?.call(),
            decoration: InputDecoration(
              hintText: 'Search by listing title',
              hintStyle: const TextStyle(color: AppColors.onSurfaceVariant),
              prefixIcon: const Icon(Icons.search_rounded),
              suffixIcon: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (searchController.text.isNotEmpty)
                    IconButton(
                      onPressed: () {
                        searchController.clear();
                        onSearchChanged('');
                        onSearchSubmitted?.call();
                      },
                      icon: const Icon(Icons.close_rounded),
                    ),
                  IconButton(
                    onPressed: onSearchSubmitted,
                    icon: const Icon(Icons.search_rounded),
                  ),
                ],
              ),
              filled: true,
              fillColor: const Color(0xFFF6F8FC),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(22),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(vertical: 20),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _FilterDropdown(
                  label: 'Category',
                  value: selectedCategoryId,
                  items: categories,
                  onChanged: onCategoryChanged,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _FilterDropdown(
                  label: 'Type',
                  value: selectedTypeId,
                  items: types,
                  onChanged: onTypeChanged,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _LocationDropdown(
                  label: 'Wilaya',
                  value: selectedWilayaId,
                  items: wilayas,
                  onChanged: onWilayaChanged,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _LocationDropdown(
                  label: 'Daira',
                  value: selectedDairaId,
                  items: dairas,
                  onChanged: onDairaChanged,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _LocationDropdown(
                  label: 'Commune',
                  value: selectedCommuneId,
                  items: communes,
                  onChanged: onCommuneChanged,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FilterDropdown extends StatelessWidget {
  const _FilterDropdown({
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final String label;
  final int? value;
  final List<HomeFilterOption> items;
  final ValueChanged<int?> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<int>(
      initialValue: value,
      isExpanded: true,
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: const Color(0xFFF6F8FC),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide.none,
        ),
      ),
      items: [
        const DropdownMenuItem<int>(
          value: null,
          child: Text('All'),
        ),
        ...items.map(
          (item) => DropdownMenuItem<int>(
            value: item.id,
            child: Text(
              item.name,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
      ],
    );
  }
}

class _LocationDropdown extends StatelessWidget {
  const _LocationDropdown({
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final String label;
  final int? value;
  final List<LocationItem> items;
  final ValueChanged<int?> onChanged;

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<int>(
      initialValue: value,
      isExpanded: true,
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: const Color(0xFFF6F8FC),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(22),
          borderSide: BorderSide.none,
        ),
      ),
      items: [
        const DropdownMenuItem<int>(
          value: null,
          child: Text('All'),
        ),
        ...items.map(
          (item) => DropdownMenuItem<int>(
            value: item.id,
            child: Text(
              item.name,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
      ],
    );
  }
}
