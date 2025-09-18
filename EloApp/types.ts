// Glavni interfejsi za simulacijske podatke
export interface SimulationData {
  simulation_summary: {
    total_simulations: number;
    k_factor: number;
    phase_structure: {
      phase1: string;
      phase2_champions: string;
      phase2_relegation: string;
    };
  };
  phase1_results: {
    description: string;
    teams: Phase1Team[];
  };
  champions_league: {
    description: string;
    teams: LeagueTeam[];
  };
  relegation_league: {
    description: string;
    teams: LeagueTeam[];
  };
  overall_statistics: {
    description: string;
    teams: OverallTeam[];
  };
  metadata: {
    generated_at: string;
    total_teams: number;
    simulation_type: string;
  };
}

export interface Phase1Team {
  team: string;
  projected_points: number;
}

export interface LeagueTeam {
  position: number;
  team: string;
  projected_points: number;
  position_probabilities: {
    '1st': number;
    '2nd': number;
    '3rd': number;
    '4th': number;
    '5th': number;
    '6th': number;
  };
}

export interface OverallTeam {
  team: string;
  projected_points: number;
  champion_probability: number;
  top6_probability: number;
  all_position_probabilities: number[];
}

// Interfejsi za distribuciju bodova
export interface PointsDistributionData {
  team: string;
  statistics: {
    min_points: number;
    max_points: number;
    avg_points: number;
    std_points: number;
  };
  league_appearances: {
    champions_league_percentage: number;
    relegation_league_percentage: number;
  };
  chart_data: PointsChartItem[];
}

export interface PointsChartItem {
  points: number;
  percentage: number;
  count: number;
}

// Interfejsi za uvjetne podatke
export interface PositionsConditionalData {
  team: string;
  total_simulations: number;
  matrix: ConditionalRow[];
}

export interface ConditionalRow {
  points: number;
  sample_size: number;
  positions: { [position: string]: number };
}

// Union tip za načine prikaza
export type ViewMode = 'phase1' | 'champions' | 'relegation' | 'overall' | 'points' | 'fixtures' | 'conditional';

export interface Fixture {
  home_team: string;
  away_team: string;
  match_id: string;
}

export interface Round {
  round_number: number;
  fixtures: Fixture[];
}

export interface FixturesResponse {
  total_rounds: number;
  total_fixtures: number;
  rounds: Round[];
  metadata: {
    generated_at: string;
    phase: string;
    matches_per_round: number;
  };
}

export type FilterMode = 'round' | 'team';

export interface TeamFixture {
  fixture: Fixture;
  round: number;
  isHome: boolean;
  opponent: string;
}
