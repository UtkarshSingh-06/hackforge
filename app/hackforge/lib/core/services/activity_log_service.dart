import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../models/activity_entry.dart';

/// Persists subscription-related activity on device (per logged-in user).
class ActivityLogService {
  ActivityLogService._();
  static final ActivityLogService instance = ActivityLogService._();

  static const int _maxEntries = 500;
  static String _storageKey(String userId) =>
      'subscription_activity_log_v1_$userId';

  Future<List<ActivityEntry>> load(String userId) async {
    if (userId.isEmpty) return [];
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey(userId));
    if (raw == null || raw.isEmpty) return [];
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      return list
          .map((e) => ActivityEntry.fromJson(Map<String, dynamic>.from(e as Map)))
          .where((e) => e.id.isNotEmpty)
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> save(String userId, List<ActivityEntry> entries) async {
    if (userId.isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    final trimmed = entries.take(_maxEntries).toList();
    await prefs.setString(
      _storageKey(userId),
      jsonEncode(trimmed.map((e) => e.toJson()).toList()),
    );
  }

  Future<List<ActivityEntry>> append(
    String userId,
    List<ActivityEntry> current,
    ActivityType type,
    String subscriptionId,
    String subscriptionName,
  ) async {
    if (userId.isEmpty) return current;
    final entry = ActivityEntry(
      id: '${DateTime.now().millisecondsSinceEpoch}_'
          '${subscriptionId.hashCode.abs()}',
      at: DateTime.now(),
      type: type,
      subscriptionId: subscriptionId,
      subscriptionName: subscriptionName,
    );
    final next = [entry, ...current].take(_maxEntries).toList();
    await save(userId, next);
    return next;
  }
}
