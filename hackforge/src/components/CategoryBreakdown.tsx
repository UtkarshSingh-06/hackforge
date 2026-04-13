import React from 'react';
import { PieChart, TrendingUp } from 'lucide-react';
import { Subscription, getCategoryBreakdown, getTotalMonthlyCost } from '../utils/calculations';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface CategoryBreakdownProps {
  subscriptions: Subscription[];
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

const CATEGORY_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
];

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ subscriptions }) => {
  const breakdown = getCategoryBreakdown(subscriptions);
  const totalMonthlyCost = getTotalMonthlyCost(subscriptions);
  
  const categoryData: CategoryData[] = Object.entries(breakdown)
    .map(([name, amount], index) => ({
      name,
      amount,
      percentage: totalMonthlyCost > 0 ? (amount / totalMonthlyCost) * 100 : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount);

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <PieChart className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <PieChart className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500">No active subscriptions to analyze</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <PieChart className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
      </div>

      <div className="space-y-4">
        {categoryData.map((category, index) => (
          <div key={category.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
              <span className="text-sm font-medium text-gray-900">{category.name}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(category.amount)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPercentage(category.percentage)}
                </div>
              </div>
              
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${category.color}`}
                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Total Monthly</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(totalMonthlyCost)}
          </span>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{categoryData[0].name}</span> is your largest expense category at{' '}
            <span className="font-medium">{formatPercentage(categoryData[0].percentage)}</span> of your total spending.
          </div>
        </div>
      )}
    </div>
  );
};