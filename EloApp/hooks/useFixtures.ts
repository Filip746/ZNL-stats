import { useState, useEffect } from 'react';
import { getFixtures } from '../api';
import { FixturesResponse } from '../types';

interface UseFixturesState {
  data: FixturesResponse | null;
  loading: boolean;
  error: string | null;
}

export const useFixtures = () => {
  const [state, setState] = useState<UseFixturesState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchFixtures = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await getFixtures();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  useEffect(() => {
    fetchFixtures();
  }, []);

  return {
    ...state,
    refetch: fetchFixtures,
  };
};
