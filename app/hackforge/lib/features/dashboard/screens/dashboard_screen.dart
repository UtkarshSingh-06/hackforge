import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/services/analytics_service.dart';
import '../../../providers/language_provider.dart';
import '../../../app/routes.dart';
import '../../authentication/providers/auth_provider.dart';
import '../../subscriptions/providers/subscription_provider.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    AnalyticsService.logScreenView(screenName: 'dashboard_screen');
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<SubscriptionProvider>().startListening();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final languageProvider = context.watch<LanguageProvider>();
    final authProvider = context.watch<AuthProvider>();
    
    return Scaffold(
      appBar: AppBar(
        title: Text(
          languageProvider.currentLanguageCode == 'hi' 
              ? 'डैशबोर्ड'
              : 'Dashboard',
        ),
        actions: [
          IconButton(
            onPressed: () {
              _showLanguageSelector(context);
            },
            icon: const Icon(Icons.language),
          ),
          IconButton(
            onPressed: () {
              _showUserMenu(context);
            },
            icon: const Icon(Icons.account_circle),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Welcome Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      languageProvider.getTimeBasedGreeting(),
                      style: theme.textTheme.headlineSmall?.copyWith(
                        color: theme.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      authProvider.userModel?.name ?? 
                      (authProvider.isAnonymous 
                          ? (languageProvider.currentLanguageCode == 'hi' ? 'गेस्ट यूजर' : 'Guest User')
                          : (languageProvider.currentLanguageCode == 'hi' ? 'उपयोगकर्ता' : 'User')),
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      languageProvider.currentLanguageCode == 'hi' 
                          ? 'SubTracker Pro India में आपका स्वागत है!'
                          : 'Welcome to SubTracker Pro India!',
                      style: theme.textTheme.bodyLarge,
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Quick Stats Cards
            Consumer<SubscriptionProvider>(
              builder: (context, subscriptionProvider, child) {
                return Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        context,
                        title: languageProvider.currentLanguageCode == 'hi' 
                            ? 'कुल सब्स्क्रिप्शन'
                            : 'Total Subscriptions',
                        value: '${subscriptionProvider.activeSubscriptions.length}',
                        icon: Icons.subscriptions,
                        color: theme.primaryColor,
                        onTap: () {
                          Navigator.pushNamed(context, AppRoutes.subscriptions);
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildStatCard(
                        context,
                        title: languageProvider.currentLanguageCode == 'hi' 
                            ? 'मासिक खर्च'
                            : 'Monthly Spending',
                        value: '₹${subscriptionProvider.getTotalMonthlySpending().toStringAsFixed(0)}',
                        icon: Icons.currency_rupee,
                        color: Colors.green,
                        onTap: () {
                          Navigator.pushNamed(context, AppRoutes.subscriptions);
                        },
                      ),
                    ),
                  ],
                );
              },
            ),
            
            const SizedBox(height: 20),
            
            // Action Buttons
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pushNamed(context, AppRoutes.addSubscription);
              },
              icon: const Icon(Icons.add),
              label: Text(
                languageProvider.currentLanguageCode == 'hi' 
                    ? 'सब्स्क्रिप्शन जोड़ें'
                    : 'Add Subscription',
              ),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
            
            const SizedBox(height: 12),
            
            OutlinedButton.icon(
              onPressed: () {
                Navigator.pushNamed(context, AppRoutes.subscriptions);
              },
              icon: const Icon(Icons.subscriptions),
              label: Text(
                languageProvider.currentLanguageCode == 'hi' 
                    ? 'सभी सब्स्क्रिप्शन देखें'
                    : 'View All Subscriptions',
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),

            const SizedBox(height: 12),

            OutlinedButton.icon(
              onPressed: () {
                Navigator.pushNamed(context, AppRoutes.monthlySummary);
              },
              icon: const Icon(Icons.summarize_outlined),
              label: Text(
                languageProvider.currentLanguageCode == 'hi'
                    ? 'मासिक सारांश'
                    : 'Monthly summary',
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
            
            const Spacer(),
            
            // Bottom info
            if (authProvider.isAnonymous)
              Card(
                color: theme.primaryColor.withOpacity(0.1),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: theme.primaryColor,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        languageProvider.currentLanguageCode == 'hi' 
                            ? 'अपनी जानकारी सुरक्षित रखने के लिए खाता बनाएं'
                            : 'Create an account to save your data securely',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: () {
                          _showAccountLinkingDialog(context);
                        },
                        child: Text(
                          languageProvider.currentLanguageCode == 'hi' 
                              ? 'खाता बनाएं'
                              : 'Create Account',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    VoidCallback? onTap,
  }) {
    final theme = Theme.of(context);
    
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                icon,
                color: color,
                size: 28,
              ),
              const SizedBox(height: 12),
              Text(
                value,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                title,
                style: theme.textTheme.bodySmall,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showLanguageSelector(BuildContext context) {
    final languageProvider = context.read<LanguageProvider>();
    
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              languageProvider.currentLanguageCode == 'hi' 
                  ? 'भाषा चुनें'
                  : 'Choose Language',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: const Text('🇮🇳'),
              title: const Text('हिंदी'),
              subtitle: const Text('Hindi'),
              onTap: () {
                languageProvider.setHindi();
                Navigator.pop(context);
              },
              selected: languageProvider.isHindi,
            ),
            ListTile(
              leading: const Text('🇬🇧'),
              title: const Text('English'),
              subtitle: const Text('English'),
              onTap: () {
                languageProvider.setEnglish();
                Navigator.pop(context);
              },
              selected: languageProvider.isEnglish,
            ),
          ],
        ),
      ),
    );
  }

  void _showUserMenu(BuildContext context) {
    final authProvider = context.read<AuthProvider>();
    final languageProvider = context.read<LanguageProvider>();
    
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              languageProvider.currentLanguageCode == 'hi' 
                  ? 'खाता मेनू'
                  : 'Account Menu',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 20),
            if (!authProvider.isAnonymous) ...[
              ListTile(
                leading: const Icon(Icons.person),
                title: Text(
                  languageProvider.currentLanguageCode == 'hi' 
                      ? 'प्रोफाइल'
                      : 'Profile',
                ),
                onTap: () {
                  Navigator.pop(context);
                  _showComingSoon(context);
                },
              ),
              ListTile(
                leading: const Icon(Icons.settings),
                title: Text(
                  languageProvider.currentLanguageCode == 'hi' 
                      ? 'सेटिंग्स'
                      : 'Settings',
                ),
                onTap: () {
                  Navigator.pop(context);
                  _showComingSoon(context);
                },
              ),
            ],
            ListTile(
              leading: const Icon(Icons.logout),
              title: Text(
                languageProvider.currentLanguageCode == 'hi' 
                    ? 'लॉग आउट'
                    : 'Sign Out',
              ),
              onTap: () {
                Navigator.pop(context);
                _signOut();
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAccountLinkingDialog(BuildContext context) {
    final languageProvider = context.read<LanguageProvider>();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          languageProvider.currentLanguageCode == 'hi' 
              ? 'खाता बनाएं'
              : 'Create Account',
        ),
        content: Text(
          languageProvider.currentLanguageCode == 'hi' 
              ? 'आप Google या ईमेल के साथ खाता बना सकते हैं।'
              : 'You can create an account with Google or Email.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              languageProvider.currentLanguageCode == 'hi' 
                  ? 'रद्द करें'
                  : 'Cancel',
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _linkWithGoogle();
            },
            child: Text(
              languageProvider.currentLanguageCode == 'hi' 
                  ? 'Google के साथ'
                  : 'With Google',
            ),
          ),
        ],
      ),
    );
  }

  void _showComingSoon(BuildContext context) {
    final languageProvider = context.read<LanguageProvider>();
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          languageProvider.currentLanguageCode == 'hi' 
              ? 'यह फीचर जल्द ही आ रहा है!'
              : 'This feature is coming soon!',
        ),
        backgroundColor: Theme.of(context).primaryColor,
      ),
    );
  }

  Future<void> _signOut() async {
    final authProvider = context.read<AuthProvider>();
    await authProvider.signOut();
  }

  Future<void> _linkWithGoogle() async {
    final authProvider = context.read<AuthProvider>();
    final languageProvider = context.read<LanguageProvider>();
    
    final success = await authProvider.linkAnonymousAccount(useGoogle: true);
    
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            languageProvider.currentLanguageCode == 'hi' 
                ? 'खाता सफलतापूर्वक बनाया गया!'
                : 'Account created successfully!',
          ),
          backgroundColor: Colors.green,
        ),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            authProvider.error ?? 
            (languageProvider.currentLanguageCode == 'hi' 
                ? 'खाता बनाने में त्रुटि'
                : 'Error creating account'),
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}