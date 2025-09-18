import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { PositionsConditionalData } from "../types";
import { formatNumber } from "../utils/helpers";
import { TeamSelector } from "./TeamSelector";

interface ConditionalMatrixProps {
  availableTeams: string[];
  selectedTeam: string;
  conditionalData: PositionsConditionalData | null;
  loadingConditional: boolean;
  onTeamSelect: (team: string) => void;
}

export const ConditionalMatrix: React.FC<ConditionalMatrixProps> = ({
  availableTeams,
  selectedTeam,
  conditionalData,
  loadingConditional,
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
      <Text style={styles.blockTitle}>Pozicije uvjetno na bodovima</Text>
      <Text style={styles.blockDescription}>
        Vjerojatnost završetka na poziciji ako tim završi s određenim brojem
        bodova
      </Text>

      <TeamSelector
        availableTeams={availableTeams}
        selectedTeam={selectedTeam}
        onTeamSelect={onTeamSelect}
        label="Odaberi tim"
        disabled={loadingConditional}
      />

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
                {Array.from({ length: 12 }, (_, i) => (
                  <View key={i} style={styles.matrixCell}>
                    <Text style={styles.matrixHeaderText}>#{i + 1}</Text>
                  </View>
                ))}
              </View>

              {/* Matrix Rows - ORIGINALNA LOGIKA */}
              {conditionalData.matrix.map((row) => (
                <View key={row.points} style={styles.matrixRow}>
                  <View style={[styles.matrixCell, styles.pointsCell]}>
                    <Text style={styles.pointsText}>{row.points}</Text>
                  </View>

                  {Array.from({ length: 12 }, (_, pos) => {
                    const position = pos + 1;
                    const probability = row.positions[`#${position}`] || 0;

                    return (
                      <View
                        key={pos}
                        style={[
                          styles.matrixCell,
                          {
                            backgroundColor:
                              probability >= 50
                                ? "#1B5E20" // Tamno zelena
                                : probability >= 30
                                ? "#2E7D32" // Srednje tamno zelena
                                : probability >= 15
                                ? "#4CAF50" // Srednja zelena
                                : probability >= 5
                                ? "#81C784" // Svjetlo zelena
                                : probability > 0
                                ? "#C8E6C9" // Vrlo svjetlo zelena
                                : "#FFFFFF", // Bijela za 0%
                          },
                        ]}
                      >
                        {probability > 0 && (
                          <Text
                            style={[
                              styles.probabilityText,
                              { color: probability >= 15 ? "#fff" : "#333" },
                            ]}
                          >
                            {probability}%
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Matrix Legend */}
          <View style={styles.matrixLegend}>
            <Text style={styles.legendTitle}>Legenda</Text>
            <Text style={styles.legendText}>
              Simulacija: {conditionalData.total_simulations.toLocaleString()}{" "}
              pokušaja
            </Text>
            <Text style={styles.legendText}>Boje označavaju vjerojatnost</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>Odaberite tim za prikaz matrice</Text>
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
  noDataText: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    fontStyle: "italic",
  },
});
