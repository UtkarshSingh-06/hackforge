import React, { useMemo } from 'react';
import {
  ClipboardList,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
} from 'lucide-react';
import { Subscription, getTotalMonthlyCost, getTotalYearlyCost, getActiveSubscriptionsCount } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import {
  ActivityEntry,
  ActivityType,
  filterActivitiesInMonth,
  countActivityByType,
} from '../utils/activityLog';
import { createMonthlySubscriptionSummary } from '../utils/monthlySubscriptionSummary';

interface MonthlySummaryProps {
  subscriptions: Subscription[];
  activities: ActivityEntry[];
}

const activityMeta: Record<
  ActivityType,
  { label: string; icon: React.ReactNode; tone: 'blue' | 'green' | 'red' | 'orange' | 'gray' }
> = {
  add: {
    label: 'Added',
    icon: <Plus className="h-4 w-4" />,
    tone: 'green',
  },
  update: {
    label: 'Edited',
    icon: <Pencil className="h-4 w-4" />,
    tone: 'blue',
  },
  delete: {
    label: 'Deleted',
    icon: <Trash2 className="h-4 w-4" />,
    tone: 'red',
  },
  activate: {
    label: 'Activated',
    icon: <Power className="h-4 w-4" />,
    tone: 'green',
  },
  deactivate: {
    label: 'Deactivated',
    icon: <PowerOff className="h-4 w-4" />,
    tone: 'orange',
  },
};

const toneClasses: Record<typeof activityMeta[ActivityType]['tone'], string> = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  subscriptions,
  activities,
}) => {
  const now = useMemo(() => new Date(), []);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now),
    [now]
  );

  const monthActivities = useMemo(
    () => filterActivitiesInMonth(activities, now),
    [activities, now]
  );

  const counts = useMemo(() => countActivityByType(monthActivities), [monthActivities]);
  const totalActions = monthActivities.length;

  const subscriptionMonthSummary = useMemo(
    () => createMonthlySubscriptionSummary(subscriptions, now),
    [subscriptions, now]
  );

  const monthlyCost = getTotalMonthlyCost(subscriptions);
  const yearlyCost = getTotalYearlyCost(subscriptions);
  const activeCount = getActiveSubscriptionsCount(subscriptions);
  const totalSubscriptions = subscriptions.length;

  const statItems = [
    {
      title: 'Monthly cost (now)',
      value: formatCurrency(monthlyCost),
      icon: <DollarSign className="h-6 w-6" />,
      description: 'Active subscriptions combined',
      color: 'blue' as const,
    },
    {
      title: 'Yearly projection',
      value: formatCurrency(yearlyCost),
      icon: <TrendingUp className="h-6 w-6" />,
      description: 'Based on current plan costs',
      color: 'green' as const,
    },
    {
      title: 'Active subscriptions',
      value: activeCount.toString(),
      icon: <Calendar className="h-6 w-6" />,
      description: `${activeCount} of ${totalSubscriptions} total tracked`,
      color: 'orange' as const,
    },
    {
      title: 'Average per service',
      value: formatCurrency(activeCount > 0 ? monthlyCost / activeCount : 0),
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Monthly average across active plans',
      color: 'blue' as const,
    },
  ];

  const colorClasses: Record<'blue' | 'green' | 'orange', string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  const countRows: { type: ActivityType; label: string }[] = [
    { type: 'add', label: 'Subscriptions added' },
    { type: 'update', label: 'Edits saved' },
    { type: 'delete', label: 'Subscriptions removed' },
    { type: 'activate', label: 'Turned on' },
    { type: 'deactivate', label: 'Turned off' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Monthly summary</h2>
            <p className="text-gray-600">
              Activity and finances for <span className="font-medium text-gray-800">{monthLabel}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">App activity this month</h3>
        <p className="text-sm text-gray-500 mb-6">
          {totalActions === 0
            ? 'No changes were recorded this month yet. Add or edit a subscription to see your history here.'
            : `${totalActions} action${totalActions === 1 ? '' : 's'} logged in SubTracker this month.`}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {countRows.map(({ type, label }) => (
            <div
              key={type}
              className="rounded-lg border border-gray-200 p-4 bg-gray-50"
            >
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {label}
              </p>
              <p className="text-2xl font-bold text-gray-900">{counts[type]}</p>
            </div>
          ))}
        </div>

        {monthActivities.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent actions</h4>
            <ul
              className="space-y-3 border border-gray-200 rounded-lg divide-y divide-gray-200"
              style={{ maxHeight: '22rem', overflowY: 'auto' }}
            >
              {monthActivities.map((entry) => {
                const meta = activityMeta[entry.type];
                const when = new Date(entry.at);
                const timeStr = when.toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                });
                return (
                  <li key={entry.id} className="flex items-start gap-3 p-4 bg-white">
                    <div
                      className={`p-2 rounded-lg border flex-shrink-0 ${toneClasses[meta.tone]}`}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {meta.label}: <span className="text-gray-800">{entry.subscriptionName}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{timeStr}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Subscriptions held this month</h3>
        <p className="text-sm text-gray-500 mb-4">
          Includes every plan you were still tracking by the end of{' '}
          <span className="font-medium text-gray-700">{subscriptionMonthSummary.monthLabel}</span>.
          Spend counts renewals scheduled in that month (from each plan&apos;s cycle and next billing
          date). Savings shows the monthly equivalent of paused plans you are not paying right now.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Spend (billings in month)
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(subscriptionMonthSummary.totalSpendInMonth)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Recurring load (active)
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(subscriptionMonthSummary.totalMonthlyEquivalentActive)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Monthly equivalent</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-emerald-50 border-emerald-200">
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">
              Savings (paused)
            </p>
            <p className="text-2xl font-bold text-emerald-900">
              {formatCurrency(subscriptionMonthSummary.savingsFromPausedPerMonth)}
            </p>
            <p className="text-xs text-emerald-700 mt-1">Monthly equivalent not spent</p>
          </div>
        </div>

        {subscriptionMonthSummary.heldLineItems.length === 0 ? (
          <p className="text-sm text-gray-500">No subscriptions on your list for this month yet.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">Subscription</th>
                  <th className="px-4 py-2 font-medium">Category</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium text-right">Billings</th>
                  <th className="px-4 py-2 font-medium text-right">Spend in month</th>
                  <th className="px-4 py-2 font-medium text-right">~Monthly</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptionMonthSummary.heldLineItems.map((row) => (
                  <tr key={row.id} className="bg-white">
                    <td className="px-4 py-2 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-2 text-gray-600">{row.category}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          row.isActive
                            ? 'inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'
                            : 'inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700'
                        }
                      >
                        {row.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-gray-800">{row.billingsInMonth}</td>
                    <td className="px-4 py-2 text-right text-gray-800">
                      {formatCurrency(row.spendInMonth)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {formatCurrency(row.monthlyEquivalent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Finances snapshot</h3>
        <p className="text-gray-600 mb-6">
          Current totals from your subscription list (updates as you make changes).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg border ${colorClasses[stat.color]}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
