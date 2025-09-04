import { useState, useCallback } from 'react';
import type { AnalyticsFilters, ReportType, GrainEntry } from '../types/analyticsTypes';

interface AnalyticsDataState {
  data: Record<ReportType, GrainEntry[]>;
  loading: Record<ReportType, boolean>;
  error: Record<ReportType, string | null>;
  lastFetched: Record<ReportType, string | null>;
}

export const useAnalyticsData = () => {
  const [state, setState] = useState<AnalyticsDataState>({
    data: {
      basis_trend: [],
      price_trend: []
    },
    loading: {
      basis_trend: false,
      price_trend: false
    },
    error: {
      basis_trend: null,
      price_trend: null
    },
    lastFetched: {
      basis_trend: null,
      price_trend: null
    }
  });

  const fetchData = useCallback(async (type: ReportType, filters: AnalyticsFilters = {}) => {
    setState(prev => ({
      ...prev,
      loading: { ...prev.loading, [type]: true },
      error: { ...prev.error, [type]: null }
    }));

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-data`;
      
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type,
          filters
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }

      setState(prev => ({
        ...prev,
        data: { ...prev.data, [type]: result.data },
        loading: { ...prev.loading, [type]: false },
        error: { ...prev.error, [type]: null },
        lastFetched: { ...prev.lastFetched, [type]: new Date().toISOString() }
      }));

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, [type]: false },
        error: { 
          ...prev.error, 
          [type]: error instanceof Error ? error.message : 'Failed to fetch analytics data'
        }
      }));
    }
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    lastFetched: state.lastFetched,
    fetchData
  };
};