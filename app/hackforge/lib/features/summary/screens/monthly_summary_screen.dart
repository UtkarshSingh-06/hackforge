import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/monthly_subscription_summary.dart';
import '../../../models/activity_entry.dart';
import '../../../models/subscription_model.dart';
import '../../../providers/language_provider.dart';
import '../../subscriptions/providers/subscription_provider.dart';

class MonthlySummaryScreen extends StatefulWidget {
  const MonthlySummaryScreen({super.key});

  @override
  State<MonthlySummaryScreen> createState() => _MonthlySummaryScreenState();
}

class _MonthlySummaryScreenState extends State<MonthlySummaryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<SubscriptionProvider>().startListening();
    });
  }

  String _label(ActivityType type, bool hindi) {
    if (hindi) {
      switch (type) {
        case ActivityType.add:
          return 'जोड़ा गया';
        case ActivityType.update:
          return 'संपादित';
        case ActivityType.delete:
          return 'हटाया गया';
        case ActivityType.activate:
          return 'चालू किया';
        case ActivityType.deactivate:
          return 'बंद किया';
      }
    }
    switch (type) {
      case ActivityType.add:
        return 'Added';
      case ActivityType.update:
        return 'Edited';
      case ActivityType.delete:
        return 'Deleted';
      case ActivityType.activate:
        return 'Activated';
      case ActivityType.deactivate:
        return 'Deactivated';
    }
  }

  String _countTitle(ActivityType type, bool hindi) {
    if (hindi) {
      switch (type) {
        case ActivityType.add:
          return 'नए जोड़े';
        case ActivityType.update:
          return 'संपादन';
        case ActivityType.delete:
          return 'हटाए गए';
        case ActivityType.activate:
          return 'चालू';
        case ActivityType.deactivate:
          return 'बंद';
      }
    }
    switch (type) {
      case ActivityType.add:
        return 'Added';
      case ActivityType.update:
        return 'Edits';
      case ActivityType.delete:
        return 'Deleted';
      case ActivityType.activate:
        return 'Activated';
      case ActivityType.deactivate:
        return 'Deactivated';
    }
  }

  String _billingShort(BillingCycle c, bool hindi) {
    if (hindi) {
      switch (c) {
        case BillingCycle.weekly:
          return 'साप्ताहिक';
        case BillingCycle.monthly:
          return 'मासिक';
        case BillingCycle.quarterly:
          return 'त्रैमासिक';
        case BillingCycle.halfYearly:
          return 'अर्धवार्षिक';
        case BillingCycle.yearly:
          return 'वार्षिक';
      }
    }
    switch (c) {
      case BillingCycle.weekly:
        return 'Weekly';
      case BillingCycle.monthly:
        return 'Monthly';
      case BillingCycle.quarterly:
        return 'Quarterly';
      case BillingCycle.halfYearly:
        return 'Half-yearly';
      case BillingCycle.yearly:
        return 'Yearly';
    }
  }

  Future<void> _copySummary(
    BuildContext context,
    MonthlySubscriptionSummary summary,
    bool hindi,
  ) async {
    final text = formatMonthlySubscriptionSummary(
      summary,
      formatMoney: (v) => CurrencyFormatter.formatIndianCurrencyWithDecimals(
        v,
        decimalPlaces: 0,
      ),
    );
    await Clipboard.setData(ClipboardData(text: text));
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          hindi ? 'सारांश कॉपी हो गया' : 'Summary copied to clipboard',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final language = context.watch<LanguageProvider>();
    final hindi = language.currentLanguageCode == 'hi';

    return Scaffold(
      appBar: AppBar(
        title: Text(
          hindi ? 'मासिक सारांश' : 'Monthly summary',
        ),
        elevation: 0,
        actions: [
          Consumer<SubscriptionProvider>(
            builder: (context, provider, _) {
              final summary = provider.monthlySubscriptionSummary(DateTime.now());
              return IconButton(
                tooltip: hindi ? 'टेक्स्ट कॉपी करें' : 'Copy text summary',
                icon: const Icon(Icons.copy_outlined),
                onPressed: () => _copySummary(context, summary, hindi),
              );
            },
          ),
        ],
      ),
      body: Consumer<SubscriptionProvider>(
        builder: (context, provider, _) {
          final now = DateTime.now();
          final monthTitle = DateFormat.yMMMM().format(now);
          final monthEntries = ActivityEntryFilters.inCalendarMonth(
            provider.activities,
            now,
          );
          final counts = ActivityEntryFilters.countByType(monthEntries);

          final monthlySpend = provider.getTotalMonthlySpending();
          final yearlySpend = provider.getTotalYearlySpending();
          final active = provider.activeSubscriptions.length;
          final total = provider.subscriptions.length;
          final avg = active > 0 ? monthlySpend / active : 0.0;

          final subSummary = provider.monthlySubscriptionSummary(now);

          return RefreshIndicator(
            onRefresh: () async {
              await provider.refresh();
            },
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  hindi
                      ? 'इस महीने की गतिविधि ($monthTitle)'
                      : 'Activity this month ($monthTitle)',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  monthEntries.isEmpty
                      ? (hindi
                          ? 'इस महीने अभी तक कोई बदलाव दर्ज नहीं। सब्स्क्रिप्शन जोड़ें या बदलें।'
                          : 'No changes recorded this month yet. Add or edit a subscription to build your history.')
                      : (hindi
                          ? '${monthEntries.length} कार्रवाई दर्ज'
                          : '${monthEntries.length} action(s) logged'),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade700,
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: ActivityType.values.map((t) {
                    return SizedBox(
                      width: (MediaQuery.of(context).size.width - 40) / 2,
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _countTitle(t, hindi),
                                style: theme.textTheme.labelSmall?.copyWith(
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${counts[t] ?? 0}',
                                style: theme.textTheme.headlineSmall?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                if (monthEntries.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Text(
                    hindi ? 'हाल की गतिविधि' : 'Recent actions',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...monthEntries.take(50).map((e) {
                    final when = DateFormat.MMMd().add_jm().format(e.at);
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: theme.primaryColor.withOpacity(0.12),
                          child: Icon(
                            _iconFor(e.type),
                            color: theme.primaryColor,
                            size: 20,
                          ),
                        ),
                        title: Text(
                          '${_label(e.type, hindi)}: ${e.subscriptionName}',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        subtitle: Text(when),
                      ),
                    );
                  }),
                ],
                const SizedBox(height: 24),
                Text(
                  hindi
                      ? 'इस महीने की सब्स्क्रिप्शन ($monthTitle)'
                      : 'Subscriptions this month ($monthTitle)',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  hindi
                      ? 'महीने के अंत तक आपकी सूची में जो योजनाएँ थीं। खर्च = इस महीने निर्धारित नवीनीकरण; बचत = रोके हुए प्लान का मासिक समतुल्य।'
                      : 'Plans you were still tracking by month end. Spend counts renewals scheduled this month. Savings is the monthly equivalent of paused plans.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade700,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _metricCard(
                        context,
                        hindi ? 'महीने में खर्च' : 'Spend (billings)',
                        CurrencyFormatter.formatIndianCurrencyWithDecimals(
                          subSummary.totalSpendInMonth,
                          decimalPlaces: 0,
                        ),
                        Colors.blue.shade700,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _metricCard(
                        context,
                        hindi ? 'सक्रिय बोझ (मासिक)' : 'Recurring (active)',
                        CurrencyFormatter.formatIndianCurrencyWithDecimals(
                          subSummary.totalMonthlyEquivalentActive,
                          decimalPlaces: 0,
                        ),
                        Colors.green.shade800,
                        subtitle: hindi ? 'समतुल्य' : 'Monthly equivalent',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _metricCard(
                        context,
                        hindi ? 'बचत (रोका)' : 'Savings (paused)',
                        CurrencyFormatter.formatIndianCurrencyWithDecimals(
                          subSummary.savingsFromPausedPerMonth,
                          decimalPlaces: 0,
                        ),
                        Colors.teal.shade800,
                        subtitle: hindi ? 'समतुल्य' : 'Monthly equivalent',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (subSummary.heldLineItems.isEmpty)
                  Text(
                    hindi
                        ? 'इस महीने कोई सब्स्क्रिप्शन नहीं।'
                        : 'No subscriptions on your list for this month yet.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.grey.shade600,
                    ),
                  )
                else
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: DataTable(
                      headingRowColor: MaterialStateProperty.all(
                        Colors.grey.shade100,
                      ),
                      columns: [
                        DataColumn(
                            label: Text(hindi ? 'सेवा' : 'Subscription')),
                        DataColumn(label: Text(hindi ? 'श्रेणी' : 'Category')),
                        DataColumn(label: Text(hindi ? 'चक्र' : 'Cycle')),
                        DataColumn(label: Text(hindi ? 'स्थिति' : 'Status')),
                        DataColumn(
                          label: Text(hindi ? 'बिल' : 'Billings'),
                          numeric: true,
                        ),
                        DataColumn(
                          label: Text(hindi ? 'खर्च' : 'Spend'),
                          numeric: true,
                        ),
                        DataColumn(
                          label: Text(hindi ? '~मासिक' : '~Monthly'),
                          numeric: true,
                        ),
                      ],
                      rows: subSummary.heldLineItems.map((row) {
                        return DataRow(
                          cells: [
                            DataCell(Text(row.name,
                                style: const TextStyle(
                                    fontWeight: FontWeight.w500))),
                            DataCell(Text(row.category)),
                            DataCell(Text(
                                _billingShort(row.billingCycle, hindi))),
                            DataCell(Text(
                              row.isActive
                                  ? (hindi ? 'चालू' : 'Active')
                                  : (hindi ? 'रोका' : 'Paused'),
                              style: TextStyle(
                                color: row.isActive
                                    ? Colors.green.shade800
                                    : Colors.grey.shade700,
                                fontWeight: FontWeight.w500,
                              ),
                            )),
                            DataCell(Text('${row.billingsInMonth}')),
                            DataCell(Text(
                              CurrencyFormatter.formatIndianCurrencyWithDecimals(
                                row.spendInMonth,
                                decimalPlaces: 0,
                              ),
                            )),
                            DataCell(Text(
                              CurrencyFormatter.formatIndianCurrencyWithDecimals(
                                row.monthlyEquivalent,
                                decimalPlaces: 0,
                              ),
                            )),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
                const SizedBox(height: 24),
                Text(
                  hindi ? 'वित्तीय स्थिति (अभी)' : 'Finances snapshot (now)',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  hindi
                      ? 'आपकी सब्स्क्रिप्शन सूची के वर्तमान योग।'
                      : 'Current totals from your subscription list.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade700,
                  ),
                ),
                const SizedBox(height: 12),
                _snapshotRow(
                  context,
                  hindi ? 'मासिक खर्च' : 'Monthly spend',
                  CurrencyFormatter.formatIndianCurrency(monthlySpend),
                ),
                _snapshotRow(
                  context,
                  hindi ? 'वार्षिक अनुमान' : 'Yearly projection',
                  CurrencyFormatter.formatIndianCurrency(yearlySpend),
                ),
                _snapshotRow(
                  context,
                  hindi ? 'सक्रिय सब्स्क्रिप्शन' : 'Active subscriptions',
                  '$active / $total',
                ),
                _snapshotRow(
                  context,
                  hindi ? 'प्रति सेवा औसत (मासिक)' : 'Avg per service (monthly)',
                  CurrencyFormatter.formatIndianCurrency(avg),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _metricCard(
    BuildContext context,
    String title,
    String value,
    Color valueColor, {
    String? subtitle,
  }) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.labelSmall?.copyWith(
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: theme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: valueColor,
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: theme.textTheme.labelSmall?.copyWith(
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  IconData _iconFor(ActivityType type) {
    switch (type) {
      case ActivityType.add:
        return Icons.add_circle_outline;
      case ActivityType.update:
        return Icons.edit_outlined;
      case ActivityType.delete:
        return Icons.delete_outline;
      case ActivityType.activate:
        return Icons.play_circle_outline;
      case ActivityType.deactivate:
        return Icons.pause_circle_outline;
    }
  }

  Widget _snapshotRow(BuildContext context, String label, String value) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(label),
        trailing: Text(
          value,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
      ),
    );
  }
}
