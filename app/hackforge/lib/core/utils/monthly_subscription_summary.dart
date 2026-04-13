import 'package:intl/intl.dart';

import '../../models/activity_entry.dart';
import '../../models/subscription_model.dart';

/// One row in the monthly subscription table.
class SubscriptionMonthLineItem {
  const SubscriptionMonthLineItem({
    required this.id,
    required this.name,
    required this.category,
    required this.isActive,
    required this.billingCycle,
    required this.billingsInMonth,
    required this.spendInMonth,
    required this.monthlyEquivalent,
  });

  final String id;
  final String name;
  final String category;
  final bool isActive;
  final BillingCycle billingCycle;
  final int billingsInMonth;
  final double spendInMonth;
  final double monthlyEquivalent;
}

/// Summary for a single calendar month (local timezone).
class MonthlySubscriptionSummary {
  const MonthlySubscriptionSummary({
    required this.year,
    required this.month,
    required this.monthLabel,
    required this.heldLineItems,
    required this.totalSpendInMonth,
    required this.totalMonthlyEquivalentActive,
    required this.savingsFromPausedPerMonth,
  });

  final int year;
  final int month;
  final String monthLabel;
  final List<SubscriptionMonthLineItem> heldLineItems;
  final double totalSpendInMonth;
  final double totalMonthlyEquivalentActive;
  final double savingsFromPausedPerMonth;
}

DateTime _startOfDay(DateTime d) => DateTime(d.year, d.month, d.day);

DateTime _addBillingCycle(DateTime d, BillingCycle cycle) {
  switch (cycle) {
    case BillingCycle.weekly:
      return d.add(const Duration(days: 7));
    case BillingCycle.monthly:
      return DateTime(d.year, d.month + 1, d.day);
    case BillingCycle.quarterly:
      return DateTime(d.year, d.month + 3, d.day);
    case BillingCycle.halfYearly:
      return DateTime(d.year, d.month + 6, d.day);
    case BillingCycle.yearly:
      return DateTime(d.year + 1, d.month, d.day);
  }
}

DateTime _subtractBillingCycle(DateTime d, BillingCycle cycle) {
  switch (cycle) {
    case BillingCycle.weekly:
      return d.subtract(const Duration(days: 7));
    case BillingCycle.monthly:
      return DateTime(d.year, d.month - 1, d.day);
    case BillingCycle.quarterly:
      return DateTime(d.year, d.month - 3, d.day);
    case BillingCycle.halfYearly:
      return DateTime(d.year, d.month - 6, d.day);
    case BillingCycle.yearly:
      return DateTime(d.year - 1, d.month, d.day);
  }
}

/// Counts renewal dates in `[start, end]` using the grid anchored at [nextBilling].
int countBillingsInMonthRange(
  DateTime nextBilling,
  BillingCycle cycle,
  DateTime rangeStart,
  DateTime rangeEnd,
) {
  var d = _startOfDay(nextBilling);
  final t0 = _startOfDay(rangeStart).millisecondsSinceEpoch;
  final t1 = _startOfDay(rangeEnd)
      .add(const Duration(days: 1))
      .subtract(const Duration(milliseconds: 1))
      .millisecondsSinceEpoch;

  while (d.millisecondsSinceEpoch > t1) {
    d = _subtractBillingCycle(d, cycle);
  }
  while (d.millisecondsSinceEpoch < t0) {
    d = _addBillingCycle(d, cycle);
  }

  var n = 0;
  while (d.millisecondsSinceEpoch <= t1) {
    if (d.millisecondsSinceEpoch >= t0) n++;
    d = _addBillingCycle(d, cycle);
  }
  return n;
}

/// Subscriptions still on the list by end of month: [createdAt] on or before that day.
bool wasSubscriptionHeldInMonth(SubscriptionModel sub, DateTime ref) {
  final end = ActivityEntryFilters.endOfMonth(ref);
  return !sub.createdAt.isAfter(end);
}

/// Builds spending, recurring load, and paused-savings for the calendar month of [refDate].
MonthlySubscriptionSummary createMonthlySubscriptionSummary(
  List<SubscriptionModel> subscriptions, [
  DateTime? refDate,
]) {
  final ref = refDate ?? DateTime.now();
  final start = ActivityEntryFilters.startOfMonth(ref);
  final end = ActivityEntryFilters.endOfMonth(ref);
  final monthLabel = DateFormat.yMMMM().format(start);

  final held = subscriptions.where((s) => wasSubscriptionHeldInMonth(s, ref)).toList();

  final heldLineItems = held.map((sub) {
    final monthlyEquivalent = sub.monthlyCost;
    final billingsInMonth = sub.isActive
        ? countBillingsInMonthRange(sub.nextBilling, sub.billingCycle, start, end)
        : 0;
    final spendInMonth = sub.isActive ? sub.cost * billingsInMonth : 0.0;

    return SubscriptionMonthLineItem(
      id: sub.id,
      name: sub.name,
      category: sub.category,
      isActive: sub.isActive,
      billingCycle: sub.billingCycle,
      billingsInMonth: billingsInMonth,
      spendInMonth: spendInMonth,
      monthlyEquivalent: monthlyEquivalent,
    );
  }).toList();

  final totalSpendInMonth =
      heldLineItems.fold<double>(0, (s, row) => s + row.spendInMonth);
  final totalMonthlyEquivalentActive = heldLineItems
      .where((r) => r.isActive)
      .fold<double>(0, (s, row) => s + row.monthlyEquivalent);
  final savingsFromPausedPerMonth = heldLineItems
      .where((r) => !r.isActive)
      .fold<double>(0, (s, row) => s + row.monthlyEquivalent);

  return MonthlySubscriptionSummary(
    year: start.year,
    month: start.month,
    monthLabel: monthLabel,
    heldLineItems: heldLineItems,
    totalSpendInMonth: totalSpendInMonth,
    totalMonthlyEquivalentActive: totalMonthlyEquivalentActive,
    savingsFromPausedPerMonth: savingsFromPausedPerMonth,
  );
}

/// Plain-text summary (e.g. share sheet, logs). Pass [formatMoney] for ₹ formatting.
String formatMonthlySubscriptionSummary(
  MonthlySubscriptionSummary summary, {
  required String Function(double) formatMoney,
}) {
  final b = StringBuffer()
    ..writeln('${summary.monthLabel}')
    ..writeln('Spend (billings in month): ${formatMoney(summary.totalSpendInMonth)}')
    ..writeln(
        'Recurring (active, monthly equivalent): ${formatMoney(summary.totalMonthlyEquivalentActive)}')
    ..writeln(
        'Savings from paused (monthly equivalent): ${formatMoney(summary.savingsFromPausedPerMonth)}')
    ..writeln()
    ..writeln('Held this month:');

  for (final row in summary.heldLineItems) {
    final status = row.isActive ? 'active' : 'paused';
    b.writeln(
      ' • ${row.name} (${row.category}) [$status] — ${row.billingsInMonth}× bill, '
      'spend ${formatMoney(row.spendInMonth)}, ~${formatMoney(row.monthlyEquivalent)}/mo',
    );
  }
  return b.toString();
}
