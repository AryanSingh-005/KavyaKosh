import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMySubscription } from '../api/premiumApi';

const PremiumContext = createContext({
  tier: 'FREE',
  features: {
    dailyAiGenerations: 5,
    priorityReview: false,
    marketplaceDiscountPercent: 0,
    earlyCompetitionAccess: false,
    badgeLabel: 'Free',
  },
  status: 'ACTIVE',
  loading: true,
  refresh: () => {},
  refreshSubscription: () => {},
});

export function PremiumProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getMySubscription();
      setSubscription(data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const value = {
    tier:     subscription?.tier     ?? 'FREE',
    status:   subscription?.status   ?? 'ACTIVE',
    features: subscription?.features ?? {
      dailyAiGenerations: 5,
      priorityReview: false,
      marketplaceDiscountPercent: 0,
      earlyCompetitionAccess: false,
      badgeLabel: 'Free',
    },
    loading,
    refresh,
    refreshSubscription: refresh,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremium = () => useContext(PremiumContext);
