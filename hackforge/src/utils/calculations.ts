export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Subscription {
  id: number;
  name: string;
  cost: number;
  billingCycle: BillingCycle;
  nextBilling: string;
  category: string;
  isActive: boolean;
  dateAdded: string;
  lastUsed?: string;
}

export const calculateMonthlyCost = (cost: number, cycle: BillingCycle): number => {
  switch (cycle) {
    case 'weekly':
      return cost * 4.33;
    case 'monthly':
      return cost;
    case 'quarterly':
      return cost / 3;
    case 'yearly':
      return cost / 12;
    default:
      return cost;
  }
};

export const getTotalMonthlyCost = (subscriptions: Subscription[]): number => {
  return subscriptions
    .filter(sub => sub.isActive)
    .reduce((total, sub) => total + calculateMonthlyCost(sub.cost, sub.billingCycle), 0);
};

export const getTotalYearlyCost = (subscriptions: Subscription[]): number => {
  return getTotalMonthlyCost(subscriptions) * 12;
};

export const getUpcomingRenewals = (subscriptions: Subscription[], days: number = 7): Subscription[] => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return subscriptions
    .filter(sub => sub.isActive)
    .filter(sub => {
      const renewalDate = new Date(sub.nextBilling);
      return renewalDate >= now && renewalDate <= futureDate;
    })
    .sort((a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime());
};

export const getCategoryBreakdown = (subscriptions: Subscription[]): Record<string, number> => {
  const breakdown: Record<string, number> = {};
  
  subscriptions
    .filter(sub => sub.isActive)
    .forEach(sub => {
      const monthlyCost = calculateMonthlyCost(sub.cost, sub.billingCycle);
      breakdown[sub.category] = (breakdown[sub.category] || 0) + monthlyCost;
    });
    
  return breakdown;
};

export const getActiveSubscriptionsCount = (subscriptions: Subscription[]): number => {
  return subscriptions.filter(sub => sub.isActive).length;
};