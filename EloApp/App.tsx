import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";

// Novi TypeScript interfejsi za strukturirani JSON
interface SimulationData {
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

interface Phase1Team {
  team: string;
  projected_points: number;
}

interface PositionsConditionalData {
  team: string;
  total_simulations: number;
  matrix: ConditionalRow[];
}

interface ConditionalRow {
  points: number;
  sample_size: number;
  positions: { [position: string]: number };
}

interface LeagueTeam {
  position: number;
  team: string;
  projected_points: number;
  position_probabilities: {
    "1st": number;
    "2nd": number;
    "3rd": number;
    "4th": number;
    "5th": number;
    "6th": number;
  };
}

interface PointsDistributionData {
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

interface PointsChartItem {
  points: number;
  percentage: number;
  count: number;
}

interface OverallTeam {
  team: string;
  projected_points: number;
  champion_probability: number;
  top6_probability: number;
  all_position_probabilities: number[];
}
type ViewMode =
  | "phase1"
  | "champions"
  | "relegation"
  | "overall"
  | "points"
  | "conditional";

export default function App() {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewMode>("phase1");
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  const [pointsDistribution, setPointsDistribution] =
    useState<PointsDistributionData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("Zadrugar"); // Default tim
  const [loadingPoints, setLoadingPoints] = useState<boolean>(false);
  const [availableTeams, setAvailableTeams] = useState<string[]>([]);

  const [conditionalData, setConditionalData] =
    useState<PositionsConditionalData | null>(null);
  const [loadingConditional, setLoadingConditional] = useState<boolean>(false);

  useEffect(() => {
    fetchSimulationData();
  }, []);

  const fetchPointsDistribution = async (teamName: string) => {
    try {
      setLoadingPoints(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/points-distribution/${teamName}?simulations=10000`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PointsDistributionData = await response.json();
      console.log("POINTS DISTRIBUTION DATA:", data);

      setPointsDistribution(data);
    } catch (error) {
      console.error("POINTS FETCH ERROR:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Greška pri dohvaćanju distribucije"
      );
    } finally {
      setLoadingPoints(false);
    }
  };

  // Dohvati dostupne timove iz simulacijskih podataka
  useEffect(() => {
    if (simulationData?.phase1_results?.teams) {
      const teams = simulationData.phase1_results.teams.map(
        (team) => team.team
      );
      setAvailableTeams(teams);

      // Automatski učitaj distribuciju za prvi tim
      if (teams.length > 0 && currentView === "points") {
        fetchPointsDistribution(selectedTeam);
      }
    }
  }, [simulationData, currentView]);

  // Učitaj distribuciju kad se promijeni odabrani tim
  useEffect(() => {
    if (currentView === "points" && selectedTeam) {
      fetchPointsDistribution(selectedTeam);
    }
  }, [selectedTeam, currentView]);

  const fetchConditionalData = async (teamName: string) => {
    try {
      setLoadingConditional(true);
      setError(null);

      const response = await fetch(
        `http://localhost:5000/api/positions-conditional-matrix/${teamName}?simulations=10000`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PositionsConditionalData = await response.json();
      setConditionalData(data);
    } catch (error) {
      console.error("CONDITIONAL FETCH ERROR:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Greška pri dohvaćanju uvjetnih vjerojatnosti"
      );
    } finally {
      setLoadingConditional(false);
    }
  };

  const fetchSimulationData = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch("http://localhost:5000/api/simulation-text");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SimulationData = await response.json();
      console.log("RECEIVED STRUCTURED DATA", data);

      setSimulationData(data);
      setLastRefreshTime(new Date());

      if (isRefresh) {
        Alert.alert(
          "Simulacija završena! ✅",
          "Nova simulacija je uspješno pokrenuta i rezultati su ažurirani.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("FETCH ERROR:", error);
      setError(error instanceof Error ? error.message : "Nepoznata greška");

      if (isRefresh) {
        Alert.alert(
          "Greška ❌",
          "Simulacija se nije mogla pokrenuti. Molimo pokušajte ponovno.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefreshSimulation = () => {
    Alert.alert(
      "Pokreni novu simulaciju?",
      "Ovo će pokrenuti novu Monte Carlo simulaciju s novim rezultatima. Proces može potrajati nekoliko sekundi.",
      [
        {
          text: "Otkaži",
          style: "cancel",
        },
        {
          text: "Pokreni",
          style: "default",
          onPress: () => fetchSimulationData(true),
        },
      ]
    );
  };

  const getPositionColor = (
    position: number,
    isChampionsLeague: boolean = false
  ): string => {
    if (isChampionsLeague) {
      if (position === 1) return "#FFD700"; // Gold for champion
      if (position <= 3) return "#4CAF50"; // Green for top 3
      return "#FF9800"; // Orange for others
    } else {
      if (position <= 2) return "#4CAF50"; // Safe
      if (position <= 4) return "#FF9800"; // Mid-table
      return "#f44336"; // Relegation danger
    }
  };

  const getProbabilityColor = (percentage: number): string => {
    if (percentage >= 50) return "#4CAF50";
    if (percentage >= 25) return "#FF9800";
    if (percentage >= 10) return "#2196F3";
    return "#9E9E9E";
  };

  const formatLastRefreshTime = (): string => {
    if (!lastRefreshTime) return "";

    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - lastRefreshTime.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return `Ažurirano prije ${diffInSeconds} sekundi`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Ažurirano prije ${minutes} minuta`;
    } else {
      return `Ažurirano ${lastRefreshTime.toLocaleTimeString("hr-HR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }
  };

  const renderNavigationTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, currentView === "phase1" && styles.activeTab]}
        onPress={() => setCurrentView("phase1")}
      >
        <Text
          style={[
            styles.tabText,
            currentView === "phase1" && styles.activeTabText,
          ]}
        >
          Faza 1
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentView === "champions" && styles.activeTab]}
        onPress={() => setCurrentView("champions")}
      >
        <Text
          style={[
            styles.tabText,
            currentView === "champions" && styles.activeTabText,
          ]}
        >
          Prvaci
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentView === "relegation" && styles.activeTab]}
        onPress={() => setCurrentView("relegation")}
      >
        <Text
          style={[
            styles.tabText,
            currentView === "relegation" && styles.activeTabText,
          ]}
        >
          Ostanak
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentView === "overall" && styles.activeTab]}
        onPress={() => setCurrentView("overall")}
      >
        <Text
          style={[
            styles.tabText,
            currentView === "overall" && styles.activeTabText,
          ]}
        >
          Ukupno
        </Text>
      </TouchableOpacity>

