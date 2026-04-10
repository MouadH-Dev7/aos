import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import 'app_shimmer.dart';

class AppCachedImage extends StatelessWidget {
  const AppCachedImage({
    super.key,
    required this.imageUrl,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.placeholderIcon = Icons.image_outlined,
  });

  final String imageUrl;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final IconData placeholderIcon;

  @override
  Widget build(BuildContext context) {
    final fallback = Container(
      color: const Color(0xFFE9EEF6),
      alignment: Alignment.center,
      child: Icon(
        placeholderIcon,
        size: 42,
        color: AppColors.outline,
      ),
    );

    Widget child;
    if (imageUrl.trim().isEmpty) {
      child = fallback;
    } else {
      child = CachedNetworkImage(
        imageUrl: imageUrl,
        fit: fit,
        fadeInDuration: const Duration(milliseconds: 120),
        placeholderFadeInDuration: const Duration(milliseconds: 120),
        placeholder: (context, url) => const ShimmerBox(
          height: double.infinity,
          borderRadius: BorderRadius.zero,
        ),
        errorWidget: (context, url, error) => fallback,
      );
    }

    if (borderRadius == null) return child;
    return ClipRRect(borderRadius: borderRadius!, child: child);
  }
}
