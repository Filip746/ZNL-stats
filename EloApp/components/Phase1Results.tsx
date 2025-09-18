import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Phase1Team } from "../types";
import { getPositionColor } from "../utils/helpers";

interface Phase1ResultsProps {
  teams: Phase1Team[];
  description: string;
}

export const Phase1Results: React.FC<Phase1ResultsProps> = ({
  teams,
  description,
}) => {
  if (!teams || teams.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Nema podataka za prvu fazu</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.blockTitle}>Rezultati nakon prve faze</Text>
      <Text style={styles.blockDescription}>{description}</Text>

      <View style={styles.teamsList}>
        {teams.map((team, index) => (
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
  teamsList: {
    gap: 12,
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
  noDataText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    fontStyle: "italic",
  },
});