      {/* NOVI TAB */}
      <TouchableOpacity
        style={[styles.tab, currentView === "points" && styles.activeTab]}
        onPress={() => setCurrentView("points")}
      >
        <Text
          style={[
            styles.tabText,
            currentView === "points" && styles.activeTabText,
          ]}
        >
          Bodovi
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentView === "conditional" && styles.activeTab]}
        onPress={() => setCurrentView("conditional")}
      >
        <Text
          style={[
            styles.tabText,
            currentView === "conditional" && styles.activeTabText,
          ]}
        >
          Matrix
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderConditionalMatrix = () => {
    if (!availableTeams.length) return null;

    return (
      <View style={styles.modernBlock}>
        <Text style={styles.blockTitle}>Pozicije uvjetno na bodovima</Text>
        <Text style={styles.blockDescription}>
          Vjerojatnost završetka na poziciji ako tim završi s određenim brojem
          bodova
        </Text>

        {/* Team Selector */}
        <View style={styles.teamSelectorContainer}>
          <Text style={styles.teamSelectorLabel}>Odaberi tim:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.teamSelector}
          >
            {availableTeams.map((team) => (
              <TouchableOpacity
                key={team}
                style={[
                  styles.teamButton,
                  selectedTeam === team && styles.teamButtonActive,
                ]}
                onPress={() => {
                  setSelectedTeam(team);
                  fetchConditionalData(team);
                }}
              >
                <Text
                  style={[
                    styles.teamButtonText,
                    selectedTeam === team && styles.teamButtonTextActive,
                  ]}
                >
                  {team}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loadingConditional ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E8B57" />
            <Text style={styles.loadingText}>
              Računam uvjetne vjerojatnosti...
            </Text>
          </View>
        ) : conditionalData ? (
          <View style={styles.matrixContainer}>
            <Text style={styles.matrixTitle}>
              Pozicije uvjetno na bodovima za {conditionalData.team}
            </Text>

            {/* Matrix Header */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.matrixHeader}>
                  <View style={styles.matrixCell}>
                    <Text style={styles.matrixHeaderText}>Bodovi</Text>
                  </View>
                  {[...Array(12)].map((_, i) => (
                    <View key={i} style={styles.matrixCell}>
                      <Text style={styles.matrixHeaderText}>#{i + 1}</Text>
                    </View>
                  ))}
                </View>

                {/* Matrix Rows */}
                {conditionalData.matrix.map((row) => (
                  <View key={row.points} style={styles.matrixRow}>
                    <View style={[styles.matrixCell, styles.pointsCell]}>
                      <Text style={styles.pointsText}>{row.points}</Text>
                    </View>

                    {[...Array(12)].map((_, pos) => {
                      const position = `#${pos + 1}`;
                      const probability = row.positions[position] || 0;

                      return (
                        <View
                          key={pos}
                          style={[
                            styles.matrixCell,
                            {
                              backgroundColor:
                                probability > 20
                                  ? "#2E8B57"
                                  : probability > 10
                                  ? "#4CAF50"
                                  : probability > 5
                                  ? "#FF9800"
                                  : probability > 0
                                  ? "#9E9E9E"
                                  : "#f0f0f0",
                            },
                          ]}
                        >
                          {probability > 0 && (
                            <Text
                              style={[
                                styles.probabilityText,
                                { color: probability > 5 ? "#fff" : "#333" },
                              ]}
                            >
                              {probability}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.matrixLegend}>
              <Text style={styles.legendTitle}>Legenda:</Text>
              <Text style={styles.legendText}>
                Simulacija: {conditionalData.total_simulations.toLocaleString()}{" "}
                pokušaja
              </Text>
              <Text style={styles.legendText}>
                Boje označavaju vjerojatnost:
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>Odaberite tim za prikaz matrice</Text>
        )}
      </View>
    );
  };

  const renderRefreshSection = () => (
    <View style={styles.refreshSection}>
      <View style={styles.refreshInfo}>
        <Text style={styles.refreshTitle}>🎯 Monte Carlo Simulacija</Text>
        {lastRefreshTime && (
          <Text style={styles.refreshTime}>{formatLastRefreshTime()}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.refreshButton,
          refreshing && styles.refreshButtonDisabled,
        ]}
        onPress={handleRefreshSimulation}
        disabled={refreshing}
      >
        {refreshing ? (
          <View style={styles.refreshButtonContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.refreshButtonText}>Simulira...</Text>
          </View>
        ) : (
          <View style={styles.refreshButtonContent}>
            <Text style={styles.refreshButtonIcon}>🔄</Text>
            <Text style={styles.refreshButtonText}>Nova simulacija</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPhase1Results = () => {
    if (!simulationData?.phase1_results.teams) return null;

    return (
      <View style={styles.modernBlock}>
        <Text style={styles.blockTitle}>Rezultati nakon prve faze</Text>
        <Text style={styles.blockDescription}>
          {simulationData.phase1_results.description}
        </Text>

        {simulationData.phase1_results.teams.map((team, index) => (
          <View
            key={team.team}
            style={[
              styles.teamCard,
              { backgroundColor: getPositionColor(index + 1) },
            ]}
          >
            <View style={styles.teamRow}>
              <View style={styles.positionBadge}>
                <Text style={styles.positionText}>{index + 1}</Text>
              </View>
              <Text style={styles.teamName}>{team.team}</Text>
              <Text style={styles.teamPoints}>{team.projected_points} bod</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderChampionsLeague = () => {
    if (!simulationData?.champions_league.teams) return null;

    // Sortiraj timove po bodovima (opadajuće)
    const sortedTeams = [...simulationData.champions_league.teams].sort(
      (a, b) => b.projected_points - a.projected_points
    );

    return (
      <View style={styles.modernBlock}>
        <Text style={styles.blockTitle}>Liga za prvaka</Text>
        <Text style={styles.blockDescription}>
          {simulationData.champions_league.description}
        </Text>

        <View style={styles.tableHeader}>
          <Text style={styles.headerPos}>#</Text>
          <Text style={styles.headerTeam}>Tim</Text>
          <Text style={styles.headerPoints}>Bodovi</Text>
          <Text style={styles.headerProbs}>Top 3 (%)</Text>
        </View>

        {sortedTeams.map((team, index) => (
          <View key={team.team} style={styles.tableRow}>
            <View
              style={[
                styles.positionIndicator,
                { backgroundColor: getPositionColor(index + 1, true) },
              ]}
            >
              <Text style={styles.positionNumber}>{index + 1}</Text>
            </View>

            <Text style={styles.tableTeamName}>{team.team}</Text>
            <Text style={styles.tablePoints}>{team.projected_points}</Text>

            <View style={styles.probabilitiesContainer}>
              <View style={styles.probRow}>
                <Text style={styles.probLabel}>1.</Text>
                <View style={styles.probBar}>
                  <View
                    style={[
                      styles.probFill,
                      {
                        width: `${Math.min(
                          team.position_probabilities["1st"],
                          100
                        )}%`,
                        backgroundColor: getProbabilityColor(
                          team.position_probabilities["1st"]
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.probText}>
                  {team.position_probabilities["1st"]}
                </Text>
              </View>

              <View style={styles.probRow}>
                <Text style={styles.probLabel}>2.</Text>
                <View style={styles.probBar}>
                  <View
                    style={[
                      styles.probFill,
                      {
                        width: `${Math.min(
                          team.position_probabilities["2nd"],
                          100
                        )}%`,
                        backgroundColor: getProbabilityColor(
                          team.position_probabilities["2nd"]
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.probText}>
                  {team.position_probabilities["2nd"]}
                </Text>
              </View>

              <View style={styles.probRow}>
                <Text style={styles.probLabel}>3.</Text>
                <View style={styles.probBar}>
                  <View
                    style={[
                      styles.probFill,
                      {
                        width: `${Math.min(
                          team.position_probabilities["3rd"],
                          100
                        )}%`,
                        backgroundColor: getProbabilityColor(
                          team.position_probabilities["3rd"]
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.probText}>
                  {team.position_probabilities["3rd"]}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRelegationLeague = () => {
    if (!simulationData?.relegation_league.teams) return null;

    // Sortiraj timove po bodovima (opadajuće)
    const sortedTeams = [...simulationData.relegation_league.teams].sort(
      (a, b) => b.projected_points - a.projected_points
    );

    return (
      <View style={styles.modernBlock}>
        <Text style={styles.blockTitle}>Liga za ostanak</Text>
        <Text style={styles.blockDescription}>
          {simulationData.relegation_league.description}
        </Text>

        <View style={styles.tableHeader}>
          <Text style={styles.headerPos}>#</Text>
          <Text style={styles.headerTeam}>Tim</Text>
          <Text style={styles.headerPoints}>Bodovi</Text>
          <Text style={styles.headerProbs}>Sigurnost (%)</Text>
        </View>

        {sortedTeams.map((team, index) => (
          <View key={team.team} style={styles.tableRow}>
            <View
              style={[
                styles.positionIndicator,
                { backgroundColor: getPositionColor(index + 1, false) },
              ]}
            >
              <Text style={styles.positionNumber}>{index + 1}</Text>
            </View>

            <Text style={styles.tableTeamName}>{team.team}</Text>
            <Text style={styles.tablePoints}>{team.projected_points}</Text>

            <View style={styles.probabilitiesContainer}>
              {Object.entries(team.position_probabilities)
                .slice(0, 3)
                .map(([pos, prob], idx) => (
                  <View key={pos} style={styles.probRow}>
                    <Text style={styles.probLabel}>{pos}</Text>
                    <View style={styles.probBar}>
                      <View
                        style={[
                          styles.probFill,
                          {
                            width: `${Math.min(prob, 100)}%`,
                            backgroundColor: getProbabilityColor(prob),
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.probText}>{prob}</Text>
                  </View>
                ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderOverallStatistics = () => {
    if (!simulationData?.overall_statistics.teams) return null;

    return (
      <View style={styles.modernBlock}>
        <Text style={styles.blockTitle}>Ukupne statistike</Text>
        <Text style={styles.blockDescription}>
          Šanse za osvajanje prvenstva i top 6 poziciju
        </Text>

        <View style={styles.statsGrid}>
          {simulationData.overall_statistics.teams
            .sort((a, b) => b.champion_probability - a.champion_probability)
            .map((team) => (
              <View key={team.team} style={styles.statsCard}>
                <Text style={styles.statsTeamName}>{team.team}</Text>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Proj. bodovi:</Text>
                  <Text style={styles.statValue}>{team.projected_points}</Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Prvak:</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: getProbabilityColor(team.champion_probability) },
                    ]}
                  >
                    {team.champion_probability}%
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Top 6:</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: getProbabilityColor(team.top6_probability) },
                    ]}
                  >
                    {team.top6_probability}%
                  </Text>
                </View>
              </View>
            ))}
        </View>

        <View style={styles.metadataContainer}>
          <Text style={styles.metadataTitle}>Info o simulaciji</Text>
          <Text style={styles.metadataText}>
            Simulacija:{" "}
            {simulationData.simulation_summary.total_simulations.toLocaleString()}{" "}
            pokušaja
          </Text>
          <Text style={styles.metadataText}>
            K faktor: {simulationData.simulation_summary.k_factor}
          </Text>
          <Text style={styles.metadataText}>
            Generirano:{" "}
            {new Date(simulationData.metadata.generated_at).toLocaleString(
              "hr-HR"
            )}
          </Text>
        </View>
      </View>
    );
  };

  const renderPointsDistribution = () => {
    if (!availableTeams.length) return null;

    return (
      <View style={styles.modernBlock}>
        <Text style={styles.blockTitle}>Distribucija bodova</Text>
        <Text style={styles.blockDescription}>
          Vjerojatnost broja bodova za odabrani tim kroz sve simulacije
        </Text>

        {/* Team Selector */}
        <View style={styles.teamSelectorContainer}>
          <Text style={styles.teamSelectorLabel}>Odaberi tim:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.teamSelector}
          >
            {availableTeams.map((team) => (
              <TouchableOpacity
                key={team}
                style={[
                  styles.teamButton,
                  selectedTeam === team && styles.teamButtonActive,
                ]}
                onPress={() => setSelectedTeam(team)}
              >
                <Text
                  style={[
                    styles.teamButtonText,
                    selectedTeam === team && styles.teamButtonTextActive,
                  ]}
                >
                  {team}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loadingPoints ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E8B57" />
            <Text style={styles.loadingText}>Računam distribuciju...</Text>
          </View>
        ) : pointsDistribution ? (
          <View>
            {/* Statistics Summary */}
            <View style={styles.statisticsSummary}>
              <View style={styles.statSummaryRow}>
                <View style={styles.statSummaryItem}>
                  <Text style={styles.statSummaryLabel}>Prosjek</Text>
                  <Text style={styles.statSummaryValue}>
                    {pointsDistribution.statistics.avg_points} bod
                  </Text>
                </View>
                <View style={styles.statSummaryItem}>
                  <Text style={styles.statSummaryLabel}>Raspon</Text>
                  <Text style={styles.statSummaryValue}>
                    {pointsDistribution.statistics.min_points}-
                    {pointsDistribution.statistics.max_points}
                  </Text>
                </View>
              </View>

              <View style={styles.statSummaryRow}>
                <View style={styles.statSummaryItem}>
                  <Text style={styles.statSummaryLabel}>Liga prvaka</Text>
                  <Text style={[styles.statSummaryValue, { color: "#4CAF50" }]}>
                    {
                      pointsDistribution.league_appearances
                        .champions_league_percentage
                    }
                    %
                  </Text>
                </View>
                <View style={styles.statSummaryItem}>
                  <Text style={styles.statSummaryLabel}>Liga ostanak</Text>
                  <Text style={[styles.statSummaryValue, { color: "#FF9800" }]}>
                    {
                      pointsDistribution.league_appearances
                        .relegation_league_percentage
                    }
                    %
                  </Text>
                </View>
              </View>
            </View>

            {/* Points Distribution Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>
                Distribucija vjerojatnosti bodova
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.barChart}>
                  {pointsDistribution.chart_data
                    .sort((a, b) => a.points - b.points)
                    .map((item) => {
                      const maxPercentage = Math.max(
                        ...pointsDistribution.chart_data.map(
                          (d) => d.percentage
                        )
                      );
                      const barHeight = Math.max(
                        (item.percentage / maxPercentage) * 150, // Max height 150
                        item.percentage > 0 ? 5 : 0 // Minimum visible height
                      );

                      return (
                        <View key={item.points} style={styles.barContainer}>
                          <Text style={styles.barPercentage}>
                            {item.percentage}%
                          </Text>
                          <View
                            style={[
                              styles.bar,
                              {
                                height: barHeight,
                                backgroundColor:
                                  item.percentage >= 10
                                    ? "#2E8B57"
                                    : item.percentage >= 5
                                    ? "#4CAF50"
                                    : item.percentage >= 2
                                    ? "#FF9800"
                                    : "#9E9E9E",
                              },
                            ]}
                          />
                          <Text style={styles.barLabel}>{item.points}</Text>
                        </View>
                      );
                    })}
                </View>
              </ScrollView>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>
            Odaberite tim za prikaz distribucije
          </Text>
        )}
      </View>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "phase1":
        return renderPhase1Results();
      case "champions":
        return renderChampionsLeague();
      case "relegation":
        return renderRelegationLeague();
      case "overall":
        return renderOverallStatistics();
      case "points":
        return renderPointsDistribution();
      case "conditional": // NOVI
        return renderConditionalMatrix();
      default:
        return renderPhase1Results();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerGradientTop} />
          <View style={styles.headerGradientMiddle} />
          <View style={styles.headerGradientBottom} />
          <View style={styles.headerContent}>
            <Text style={styles.title}>⚽ ELO Simulacija</Text>
            <Text style={styles.subtitle}>1. ZNL Varaždin - Statistika</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E8B57" />
          <Text style={styles.loadingText}>Računanje simulacija...</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchSimulationData()}
          >
            <Text style={styles.retryButtonText}>Ponovi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerGradientTop} />
          <View style={styles.headerGradientMiddle} />
          <View style={styles.headerGradientBottom} />
          <View style={styles.headerContent}>
            <Text style={styles.title}>⚽ ELO Simulacija</Text>
            <Text style={styles.subtitle}>1. ZNL Varaždin - Statistika</Text>
          </View>
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Greška pri dohvaćanju podataka</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchSimulationData()}
          >
            <Text style={styles.retryButtonText}>Pokušaj ponovno</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerGradientTop} />
        <View style={styles.headerGradientMiddle} />
        <View style={styles.headerGradientBottom} />
        <View style={styles.headerContent}>
          <Text style={styles.title}>⚽ ELO Simulacija</Text>
          <Text style={styles.subtitle}>1. ZNL Varaždin - Statistika</Text>
        </View>
      </View>

      {renderRefreshSection()}
      {renderNavigationTabs()}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {renderCurrentView()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    position: "relative",
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#2E8B57",
  },
  headerGradientMiddle: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#32935D",
  },
  headerGradientBottom: {
    position: "absolute",
    top: "60%",
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "#3CB371",
  },
  headerContent: {
    position: "relative",
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "#e8f5e8",
    fontWeight: "600",
  },
  refreshSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshInfo: {
    flex: 1,
  },
  refreshTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E8B57",
    marginBottom: 4,
  },
  refreshTime: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  refreshButton: {
    backgroundColor: "#2E8B57",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
  },
  refreshButtonDisabled: {
    backgroundColor: "#9E9E9E",
  },
  refreshButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#2E8B57",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  modernBlock: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  blockTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E8B57",
    marginBottom: 8,
    textAlign: "center",
  },
  blockDescription: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  teamCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  positionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2E8B57",
  },
  teamName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  teamPoints: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  headerPos: {
    width: 30,
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  headerTeam: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  headerPoints: {
    width: 60,
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
  },
  headerProbs: {
    width: 120,
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  positionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  positionNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  tableTeamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  tablePoints: {
    width: 60,
    fontSize: 14,
    fontWeight: "600",
    color: "#2E8B57",
    textAlign: "center",
  },
  probabilitiesContainer: {
    width: 120,
  },
  probRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  probLabel: {
    width: 15,
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
  },
  probBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  probFill: {
    height: "100%",
    borderRadius: 4,
  },
  probText: {
    width: 25,
    fontSize: 9,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
  },
  statsGrid: {
    gap: 12,
  },
  statsCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2E8B57",
  },
  statsTeamName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E8B57",
    marginBottom: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  metadataContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E8B57",
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f44336",
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#2E8B57",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  teamSelectorContainer: {
    marginBottom: 20,
  },
  teamSelectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  teamSelector: {
    flexDirection: "row",
  },
  teamButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: "center",
  },
  teamButtonActive: {
    backgroundColor: "#2E8B57",
  },
  teamButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  teamButtonTextActive: {
    color: "#fff",
  },
  statisticsSummary: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statSummaryItem: {
    flex: 1,
    alignItems: "center",
  },
  statSummaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statSummaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E8B57",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    minWidth: 800, // Za horizontalni scroll
  },
  barContainer: {
    alignItems: "center",
    marginHorizontal: 3,
    minWidth: 35,
  },
  barPercentage: {
    fontSize: 8,
    color: "#333",
    fontWeight: "600",
    marginBottom: 4,
    minHeight: 12,
  },
  bar: {
    width: 28,
    borderRadius: 2,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    fontStyle: "italic",
  },

  matrixContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  matrixTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E8B57",
    textAlign: "center",
    marginBottom: 16,
  },
  matrixHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#2E8B57",
  },
  matrixRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  matrixCell: {
    width: 50,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
  pointsCell: {
    backgroundColor: "#f8f9fa",
    width: 60,
  },
  matrixHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E8B57",
  },
  pointsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  probabilityText: {
    fontSize: 10,
    fontWeight: "600",
  },
  matrixLegend: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  legendText: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
  },
});
