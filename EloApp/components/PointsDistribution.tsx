import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { PointsDistributionData, PointsChartItem } from "../types";
import { getChartBarColor, getChartBarHeight } from "../utils/helpers";
import { TeamSelector } from "./TeamSelector";

interface PointsDistributionProps {
  availableTeams: string[];
  selectedTeam: string;
  pointsDistribution: PointsDistributionData | null;
  loadingPoints: boolean;
  onTeamSelect: (team: string) => void;
}

export const PointsDistribution: React.FC<PointsDistributionProps> = ({
  availableTeams,
  selectedTeam,
  pointsDistribution,
  loadingPoints,
  onTeamSelect,
}) => {
  if (!availableTeams.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Nema dostupnih timova</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.blockTitle}>Distribucija bodova</Text>
      <Text style={styles.blockDescription}>
        Vjerojatnost broja bodova za odabrani tim kroz sve simulacije
      </Text>

      <TeamSelector
        availableTeams={availableTeams}
        selectedTeam={selectedTeam}
        onTeamSelect={onTeamSelect}
        label="Odaberi tim"
        disabled={loadingPoints}
      />

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
                      ...pointsDistribution.chart_data.map((d) => d.percentage)
                    );
                    const barHeight = getChartBarHeight(
                      item.percentage,
                      maxPercentage,
                      150
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
                              backgroundColor: getChartBarColor(
                                item.percentage
                              ),
                            },
                          ]}
                        />

                        <Text style={styles.barLabel}>{item.points}</Text>
                        <Text style={styles.barCount}>({item.count})</Text>
                      </View>
                    );
                  })}
              </View>
            </ScrollView>

            {/* Chart Legend */}
            <View style={styles.chartLegend}>
              <Text style={styles.legendTitle}>Legenda boja</Text>
              <View style={styles.legendRow}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#2E8B57" }]}
                />
                <Text style={styles.legendText}>
                  ≥10% - Visoka vjerojatnost
                </Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#4CAF50" }]}
                />
                <Text style={styles.legendText}>
                  5-10% - Umjerena vjerojatnost
                </Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#FF9800" }]}
                />
                <Text style={styles.legendText}>2-5% - Niska vjerojatnost</Text>
              </View>
              <View style={styles.legendRow}>
                <View
                  style={[styles.legendColor, { backgroundColor: "#9E9E9E" }]}
                />
                <Text style={styles.legendText}>
                  {"<2%"} - Vrlo niska vjerojatnost
                </Text>
              </View>
            </View>
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

const styles = StyleSheet.create({
  container: {
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
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
    minWidth: 800,
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
  barCount: {
    fontSize: 8,
    color: "#999",
    marginTop: 2,
  },
  chartLegend: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    color: "#666",
  },
  noDataText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    fontStyle: "italic",
  },
});
