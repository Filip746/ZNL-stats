import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { OverallTeam, SimulationData } from "../types";
import { getProbabilityColor, formatNumber } from "../utils/helpers";

interface OverallStatisticsProps {
  teams: OverallTeam[];
  description: string;
  metadata?: SimulationData["metadata"];
  simulationSummary?: SimulationData["simulation_summary"];
}

export const OverallStatistics: React.FC<OverallStatisticsProps> = ({
  teams,
  description,
  metadata,
  simulationSummary,
}) => {
  if (!teams || teams.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>
          Nema podataka za ukupne statistike
        </Text>
      </View>
    );
  }

  // Sortiraj timove po vjerojatnosti osvajanja prvenstva
  const sortedTeams = [...teams].sort(
    (a, b) => b.champion_probability - a.champion_probability
  );

  return (
    <View style={styles.container}>
      <Text style={styles.blockTitle}>Ukupne statistike</Text>
      <Text style={styles.blockDescription}>
        Šanse za osvajanje prvenstva i top 6 poziciju
      </Text>

      <View style={styles.statsGrid}>
        {sortedTeams.map((team) => (
          <View key={team.team} style={styles.statsCard}>
            <Text style={styles.statsTeamName}>{team.team}</Text>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Proj. bodovi</Text>
              <Text style={styles.statValue}>{team.projected_points}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Prvak</Text>
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
              <Text style={styles.statLabel}>Top 6</Text>
              <Text
                style={[
                  styles.statValue,
                  { color: getProbabilityColor(team.top6_probability) },
                ]}
              >
                {team.top6_probability}%
              </Text>
            </View>

            {/* Probability bars */}
            <View style={styles.probabilityBarsContainer}>
              <View style={styles.probabilityBar}>
                <Text style={styles.probabilityBarLabel}>Prvak</Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(team.champion_probability, 100)}%`,
                        backgroundColor: getProbabilityColor(
                          team.champion_probability
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.probabilityBarValue}>
                  {team.champion_probability}%
                </Text>
              </View>

              <View style={styles.probabilityBar}>
                <Text style={styles.probabilityBarLabel}>Top 6</Text>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(team.top6_probability, 100)}%`,
                        backgroundColor: getProbabilityColor(
                          team.top6_probability
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.probabilityBarValue}>
                  {team.top6_probability}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Metadata section */}
      {(metadata || simulationSummary) && (
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataTitle}>Info o simulaciji</Text>

          {simulationSummary && (
            <>
              <Text style={styles.metadataText}>
                Simulacija: {formatNumber(simulationSummary.total_simulations)}{" "}
                pokušaja
              </Text>
              <Text style={styles.metadataText}>
                K faktor: {simulationSummary.k_factor}
              </Text>
            </>
          )}

          {metadata && (
            <>
              <Text style={styles.metadataText}>
                Generirano:{" "}
                {new Date(metadata.generated_at).toLocaleString("hr-HR")}
              </Text>
              <Text style={styles.metadataText}>
                Ukupno timova: {metadata.total_teams}
              </Text>
            </>
          )}
        </View>
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
  probabilityBarsContainer: {
    marginTop: 12,
    gap: 8,
  },
  probabilityBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  probabilityBarLabel: {
    width: 40,
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  probabilityBarValue: {
    width: 35,
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    textAlign: "right",
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
  noDataText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    fontStyle: "italic",
  },
});
