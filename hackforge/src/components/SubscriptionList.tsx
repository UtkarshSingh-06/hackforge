import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Subscription } from '../utils/calculations';
import { CATEGORIES } from '../utils/constants';
import { SubscriptionCard } from './SubscriptionCard';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onAddNew: () => void;
}

interface Filters {
  search: string;
  category: string;
  status: 'all' | 'active' | 'inactive';
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
}) => {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    status: 'all',
  });

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((subscription) => {
      const matchesSearch = subscription.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = !filters.category || subscription.category === filters.category;
      const matchesStatus = 
        filters.status === 'all' || 
        (filters.status === 'active' && subscription.isActive) ||
        (filters.status === 'inactive' && !subscription.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      return new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime();
    });
  }, [subscriptions, filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', status: 'all' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscriptions</h2>
          <p className="text-gray-600">
            {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </p>
        </div>
        
        <button
          onClick={onAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value as Filters['status'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Subscription List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subscriptions found
              </h3>
              <p className="text-gray-500 mb-6">
                {subscriptions.length === 0
                  ? "You haven't added any subscriptions yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {subscriptions.length === 0 && (
                <button
                  onClick={onAddNew}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Subscription
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};