import { useState, useEffect, useCallback } from 'react';
import { Subscription } from '../utils/calculations';
import { SAMPLE_SUBSCRIPTIONS } from '../utils/constants';
import {
  ActivityEntry,
  loadActivitiesFromStorage,
  pushActivity,
} from '../utils/activityLog';

const STORAGE_KEY = 'subscriptionTracker';

interface UseSubscriptionsReturn {
  subscriptions: Subscription[];
  activities: ActivityEntry[];
  addSubscription: (subscriptionData: Omit<Subscription, 'id' | 'dateAdded'>) => void;
  updateSubscription: (id: number, subscriptionData: Partial<Subscription>) => void;
  deleteSubscription: (id: number) => void;
  toggleSubscriptionStatus: (id: number) => void;
  getSubscriptionById: (id: number) => Subscription | undefined;
  loading: boolean;
}

export const useSubscriptions = (): UseSubscriptionsReturn => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptions = () => {
      try {
        setActivities(loadActivitiesFromStorage());
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          setSubscriptions(parsedData);
        } else {
          setSubscriptions(SAMPLE_SUBSCRIPTIONS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_SUBSCRIPTIONS));
        }
      } catch (error) {
        console.error('Error loading subscriptions:', error);
        setSubscriptions(SAMPLE_SUBSCRIPTIONS);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  const saveToStorage = useCallback((updatedSubscriptions: Subscription[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSubscriptions));
    } catch (error) {
      console.error('Error saving subscriptions:', error);
    }
  }, []);

  const addSubscription = useCallback((subscriptionData: Omit<Subscription, 'id' | 'dateAdded'>) => {
    const newSubscription: Subscription = {
      ...subscriptionData,
      id: Date.now(),
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setSubscriptions(prev => {
      const updated = [...prev, newSubscription];
      saveToStorage(updated);
      return updated;
    });
    setActivities(prev =>
      pushActivity(prev, {
        type: 'add',
        subscriptionId: newSubscription.id,
        subscriptionName: newSubscription.name,
      })
    );
  }, [saveToStorage]);

  const updateSubscription = useCallback((id: number, subscriptionData: Partial<Subscription>) => {
    setSubscriptions(prev => {
      const updated = prev.map(sub =>
        sub.id === id ? { ...sub, ...subscriptionData } : sub
      );
      saveToStorage(updated);
      const sub = updated.find(s => s.id === id);
      if (sub) {
        const name = sub.name;
        window.setTimeout(() => {
          setActivities(acts =>
            pushActivity(acts, {
              type: 'update',
              subscriptionId: id,
              subscriptionName: name,
            })
          );
        }, 0);
      }
      return updated;
    });
  }, [saveToStorage]);

  const deleteSubscription = useCallback((id: number) => {
    setSubscriptions(prev => {
      const removed = prev.find(sub => sub.id === id);
      const updated = prev.filter(sub => sub.id !== id);
      saveToStorage(updated);
      if (removed) {
        const subscriptionName = removed.name;
        window.setTimeout(() => {
          setActivities(acts =>
            pushActivity(acts, {
              type: 'delete',
              subscriptionId: id,
              subscriptionName,
            })
          );
        }, 0);
      }
      return updated;
    });
  }, [saveToStorage]);

  const toggleSubscriptionStatus = useCallback((id: number) => {
    setSubscriptions(prev => {
      const updated = prev.map(sub =>
        sub.id === id ? { ...sub, isActive: !sub.isActive } : sub
      );
      saveToStorage(updated);
      const sub = updated.find(s => s.id === id);
      if (sub) {
        const activityType = sub.isActive ? 'activate' as const : 'deactivate' as const;
        const name = sub.name;
        window.setTimeout(() => {
          setActivities(acts =>
            pushActivity(acts, {
              type: activityType,
              subscriptionId: id,
              subscriptionName: name,
            })
          );
        }, 0);
      }
      return updated;
    });
  }, [saveToStorage]);

  const getSubscriptionById = useCallback((id: number): Subscription | undefined => {
    return subscriptions.find(sub => sub.id === id);
  }, [subscriptions]);

  return {
    subscriptions,
    activities,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
    getSubscriptionById,
    loading,
  };
};