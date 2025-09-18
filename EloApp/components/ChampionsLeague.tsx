import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LeagueTeam } from "../types";
import { getPositionColor, getProbabilityColor } from "../utils/helpers";

interface ChampionsLeagueProps {
  teams: LeagueTeam[];
  description: string;
}

export const ChampionsLeague: React.FC<ChampionsLeagueProps> = ({
  teams,
  description,
}) => {
  if (!teams || teams.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Nema podataka za ligu prvaka</Text>
      </View>
    );
  }

  // Sortiraj timove po bodovima opadajuće
  const sortedTeams = [...teams].sort(
    (a, b) => b.projected_points - a.projected_points
  );

  return (
    <View style={styles.container}>
      <Text style={styles.blockTitle}>Liga za prvaka</Text>
      <Text style={styles.blockDescription}>{description}</Text>

      {/* Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerPos}>Pos</Text>
        <Text style={styles.headerTeam}>Tim</Text>
        <Text style={styles.headerPoints}>Bodovi</Text>
        <Text style={styles.headerProbs}>Top 3 %</Text>
      </View>

      {/* Teams */}
      <View style={styles.teamsList}>
        {sortedTeams.map((team, index) => (
          <View key={team.team} style={styles.tableRow}>
            {/* Position */}
            <View
              style={[
                styles.positionIndicator,
                { backgroundColor: getPositionColor(index + 1, true) },
              ]}
            >
              <Text style={styles.positionNumber}>{index + 1}</Text>
            </View>

            {/* Team name */}
            <Text style={styles.tableTeamName}>{team.team}</Text>

            {/* Points */}
            <Text style={styles.tablePoints}>{team.projected_points}</Text>

            {/* Probabilities */}
            <View style={styles.probabilitiesContainer}>
              {/* 1st place */}
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
                  {team.position_probabilities["1st"]}%
                </Text>
              </View>

              {/* 2nd place */}
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
                  {team.position_probabilities["2nd"]}%
                </Text>
              </View>

              {/* 3rd place */}
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
                  {team.position_probabilities["3rd"]}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
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
  teamsList: {
    gap: 4,
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
  noDataText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    fontStyle: "italic",
  },
});
