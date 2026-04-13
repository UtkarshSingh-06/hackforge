export const CATEGORIES = [
  'Entertainment',
  'Software',
  'Utilities',
  'Health',
  'Finance',
  'Education',
  'Other'
];

export const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

export const SAMPLE_SUBSCRIPTIONS = [
  {
    id: 1,
    name: 'Netflix',
    cost: 15.99,
    billingCycle: 'monthly' as const,
    nextBilling: '2025-09-15',
    category: 'Entertainment',
    isActive: true,
    dateAdded: '2025-01-01'
  },
  {
    id: 2,
    name: 'Adobe Creative Suite',
    cost: 52.99,
    billingCycle: 'monthly' as const,
    nextBilling: '2025-09-22',
    category: 'Software',
    isActive: true,
    dateAdded: '2025-01-15'
  },
  {
    id: 3,
    name: 'Amazon Prime',
    cost: 139,
    billingCycle: 'yearly' as const,
    nextBilling: '2025-12-01',
    category: 'Entertainment',
    isActive: true,
    dateAdded: '2024-12-01'
  },
  {
    id: 4,
    name: 'Spotify Premium',
    cost: 9.99,
    billingCycle: 'monthly' as const,
    nextBilling: '2025-09-10',
    category: 'Entertainment',
    isActive: true,
    dateAdded: '2025-02-10'
  },
  {
    id: 5,
    name: 'GitHub Pro',
    cost: 4.00,
    billingCycle: 'monthly' as const,
    nextBilling: '2025-09-05',
    category: 'Software',
    isActive: false,
    dateAdded: '2025-03-05'
  }
];