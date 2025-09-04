import { useState, useCallback } from 'react';
import type { GrainEntry } from '../types/analyticsTypes';

interface AnalyticsDataState {
  masterData: GrainEntry[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

export const useAnalyticsData = () => {
  const [state, setState] = useState<AnalyticsDataState>({
    masterData: [],
    loading: false,
    error: null,
    lastFetched: null
  });

  const fetchMasterData = useCallback(async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
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
          type: 'master_data', // Get all data
          filters: {} // No filters for master query
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
        masterData: result.data,
        loading: false,
        error: null,
        lastFetched: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error fetching master analytics data:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics data'
      }));
    }
  }, []);

  return {
    masterData: state.masterData,
    loading: state.loading,
    error: state.error,
    lastFetched: state.lastFetched,
    fetchMasterData,
    totalRecords: state.masterData.length
  };
};