import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { SimulationData, ViewMode } from '../types';
import { DEFAULT_TEAM, DEFAULT_VIEW } from '../constants';
import { fetchSimulationDataWithHandling } from '../api';

interface UseSimulationReturn {
  simulationData: SimulationData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastRefreshTime: Date | null;
  availableTeams: string[];
  handleRefreshSimulation: () => void;
  refetchData: () => Promise<void>;
}

export const useSimulation = (): UseSimulationReturn => {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);

  // Funkcija za dohvaćanje podataka
  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const { data, error: fetchError } = await fetchSimulationDataWithHandling(isRefresh);

      if (fetchError) {
        setError(fetchError);
        return;
      }

      if (data) {
        setSimulationData(data);
        setLastRefreshTime(new Date());
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setError('Neočekivana greška');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Inicijalno dohvaćanje podataka
  useEffect(() => {
    fetchData();
  }, []);

  // Ažuriranje dostupnih timova kad se promijene podatci
  useEffect(() => {
    if (simulationData?.phase1_results?.teams) {
      const teams = simulationData.phase1_results.teams.map(team => team.team);
      setAvailableTeams(teams);
    }
  }, [simulationData]);

  // Funkcija za refresh s potvrdom
  const handleRefreshSimulation = () => {
    Alert.alert(
      'Pokreni novu simulaciju?',
      'Ovo će pokrenuti novu Monte Carlo simulaciju s novim rezultatima. Proces može potrajati nekoliko sekundi.',
      [
        {
          text: 'Otkaži',
          style: 'cancel',
        },
        {
          text: 'Pokreni',
          style: 'default',
          onPress: () => fetchData(true),
        },
      ]
    );
  };

  // Javna funkcija za ponovno dohvaćanje
  const refetchData = async () => {
    await fetchData(false);
  };

  return {
    simulationData,
    loading,
    refreshing,
    error,
    lastRefreshTime,
    availableTeams,
    handleRefreshSimulation,
    refetchData,
  };
};
