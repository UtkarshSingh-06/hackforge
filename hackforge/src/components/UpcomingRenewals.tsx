import React from 'react';
import { AlertTriangle, Calendar, DollarSign } from 'lucide-react';
import { Subscription, getUpcomingRenewals } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { formatDate, getDaysUntilBilling } from '../utils/dateUtils';

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
  days?: number;
}

export const UpcomingRenewals: React.FC<UpcomingRenewalsProps> = ({ 
  subscriptions, 
  days = 7 
}) => {
  const upcomingRenewals = getUpcomingRenewals(subscriptions, days);
  
  if (upcomingRenewals.length === 0) {
    return null;
  }

  const totalUpcomingCost = upcomingRenewals.reduce((sum, sub) => sum + sub.cost, 0);

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-orange-900">
              Upcoming Renewals
            </h3>
            <div className="text-sm text-orange-700">
              <span className="font-medium">{formatCurrency(totalUpcomingCost)}</span> total
            </div>
          </div>
          
          <p className="text-orange-700 text-sm mb-4">
            {upcomingRenewals.length} subscription{upcomingRenewals.length !== 1 ? 's' : ''} 
            renewing in the next {days} days
          </p>
          
          <div className="space-y-3">
            {upcomingRenewals.map((subscription) => {
              const daysUntil = getDaysUntilBilling(subscription.nextBilling);
              
              return (
                <div 
                  key={subscription.id} 
                  className="bg-white rounded-lg p-3 border border-orange-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {subscription.name}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-full">
                          {subscription.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(subscription.nextBilling)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(subscription.cost)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        daysUntil <= 1 
                          ? 'text-red-600' 
                          : daysUntil <= 3 
                            ? 'text-orange-600' 
                            : 'text-yellow-600'
                      }`}>
                        {daysUntil === 0 
                          ? 'Today' 
                          : daysUntil === 1 
                            ? 'Tomorrow' 
                            : `${daysUntil} days`
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {subscription.billingCycle}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};