import 'package:flutter/material.dart';

import 'app_routes.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/data/auth_models.dart';
import 'features/auth/data/auth_service.dart';
import 'features/auth/login/login_page.dart';
import 'features/onboarding/onboarding_page.dart';
import 'package:app_immo_dz/features/home/home_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ImmoApp extends StatelessWidget {
  const ImmoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Immo DZ',
      theme: AppTheme.lightTheme,
      routes: {
        AppRoutes.onboarding: (_) => const OnboardingPage(),
        AppRoutes.login: (_) => const LoginPage(),
      },
      onGenerateRoute: (settings) {
        if (settings.name == AppRoutes.home) {
          final user = settings.arguments as AuthUser;
          return MaterialPageRoute<void>(
            builder: (_) => HomePage(user: user),
            settings: settings,
          );
        }
        return null;
      },
      home: const AuthGate(),
    );
  }
}

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final AuthService _authService = AuthService();
  AuthUser _savedUser = AuthUser.guest;
  bool _loading = true;
  bool _onboardingSeen = false;

  @override
  void initState() {
    super.initState();
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final onboardingSeen =
        prefs.getBool(OnboardingPage.completedKey) ?? false;
    final hasSession = await _authService.hasSession();
    final user = hasSession
        ? (await _authService.getSavedUser()) ?? AuthUser.guest
        : AuthUser.guest;
    if (!mounted) return;
    setState(() {
      _onboardingSeen = onboardingSeen;
      _savedUser = user;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (!_onboardingSeen) {
      return const OnboardingPage();
    }

    if (_savedUser.isGuest) {
      return const LoginPage();
    }

    return HomePage(user: _savedUser);
  }
}
