import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

interface TeamSelectorProps {
  availableTeams: string[];
  selectedTeam: string;
  onTeamSelect: (team: string) => void;
  label?: string;
  disabled?: boolean;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  availableTeams,
  selectedTeam,
  onTeamSelect,
  label = "Odaberi tim",
  disabled = false,
}) => {
  if (!availableTeams.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.noTeamsContainer}>
          <Text style={styles.noTeamsText}>Nema dostupnih timova</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {availableTeams.map((team) => (
          <TouchableOpacity
            key={team}
            style={[
              styles.teamButton,
              selectedTeam === team && styles.teamButtonActive,
              disabled && styles.teamButtonDisabled,
            ]}
            onPress={() => !disabled && onTeamSelect(team)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.teamButtonText,
                selectedTeam === team && styles.teamButtonTextActive,
                disabled && styles.teamButtonTextDisabled,
              ]}
            >
              {team}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedTeam && (
        <View style={styles.selectedTeamInfo}>
          <Text style={styles.selectedTeamLabel}>Odabrani tim:</Text>
          <Text style={styles.selectedTeamName}>{selectedTeam}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  teamButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  teamButtonActive: {
    backgroundColor: "#2E8B57",
    borderColor: "#2E8B57",
  },
  teamButtonDisabled: {
    backgroundColor: "#e0e0e0",
    opacity: 0.6,
  },
  teamButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  teamButtonTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  teamButtonTextDisabled: {
    color: "#999",
  },
  selectedTeamInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  selectedTeamLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  selectedTeamName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2E8B57",
  },
  noTeamsContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  noTeamsText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});
