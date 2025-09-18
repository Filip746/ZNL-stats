import { POSITION_COLORS, PROBABILITY_COLORS, LOCALE } from '../constants';

/**
 * Vraća boju na temelju pozicije tima
 * @param position - Pozicija tima (1-based)
 * @param isChampionsLeague - Je li liga prvaka ili ostanak
 * @returns Hex boja kao string
 */
export const getPositionColor = (position: number, isChampionsLeague: boolean = false): string => {
  if (isChampionsLeague) {
    if (position === 1) return POSITION_COLORS.CHAMPION; // Gold for champion
    if (position <= 3) return POSITION_COLORS.TOP_3; // Green for top 3
    return POSITION_COLORS.OTHER; // Orange for others
  } else {
    // Liga za ostanak
    if (position <= 2) return POSITION_COLORS.SAFE; // Safe
    if (position <= 4) return POSITION_COLORS.MID_TABLE; // Mid-table
    return POSITION_COLORS.RELEGATION; // Relegation danger
  }
};

/**
 * Vraća boju na temelju vjerojatnosti u postocima
 * @param percentage - Vjerojatnost u postocima
 * @returns Hex boja kao string
 */
export const getProbabilityColor = (percentage: number): string => {
  if (percentage >= 50) return PROBABILITY_COLORS.HIGH; // Green
  if (percentage >= 25) return PROBABILITY_COLORS.MEDIUM; // Orange
  if (percentage >= 10) return PROBABILITY_COLORS.LOW; // Blue
  return PROBABILITY_COLORS.VERY_LOW; // Grey
};

/**
 * Formatira vrijeme zadnjeg osvježavanja u čitljivom formatu
 * @param lastRefreshTime - Datum zadnjeg osvježavanja
 * @returns Formatirani string s vremenom
 */
export const formatLastRefreshTime = (lastRefreshTime: Date | null): string => {
  if (!lastRefreshTime) return '';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - lastRefreshTime.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `Ažurirano prije ${diffInSeconds} sekundi`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Ažurirano prije ${minutes} minuta`;
  } else {
    return `Ažurirano ${lastRefreshTime.toLocaleTimeString(LOCALE, {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }
};

/**
 * Interpolira između dvije boje na temelju postotka
 * @param color1 - Početna boja (hex)
 * @param color2 - Završna boja (hex)
 * @param factor - Faktor interpolacije (0-1)
 * @returns Interpolirana boja kao hex string
 */
export const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const hex = (color: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgb1 = hex(color1);
  const rgb2 = hex(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
  const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
  const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Formatira broj s tisućama separatorima
 * @param num - Broj za formatiranje
 * @returns Formatirani string
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString(LOCALE);
};

/**
 * Formatira postotak s jednim decimalnim mjestom
 * @param percentage - Postotak za formatiranje
 * @returns Formatirani string s % znakom
 */
export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};

/**
 * Dobiva background boju za matrix celiju na temelju vjerojatnosti
 * @param probability - Vjerojatnost u postocima
 * @returns Objekt s backgroundColor i textColor
 */
export const getMatrixCellStyle = (probability: number) => {
  let backgroundColor: string;
  let textColor: string;

  if (probability >= 20) {
    backgroundColor = '#2E8B57';
    textColor = '#fff';
  } else if (probability >= 10) {
    backgroundColor = '#4CAF50';
    textColor = '#fff';
  } else if (probability >= 5) {
    backgroundColor = '#FF9800';
    textColor = '#fff';
  } else if (probability > 0) {
    backgroundColor = '#9E9E9E';
    textColor = '#333';
  } else {
    backgroundColor = '#f0f0f0';
    textColor = '#333';
  }

  return { backgroundColor, textColor };
};

/**
 * Dobiva boju za bar chart na temelju vrijednosti
 * @param percentage - Postotak za chart bar
 * @returns Hex boja kao string
 */
export const getChartBarColor = (percentage: number): string => {
  if (percentage >= 10) return '#2E8B57';
  if (percentage >= 5) return '#4CAF50';
  if (percentage >= 2) return '#FF9800';
  return '#9E9E9E';
};

/**
 * Dobiva visinu za chart bar s minimalnom vidljivom visinom
 * @param percentage - Postotak za chart bar
 * @param maxPercentage - Maksimalni postotak u data setu
 * @param maxHeight - Maksimalna visina bara
 * @returns Visina bara u pixelima
 */
export const getChartBarHeight = (
  percentage: number, 
  maxPercentage: number, 
  maxHeight: number = 150
): number => {
  const calculatedHeight = (percentage / maxPercentage) * maxHeight;
  const minHeight = percentage > 0 ? 5 : 0; // Minimalna visina za vidljivost
  return Math.max(calculatedHeight, minHeight);
};

/**
 * Provjerava je li tim u top N pozicija
 * @param position - Pozicija tima
 * @param topN - Broj top pozicija
 * @returns Boolean
 */
export const isTopPosition = (position: number, topN: number = 3): boolean => {
  return position <= topN;
};

/**
 * Dobiva skraćeni naziv tima ako je predugačak
 * @param teamName - Puno ime tima
 * @param maxLength - Maksimalna duljina
 * @returns Skraćeni naziv tima
 */
export const truncateTeamName = (teamName: string, maxLength: number = 12): string => {
  if (teamName.length <= maxLength) return teamName;
  return `${teamName.substring(0, maxLength - 3)}...`;
};


export const getMatrixBackgroundColor = (probability: number): string => {
  if (probability >= 50) return '#4285F4'; // Plava za visoke vrijednosti
  if (probability >= 30) return '#6FA8DC'; // Svjetloplava 
  if (probability >= 15) return '#A4C2F4'; // Još svjetlija plava
  if (probability >= 5) return '#C9DAF8';  // Jako svijetla plava
  if (probability > 0) return '#E8F0FE';   // Skoro bijela plava
  return '#FFFFFF'; // Bijela za 0%
};

/**
 * Dobiva text boju za matrix
 */
export const getMatrixTextColor = (probability: number): string => {
  if (probability >= 30) return '#FFFFFF'; // Bijeli tekst za tamnije pozadine
  return '#333333'; // Tamni tekst za svijetle pozadine
};