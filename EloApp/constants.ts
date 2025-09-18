import { ViewMode } from "./types";

// API konfiguracija
export const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  SIMULATION: `${API_BASE_URL}/simulation-text`,
  POINTS_DISTRIBUTION: `${API_BASE_URL}/points-distribution`,
  CONDITIONAL_MATRIX: `${API_BASE_URL}/positions-conditional-matrix`,
} as const;

// Default vrijednosti
export const DEFAULT_TEAM = 'Zadrugar';
export const DEFAULT_SIMULATIONS = 10000;
export const DEFAULT_VIEW: ViewMode = 'phase1';

// Boje za pozicije
export const POSITION_COLORS = {
  CHAMPION: '#FFD700', // Gold
  TOP_3: '#4CAF50',    // Green
  SAFE: '#4CAF50',     // Green
  MID_TABLE: '#FF9800', // Orange
  RELEGATION: '#f44336', // Red
  OTHER: '#FF9800',    // Orange
} as const;

// Boje za vjerojatnosti
export const PROBABILITY_COLORS = {
  HIGH: '#4CAF50',     // > 50%
  MEDIUM: '#FF9800',   // 25-50%
  LOW: '#2196F3',      // 10-25%
  VERY_LOW: '#9E9E9E', // < 10%
} as const;

// Pauze za UI feedback
export const UI_TIMEOUTS = {
  LOADING_MIN: 500,    // Minimalno vrijeme prikazivanja loading-a
  REFRESH_DEBOUNCE: 1000, // Debounce za refresh button
} as const;

// Lokalizacija
export const LOCALE = 'hr-HR';
