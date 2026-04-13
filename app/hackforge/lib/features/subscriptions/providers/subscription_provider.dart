import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import '../../../models/activity_entry.dart';
import '../../../models/subscription_model.dart';
import '../../../core/services/activity_log_service.dart';
import '../../../core/services/subscription_service.dart';
import '../../../core/utils/monthly_subscription_summary.dart';

class SubscriptionProvider extends ChangeNotifier {
  final SubscriptionService _subscriptionService = SubscriptionService();

  List<SubscriptionModel> _subscriptions = [];
  List<ActivityEntry> _activities = [];
  Map<String, dynamic> _analytics = {};
  bool _isLoading = false;
  String? _error;

  String get _userId => FirebaseAuth.instance.currentUser?.uid ?? '';

  // Getters
  List<SubscriptionModel> get subscriptions => _subscriptions;
  List<ActivityEntry> get activities => List.unmodifiable(_activities);
  List<SubscriptionModel> get activeSubscriptions => 
      _subscriptions.where((s) => s.isActive).toList();
  List<SubscriptionModel> get pausedSubscriptions => 
      _subscriptions.where((s) => !s.isActive).toList();
  Map<String, dynamic> get analytics => _analytics;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Stream subscription
  Stream<List<SubscriptionModel>>? _subscriptionStream;
  StreamSubscription<List<SubscriptionModel>>? _subscriptionSub;
  bool _listening = false;

  Future<void> _reloadActivityLog() async {
    if (_userId.isEmpty) {
      _activities = [];
      return;
    }
    _activities = await ActivityLogService.instance.load(_userId);
    notifyListeners();
  }

  Future<void> _appendActivity(
    ActivityType type,
    String subscriptionId,
    String subscriptionName,
  ) async {
    if (_userId.isEmpty) return;
    _activities = await ActivityLogService.instance.append(
      _userId,
      _activities,
      type,
      subscriptionId,
      subscriptionName,
    );
    notifyListeners();
  }

  void startListening() {
    _reloadActivityLog();
    if (_listening) return;
    _listening = true;
    _subscriptionStream = _subscriptionService.getSubscriptions();
    _subscriptionSub = _subscriptionStream!.listen(
      (subscriptions) {
        _subscriptions = subscriptions;
        _error = null;
        notifyListeners();
        _loadAnalytics();
      },
      onError: (error) {
        _error = error.toString();
        notifyListeners();
      },
    );
  }

  // Add subscription
  Future<void> addSubscription(SubscriptionModel subscription) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      await _subscriptionService.addSubscription(subscription);
      await _appendActivity(
        ActivityType.add,
        subscription.id,
        subscription.name,
      );
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update subscription
  Future<void> updateSubscription(SubscriptionModel subscription) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      await _subscriptionService.updateSubscription(subscription);
      await _appendActivity(
        ActivityType.update,
        subscription.id,
        subscription.name,
      );
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Delete subscription
  Future<void> deleteSubscription(String subscriptionId) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      String? name;
      for (final s in _subscriptions) {
        if (s.id == subscriptionId) {
          name = s.name;
          break;
        }
      }

      await _subscriptionService.deleteSubscription(subscriptionId);
      if (name != null) {
        await _appendActivity(
          ActivityType.delete,
          subscriptionId,
          name,
        );
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Toggle subscription status
  Future<void> toggleSubscriptionStatus(String subscriptionId) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      SubscriptionModel? existing;
      for (final s in _subscriptions) {
        if (s.id == subscriptionId) {
          existing = s;
          break;
        }
      }

      await _subscriptionService.toggleSubscriptionStatus(subscriptionId);
      if (existing != null) {
        final wasActive = existing.isActive;
        await _appendActivity(
          wasActive ? ActivityType.deactivate : ActivityType.activate,
          subscriptionId,
          existing.name,
        );
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load analytics
  Future<void> _loadAnalytics() async {
    try {
      _analytics = await _subscriptionService.getSubscriptionAnalytics();
    } catch (e) {
      if (kDebugMode) {
        print('Error loading analytics: $e');
      }
    }
  }

  // Get subscriptions by category
  List<SubscriptionModel> getSubscriptionsByCategory(String category) {
    return _subscriptions
        .where((subscription) => subscription.category == category)
        .toList();
  }

  // Get subscriptions needing renewal soon
  List<SubscriptionModel> getSubscriptionsNeedingRenewal([int days = 7]) {
    return _subscriptions
        .where((subscription) => 
            subscription.isActive && 
            subscription.daysUntilRenewal <= days &&
            subscription.daysUntilRenewal >= 0)
        .toList();
  }

  // Get overdue subscriptions
  List<SubscriptionModel> getOverdueSubscriptions() {
    return _subscriptions
        .where((subscription) => 
            subscription.isActive && subscription.daysUntilRenewal < 0)
        .toList();
  }

  // Search subscriptions
  Future<List<SubscriptionModel>> searchSubscriptions(String query) async {
    try {
      return await _subscriptionService.searchSubscriptions(query);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return [];
    }
  }

  /// Calendar-month view of held subscriptions, billings in month, spend, and paused savings.
  MonthlySubscriptionSummary monthlySubscriptionSummary([DateTime? ref]) {
    return createMonthlySubscriptionSummary(_subscriptions, ref);
  }

  // Calculate total spending
  double getTotalMonthlySpending() {
    return activeSubscriptions.fold(0, (sum, subscription) => sum + subscription.monthlyCost);
  }

  double getTotalYearlySpending() {
    return activeSubscriptions.fold(0, (sum, subscription) => sum + subscription.yearlyCost);
  }

  // Get spending by category
  Map<String, double> getMonthlySpendingByCategory() {
    final Map<String, double> categorySpending = {};
    
    for (final subscription in activeSubscriptions) {
      categorySpending[subscription.category] = 
          (categorySpending[subscription.category] ?? 0) + subscription.monthlyCost;
    }
    
    return categorySpending;
  }

  // Get billing cycle distribution
  Map<BillingCycle, int> getBillingCycleDistribution() {
    final Map<BillingCycle, int> distribution = {};
    
    for (final subscription in activeSubscriptions) {
      distribution[subscription.billingCycle] = 
          (distribution[subscription.billingCycle] ?? 0) + 1;
    }
    
    return distribution;
  }

  // Refresh data
  Future<void> refresh() async {
    await _loadAnalytics();
    await _reloadActivityLog();
    notifyListeners();
  }

  @override
  void dispose() {
    _subscriptionSub?.cancel();
    super.dispose();
  }
}