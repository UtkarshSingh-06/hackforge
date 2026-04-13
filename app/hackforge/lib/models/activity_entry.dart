enum ActivityType {
  add,
  update,
  delete,
  activate,
  deactivate,
}

class ActivityEntry {
  final String id;
  final DateTime at;
  final ActivityType type;
  final String subscriptionId;
  final String subscriptionName;

  const ActivityEntry({
    required this.id,
    required this.at,
    required this.type,
    required this.subscriptionId,
    required this.subscriptionName,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'at': at.toIso8601String(),
        'type': type.name,
        'subscriptionId': subscriptionId,
        'subscriptionName': subscriptionName,
      };

  factory ActivityEntry.fromJson(Map<String, dynamic> json) {
    return ActivityEntry(
      id: json['id'] as String? ?? '',
      at: DateTime.tryParse(json['at'] as String? ?? '') ?? DateTime.now(),
      type: ActivityType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => ActivityType.update,
      ),
      subscriptionId: json['subscriptionId'] as String? ?? '',
      subscriptionName: json['subscriptionName'] as String? ?? '',
    );
  }
}

/// Helpers for monthly summary (calendar month in local timezone).
class ActivityEntryFilters {
  ActivityEntryFilters._();

  static DateTime startOfMonth(DateTime ref) =>
      DateTime(ref.year, ref.month, 1);

  static DateTime endOfMonth(DateTime ref) =>
      DateTime(ref.year, ref.month + 1, 0, 23, 59, 59, 999);

  static List<ActivityEntry> inCalendarMonth(
    List<ActivityEntry> entries,
    DateTime ref,
  ) {
    final start = startOfMonth(ref);
    final end = endOfMonth(ref);
    return entries.where((e) {
      return !e.at.isBefore(start) && !e.at.isAfter(end);
    }).toList()
      ..sort((a, b) => b.at.compareTo(a.at));
  }

  static Map<ActivityType, int> countByType(List<ActivityEntry> entries) {
    final map = {
      for (final t in ActivityType.values) t: 0,
    };
    for (final e in entries) {
      map[e.type] = (map[e.type] ?? 0) + 1;
    }
    return map;
  }
}
