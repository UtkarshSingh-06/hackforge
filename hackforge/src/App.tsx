import React, { useState } from 'react';
import { CreditCard, Menu, X } from 'lucide-react';
import { useSubscriptions } from './hooks/useSubscriptions';
import { Subscription } from './utils/calculations';
import { Dashboard } from './components/Dashboard';
import { UpcomingRenewals } from './components/UpcomingRenewals';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { MonthlySummary } from './components/MonthlySummary';
import { SubscriptionList } from './components/SubscriptionList';
import { SubscriptionForm } from './components/SubscriptionForm';

function App() {
  const {
    subscriptions,
    activities,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    loading,
  } = useSubscriptions();

  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscriptions' | 'summary'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAddNew = () => {
    setEditingSubscription(undefined);
    setShowForm(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowForm(true);
  };

  const handleSave = (subscriptionData: Omit<Subscription, 'id' | 'dateAdded'>) => {
    if (editingSubscription) {
      updateSubscription(editingSubscription.id, subscriptionData);
    } else {
      addSubscription(subscriptionData);
    }
    setShowForm(false);
    setEditingSubscription(undefined);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      deleteSubscription(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSubscription(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading your subscriptions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SubTracker</h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Subscription Management Made Simple
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'subscriptions'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Subscriptions
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly summary
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab('subscriptions');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'subscriptions'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Subscriptions
                </button>
                <button
                  onClick={() => {
                    setActiveTab('summary');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'summary'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly summary
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UpcomingRenewals subscriptions={subscriptions} />
        
        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <Dashboard subscriptions={subscriptions} />
            <CategoryBreakdown subscriptions={subscriptions} />
          </div>
        ) : activeTab === 'subscriptions' ? (
          <SubscriptionList
            subscriptions={subscriptions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={toggleSubscriptionStatus}
            onAddNew={handleAddNew}
          />
        ) : (
          <MonthlySummary subscriptions={subscriptions} activities={activities} />
        )}
      </main>

      {/* Subscription Form Modal */}
      <SubscriptionForm
        subscription={editingSubscription}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSave={handleSave}
        title={editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
      />
    </div>
  );
}

export default App;
