import React from 'react';
import { Calendar, DollarSign, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Subscription, calculateMonthlyCost } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { formatDate, getDaysUntilBilling, isDateInPast } from '../utils/dateUtils';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const monthlyCost = calculateMonthlyCost(subscription.cost, subscription.billingCycle);
  const daysUntilBilling = getDaysUntilBilling(subscription.nextBilling);
  const isPastDue = isDateInPast(subscription.nextBilling);

  const getBillingStatus = () => {
    if (isPastDue) {
      return { text: 'Past due', color: 'text-red-600 bg-red-50' };
    } else if (daysUntilBilling <= 7) {
      return { text: `${daysUntilBilling} days left`, color: 'text-orange-600 bg-orange-50' };
    } else {
      return { text: `${daysUntilBilling} days left`, color: 'text-green-600 bg-green-50' };
    }
  };

  const billingStatus = getBillingStatus();

  return (
    <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-6 ${
      !subscription.isActive ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{subscription.name}</h3>
            {!subscription.isActive && (
              <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{subscription.category}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleStatus(subscription.id)}
            className={`p-2 rounded-lg transition-colors ${
              subscription.isActive 
                ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
            }`}
            title={subscription.isActive ? 'Deactivate' : 'Activate'}
          >
            {subscription.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => onEdit(subscription)}
            className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            title="Edit subscription"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(subscription.id)}
            className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            title="Delete subscription"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(subscription.cost)}
            </p>
            <p className="text-xs text-gray-500">
              per {subscription.billingCycle.replace('ly', '')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {formatDate(subscription.nextBilling)}
            </p>
            <p className="text-xs text-gray-500">Next billing</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{formatCurrency(monthlyCost)}</span> monthly equivalent
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${billingStatus.color}`}>
          {billingStatus.text}
        </div>
      </div>
    </div>
  );
};