import {
  BillingCycle,
  Subscription,
  calculateMonthlyCost,
} from './calculations';
import { getCalendarMonthRange } from './activityLog';
import { formatCurrency } from './formatters';

export interface SubscriptionMonthLineItem {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
  billingCycle: BillingCycle;
  /** Number of billing events scheduled in this calendar month (active only). */
  billingsInMonth: number;
  /** `cost` × `billingsInMonth` for active subscriptions. */
  spendInMonth: number;
  /** Normalized monthly cost (same basis as dashboard). */
  monthlyEquivalent: number;
}

export interface MonthlySubscriptionSummary {
  year: number;
  month: number;
  monthLabel: string;
  /** Subscriptions that existed at any point in the month (`dateAdded` ≤ month end). */
  heldLineItems: SubscriptionMonthLineItem[];
  /** Sum of `spendInMonth` across active held subscriptions. */
  totalSpendInMonth: number;
  /** Sum of monthly equivalents for active held subscriptions. */
  totalMonthlyEquivalentActive: number;
  /**
   * Monthly-equivalent amount not spent on paused (inactive) subscriptions you still track.
   * Interpreted as “savings” from having those plans paused this month.
   */
  savingsFromPausedPerMonth: number;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addBillingCycle(d: Date, cycle: BillingCycle): Date {
  const x = new Date(d.getTime());
  switch (cycle) {
    case 'weekly':
      x.setDate(x.getDate() + 7);
      return x;
    case 'monthly':
      x.setMonth(x.getMonth() + 1);
      return x;
    case 'quarterly':
      x.setMonth(x.getMonth() + 3);
      return x;
    case 'yearly':
      x.setFullYear(x.getFullYear() + 1);
      return x;
  }
}

function subtractBillingCycle(d: Date, cycle: BillingCycle): Date {
  const x = new Date(d.getTime());
  switch (cycle) {
    case 'weekly':
      x.setDate(x.getDate() - 7);
      return x;
    case 'monthly':
      x.setMonth(x.getMonth() - 1);
      return x;
    case 'quarterly':
      x.setMonth(x.getMonth() - 3);
      return x;
    case 'yearly':
      x.setFullYear(x.getFullYear() - 1);
      return x;
  }
}

/**
 * How many times a subscription renews inside [start, end] inclusive,
 * following the billing grid anchored at `nextBilling`.
 */
export function countBillingsInMonthRange(
  nextBillingIso: string,
  cycle: BillingCycle,
  start: Date,
  end: Date
): number {
  let d = startOfDay(new Date(nextBillingIso));
  const t0 = startOfDay(start).getTime();
  const t1 = startOfDay(end).getTime() + 86400000 - 1; // end of local calendar day

  while (d.getTime() > t1) {
    d = subtractBillingCycle(d, cycle);
  }
  while (d.getTime() < t0) {
    d = addBillingCycle(d, cycle);
  }

  let n = 0;
  while (d.getTime() <= t1) {
    if (d.getTime() >= t0) n++;
    d = addBillingCycle(d, cycle);
  }
  return n;
}

function wasHeldInMonth(sub: Subscription, monthEnd: Date): boolean {
  const added = startOfDay(new Date(sub.dateAdded));
  return added.getTime() <= monthEnd.getTime();
}

/**
 * Builds a structured summary for the calendar month containing `refDate`.
 */
export function createMonthlySubscriptionSummary(
  subscriptions: Subscription[],
  refDate: Date = new Date()
): MonthlySubscriptionSummary {
  const { start, end } = getCalendarMonthRange(refDate);
  const monthEnd = end;
  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(start);

  const held = subscriptions.filter((s) => wasHeldInMonth(s, monthEnd));

  const heldLineItems: SubscriptionMonthLineItem[] = held.map((sub) => {
    const monthlyEquivalent = calculateMonthlyCost(sub.cost, sub.billingCycle);
    const billingsInMonth = sub.isActive
      ? countBillingsInMonthRange(sub.nextBilling, sub.billingCycle, start, end)
      : 0;
    const spendInMonth = sub.isActive ? sub.cost * billingsInMonth : 0;

    return {
      id: sub.id,
      name: sub.name,
      category: sub.category,
      isActive: sub.isActive,
      billingCycle: sub.billingCycle,
      billingsInMonth,
      spendInMonth,
      monthlyEquivalent,
    };
  });

  const totalSpendInMonth = heldLineItems.reduce((s, row) => s + row.spendInMonth, 0);
  const totalMonthlyEquivalentActive = heldLineItems
    .filter((r) => r.isActive)
    .reduce((s, row) => s + row.monthlyEquivalent, 0);
  const savingsFromPausedPerMonth = heldLineItems
    .filter((r) => !r.isActive)
    .reduce((s, row) => s + row.monthlyEquivalent, 0);

  return {
    year: start.getFullYear(),
    month: start.getMonth() + 1,
    monthLabel,
    heldLineItems,
    totalSpendInMonth,
    totalMonthlyEquivalentActive,
    savingsFromPausedPerMonth,
  };
}

/**
 * Plain-text summary for debugging, logs, or alerts.
 */
export function formatMonthlySubscriptionSummary(
  summary: MonthlySubscriptionSummary
): string {
  const lines: string[] = [
    `Subscription summary — ${summary.monthLabel}`,
    `Billings in month (active): ${formatCurrency(summary.totalSpendInMonth)}`,
    `Recurring load (active, monthly equivalent): ${formatCurrency(summary.totalMonthlyEquivalentActive)}`,
    `Paused “savings” (monthly equivalent not spent): ${formatCurrency(summary.savingsFromPausedPerMonth)}`,
    '',
    'Held this month:',
  ];

  for (const row of summary.heldLineItems) {
    const status = row.isActive ? 'active' : 'paused';
    lines.push(
      `  • ${row.name} (${row.category}) [${status}] — ${row.billingsInMonth}× bill, spend ${formatCurrency(row.spendInMonth)}, ~${formatCurrency(row.monthlyEquivalent)}/mo equiv`
    );
  }

  return lines.join('\n');
}

/**
 * Creates the monthly summary and invokes `show` with a printable representation.
 * Defaults to `console.log`. Returns the structured summary for UI use.
 */
export function createAndShowMonthlySubscriptionSummary(
  subscriptions: Subscription[],
  refDate: Date = new Date(),
  show: (text: string) => void = console.log
): MonthlySubscriptionSummary {
  const summary = createMonthlySubscriptionSummary(subscriptions, refDate);
  show(formatMonthlySubscriptionSummary(summary));
  return summary;
}
