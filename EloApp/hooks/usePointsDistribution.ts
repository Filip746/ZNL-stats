import { useState, useEffect } from 'react';
import { PointsDistributionData } from '../types';
import { DEFAULT_TEAM } from '../constants';
import { fetchPointsDistributionWithHandling } from '../api';

interface UsePointsDistributionReturn {
  pointsDistribution: PointsDistributionData | null;
  selectedTeam: string;
  loadingPoints: boolean;
  error: string | null;
  availableTeams: string[];
  setSelectedTeam: (team: string) => void;
  setAvailableTeams: (teams: string[]) => void;
  fetchPointsForTeam: (teamName: string) => Promise<void>;
  clearPointsData: () => void;
}

export const usePointsDistribution = (): UsePointsDistributionReturn => {
  const [pointsDistribution, setPointsDistribution] = useState<PointsDistributionData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>(DEFAULT_TEAM);
  const [loadingPoints, setLoadingPoints] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);

  // Funkcija za dohvaćanje distribucije bodova
  const fetchPointsForTeam = async (teamName: string) => {
    try {
      setLoadingPoints(true);
      setError(null);

      const { data, error: fetchError } = await fetchPointsDistributionWithHandling(teamName);

      if (fetchError) {
        setError(fetchError);
        return;
      }

      if (data) {
        setPointsDistribution(data);
      }
    } catch (error) {
      console.error('Unexpected error in points distribution:', error);
      setError('Neočekivana greška pri dohvaćanju distribucije bodova');
    } finally {
      setLoadingPoints(false);
    }
  };

  // Automatski dohvati distribuciju kad se promijeni odabrani tim
  useEffect(() => {
    if (selectedTeam && availableTeams.includes(selectedTeam)) {
      fetchPointsForTeam(selectedTeam);
    }
  }, [selectedTeam]);

  // Automatski postavi prvi dostupni tim kad se učitaju timovi
  useEffect(() => {
    if (availableTeams.length > 0 && !availableTeams.includes(selectedTeam)) {
      setSelectedTeam(availableTeams[0]);
    }
  }, [availableTeams, selectedTeam]);

  // Funkcija za čišćenje podataka
  const clearPointsData = () => {
    setPointsDistribution(null);
    setError(null);
  };

  return {
    pointsDistribution,
    selectedTeam,
    loadingPoints,
    error,
    availableTeams,
    setSelectedTeam,
    setAvailableTeams,
    fetchPointsForTeam,
    clearPointsData,
  };
};
