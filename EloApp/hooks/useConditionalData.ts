import { useState, useEffect } from 'react';
import { PositionsConditionalData } from '../types';
import { DEFAULT_TEAM } from '../constants';
import { fetchConditionalDataWithHandling } from '../api';

interface UseConditionalDataReturn {
  conditionalData: PositionsConditionalData | null;
  selectedTeam: string;
  loadingConditional: boolean;
  error: string | null;
  availableTeams: string[];
  setSelectedTeam: (team: string) => void;
  setAvailableTeams: (teams: string[]) => void;
  fetchConditionalForTeam: (teamName: string) => Promise<void>;
  clearConditionalData: () => void;
}

export const useConditionalData = (): UseConditionalDataReturn => {
  const [conditionalData, setConditionalData] = useState<PositionsConditionalData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>(DEFAULT_TEAM);
  const [loadingConditional, setLoadingConditional] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);

  // Funkcija za dohvaćanje uvjetnih podataka
  const fetchConditionalForTeam = async (teamName: string) => {
    try {
      setLoadingConditional(true);
      setError(null);

      const { data, error: fetchError } = await fetchConditionalDataWithHandling(teamName);

      if (fetchError) {
        setError(fetchError);
        return;
      }

      if (data) {
          console.log('CONDITIONAL DATA:', data); // DODAJ OVO
  console.log('First row positions:', data.matrix[0]?.positions); // DODAJ OVO
        setConditionalData(data);
      }
    } catch (error) {
      console.error('Unexpected error in conditional data:', error);
      setError('Neočekivana greška pri dohvaćanju uvjetnih vjerojatnosti');
    } finally {
      setLoadingConditional(false);
    }
  };

  // Automatski dohvati uvjetne podatke kad se prom ijeni odabrani tim
  useEffect(() => {
    if (selectedTeam && availableTeams.includes(selectedTeam)) {
      fetchConditionalForTeam(selectedTeam);
    }
  }, [selectedTeam]);

  // Automatski postavi prvi dostupni tim kad se učitaju timovi
  useEffect(() => {
    if (availableTeams.length > 0 && !availableTeams.includes(selectedTeam)) {
      setSelectedTeam(availableTeams[0]);
    }
  }, [availableTeams, selectedTeam]);

  // Funkcija za čišćenje podataka
  const clearConditionalData = () => {
    setConditionalData(null);
    setError(null);
  };

  return {
    conditionalData,
    selectedTeam,
    loadingConditional,
    error,
    availableTeams,
    setSelectedTeam,
    setAvailableTeams,
    fetchConditionalForTeam,
    clearConditionalData,
  };
};
