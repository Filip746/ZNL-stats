import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LeagueTeam } from "../types";
import { getPositionColor, getProbabilityColor } from "../utils/helpers";

interface RelegationLeagueProps {
  teams: LeagueTeam[];
  description: string;
}

export const RelegationLeague: React.FC<RelegationLeagueProps> = ({
  teams,
  description,
}) => {
  if (!teams || teams.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Nema podataka za ligu za ostanak</Text>
      </View>
    );
  }

  // Sortiraj timove po bodovima opadajuće
  const sortedTeams = [...teams].sort(
    (a, b) => b.projected_points - a.projected_points
  );

  return (
    <View style={styles.container}>
      <Text style={styles.blockTitle}>Liga za ostanak</Text>
      <Text style={styles.blockDescription}>{description}</Text>

      {/* Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerPos}>Pos</Text>
        <Text style={styles.headerTeam}>Tim</Text>
        <Text style={styles.headerPoints}>Bodovi</Text>
        <Text style={styles.headerProbs}>Sigurnost %</Text>
      </View>

      {/* Teams */}
      <View style={styles.teamsList}>
        {sortedTeams.map((team, index) => (
          <View key={team.team} style={styles.tableRow}>
            {/* Position */}
            <View
              style={[
                styles.positionIndicator,
                { backgroundColor: getPositionColor(index + 1, false) },
              ]}
            >
              <Text style={styles.positionNumber}>{index + 1}</Text>
            </View>

            {/* Team name */}
            <Text style={styles.tableTeamName}>{team.team}</Text>

            {/* Points */}
            <Text style={styles.tablePoints}>{team.projected_points}</Text>

            {/* Top 3 positions probabilities */}
            <View style={styles.probabilitiesContainer}>
              {Object.entries(team.position_probabilities)
                .slice(0, 3) // Uzmi prva 3 pozicija
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
                    <Text style={styles.probText}>{prob}%</Text>
                  </View>
                ))}
            </View>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legenda pozicija</Text>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: getPositionColor(1, false) },
            ]}
          />
          <Text style={styles.legendText}>1-2: Sigurni od ispadanja</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: getPositionColor(3, false) },
            ]}
          />
          <Text style={styles.legendText}>3-4: Srednje sigurni</Text>
        </View>
        <View style={styles.legendRow}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: getPositionColor(5, false) },
            ]}
          />
          <Text style={styles.legendText}>5-6: Opasnost od ispadanja</Text>
        </View>
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
  legendContainer: {
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
