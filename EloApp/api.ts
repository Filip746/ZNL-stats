import { Alert } from 'react-native';
import { 
  SimulationData, 
  PointsDistributionData, 
  PositionsConditionalData, 
  FixturesResponse
} from './types';
import { API_BASE_URL, API_ENDPOINTS } from './constants';

// Osnovne API funkcije
export const fetchSimulationData = async (): Promise<SimulationData> => {
  const response = await fetch(API_ENDPOINTS.SIMULATION);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data: SimulationData = await response.json();
  console.log('RECEIVED STRUCTURED DATA:', data);
  return data;
};

export const fetchPointsDistribution = async (teamName: string): Promise<PointsDistributionData> => {
  const response = await fetch(
    `${API_ENDPOINTS.POINTS_DISTRIBUTION}/${teamName}?simulations=10000`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data: PointsDistributionData = await response.json();
  console.log('POINTS DISTRIBUTION DATA:', data);
  return data;
};

export const fetchConditionalData = async (teamName: string): Promise<PositionsConditionalData> => {
  const response = await fetch(
    `${API_ENDPOINTS.CONDITIONAL_MATRIX}/${teamName}?simulations=10000`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data: PositionsConditionalData = await response.json();
  return data;
};

// Wrapper funkcije s error handling-om
export const fetchSimulationDataWithHandling = async (isRefresh = false) => {
  try {
    const data = await fetchSimulationData();
    
    if (isRefresh) {
      Alert.alert(
        'Simulacija završena!',
        'Nova simulacija je uspješno pokrenuta i rezultati su ažurirani.',
        [{ text: 'OK' }]
      );
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('FETCH ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Nepoznata greška';
    
    if (isRefresh) {
      Alert.alert(
        'Greška',
        'Simulacija se nije mogla pokrenuti. Molimo pokušajte ponovno.',
        [{ text: 'OK' }]
      );
    }
    
    return { data: null, error: errorMessage };
  }
};

export const fetchPointsDistributionWithHandling = async (teamName: string) => {
  try {
    const data = await fetchPointsDistribution(teamName);
    return { data, error: null };
  } catch (error) {
    console.error('POINTS FETCH ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Greška pri dohvaćanju distribucije';
    return { data: null, error: errorMessage };
  }
};

export const fetchConditionalDataWithHandling = async (teamName: string) => {
  try {
    const data = await fetchConditionalData(teamName);
    return { data, error: null };
  } catch (error) {
    console.error('CONDITIONAL FETCH ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Greška pri dohvaćanju uvjetnih vjerojatnosti';
    return { data: null, error: errorMessage };
  }
};

export const getFixtures = async (): Promise<FixturesResponse> => {
  const response = await fetch(`${API_BASE_URL}/fixtures`);
  if (!response.ok) {
    throw new Error('Failed to fetch fixtures');
  }
  return response.json();
};
