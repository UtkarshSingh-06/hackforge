import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Subscription, BillingCycle } from '../utils/calculations';
import { CATEGORIES, BILLING_CYCLES } from '../utils/constants';
import { formatDateInput } from '../utils/dateUtils';

interface SubscriptionFormProps {
  subscription?: Subscription;
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscriptionData: Omit<Subscription, 'id' | 'dateAdded'>) => void;
  title: string;
}

interface FormData {
  name: string;
  cost: string;
  billingCycle: BillingCycle;
  nextBilling: string;
  category: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  name: '',
  cost: '',
  billingCycle: 'monthly',
  nextBilling: '',
  category: 'Entertainment',
  isActive: true,
};

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscription,
  isOpen,
  onClose,
  onSave,
  title,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name,
        cost: subscription.cost.toString(),
        billingCycle: subscription.billingCycle,
        nextBilling: formatDateInput(subscription.nextBilling),
        category: subscription.category,
        isActive: subscription.isActive,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [subscription, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    if (!formData.cost || isNaN(parseFloat(formData.cost)) || parseFloat(formData.cost) <= 0) {
      newErrors.cost = 'Valid cost is required';
    }

    if (!formData.nextBilling) {
      newErrors.nextBilling = 'Next billing date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        name: formData.name.trim(),
        cost: parseFloat(formData.cost),
        billingCycle: formData.billingCycle,
        nextBilling: formData.nextBilling,
        category: formData.category,
        isActive: formData.isActive,
      });
      onClose();
    }
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Netflix, Spotify, etc."
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) => handleChange('cost', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.cost ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="9.99"
            />
            {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Billing Cycle
            </label>
            <select
              value={formData.billingCycle}
              onChange={(e) => handleChange('billingCycle', e.target.value as BillingCycle)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {BILLING_CYCLES.map((cycle) => (
                <option key={cycle.value} value={cycle.value}>
                  {cycle.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Billing Date
            </label>
            <input
              type="date"
              value={formData.nextBilling}
              onChange={(e) => handleChange('nextBilling', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.nextBilling ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.nextBilling && <p className="text-red-500 text-sm mt-1">{errors.nextBilling}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active subscription
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};