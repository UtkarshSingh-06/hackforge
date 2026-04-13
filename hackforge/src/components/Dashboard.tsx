import React from 'react';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { Subscription, getTotalMonthlyCost, getTotalYearlyCost, getActiveSubscriptionsCount } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';

interface DashboardProps {
  subscriptions: Subscription[];
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ subscriptions }) => {
  const monthlyCost = getTotalMonthlyCost(subscriptions);
  const yearlyCost = getTotalYearlyCost(subscriptions);
  const activeCount = getActiveSubscriptionsCount(subscriptions);
  const totalSubscriptions = subscriptions.length;

  const stats = [
    {
      title: 'Monthly Cost',
      value: formatCurrency(monthlyCost),
      icon: <DollarSign className="h-6 w-6" />,
      description: 'Total monthly spending',
      color: 'blue' as const,
    },
    {
      title: 'Yearly Projection',
      value: formatCurrency(yearlyCost),
      icon: <TrendingUp className="h-6 w-6" />,
      description: 'Expected annual cost',
      color: 'green' as const,
    },
    {
      title: 'Active Subscriptions',
      value: activeCount.toString(),
      icon: <Calendar className="h-6 w-6" />,
      description: `${activeCount} of ${totalSubscriptions} total`,
      color: 'purple' as const,
    },
    {
      title: 'Average Per Service',
      value: formatCurrency(activeCount > 0 ? monthlyCost / activeCount : 0),
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Monthly average cost',
      color: 'orange' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Overview of your subscription expenses and activity</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            color={stat.color}
          />
        ))}
      </div>
    </div>
  );
};