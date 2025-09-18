import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Round, Fixture, FilterMode } from "../types";
import { useFixtures } from "../hooks/useFixtures";
import { COLORS } from "../styles";

const FixturesTable: React.FC = () => {
  const { data: fixturesData, loading, error, refetch } = useFixtures();
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  // NOVI STATE - dodajte ovo
  const [filterMode, setFilterMode] = useState<FilterMode>("round");
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  // Dobij sve timove iz fixtures
  const availableTeams = useMemo(() => {
    if (!fixturesData) return [];
    const teams = new Set<string>();
    fixturesData.rounds.forEach((round) => {
      round.fixtures.forEach((fixture) => {
        teams.add(fixture.home_team);
        teams.add(fixture.away_team);
      });
    });
    return Array.from(teams).sort();
  }, [fixturesData]);

  // Filtriraj fixtures po timu
  const getTeamFixtures = (teamName: string) => {
    if (!fixturesData) return [];
    const teamFixtures: Array<{ fixture: Fixture; round: number }> = [];

    fixturesData.rounds.forEach((round) => {
      round.fixtures.forEach((fixture) => {
        if (fixture.home_team === teamName || fixture.away_team === teamName) {
          teamFixtures.push({ fixture, round: round.round_number });
        }
      });
    });

    return teamFixtures;
  };

  const handleRoundPress = (roundNumber: number) => {
    setSelectedRound(selectedRound === roundNumber ? null : roundNumber);
  };

  // NOVA funkcija za renderiranje team fixtures
  const renderTeamFixture = (
    item: { fixture: Fixture; round: number },
    index: number,
    isLast: boolean
  ) => {
    const { fixture, round } = item;
    const isSelectedTeamHome = fixture.home_team === selectedTeam;

    return (
      <View
        key={fixture.match_id}
        style={[styles.fixtureRow, isLast && styles.fixtureRowLast]}
      >
        <View style={styles.teamFixtureContainer}>
          <Text style={styles.roundNumber}>Kolo {round}</Text>
          <View style={styles.fixtureContainer}>
            {/* DOMAĆI TIM - uvijek prvi */}
            <Text
              style={[
                styles.homeTeam,
                isSelectedTeamHome && styles.selectedTeamHighlight,
              ]}
            >
              {fixture.home_team}
            </Text>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>vs</Text>
            </View>

            {/* GOSTUJUĆI TIM - uvijek drugi */}
            <Text
              style={[
                styles.awayTeam,
                !isSelectedTeamHome && styles.selectedTeamHighlight,
              ]}
            >
              {fixture.away_team}
            </Text>
          </View>
        </View>
        <Text style={styles.matchId}>{fixture.match_id}</Text>
      </View>
    );
  };

  const renderFixture = (fixture: Fixture, index: number, isLast: boolean) => (
    <View
      key={fixture.match_id}
      style={[styles.fixtureRow, isLast && styles.fixtureRowLast]}
    >
      <View style={styles.fixtureContainer}>
        <Text style={styles.homeTeam}>{fixture.home_team}</Text>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>vs</Text>
        </View>
        <Text style={styles.awayTeam}>{fixture.away_team}</Text>
      </View>
      <Text style={styles.matchId}>{fixture.match_id}</Text>
    </View>
  );

  const renderRound = (round: Round) => {
    const isSelected = selectedRound === round.round_number;

    return (
      <View key={round.round_number} style={styles.roundContainer}>
        <TouchableOpacity
          style={[styles.roundHeader, isSelected && styles.roundHeaderSelected]}
          onPress={() => handleRoundPress(round.round_number)}
          activeOpacity={0.7}
        >
          <View style={styles.roundHeaderContent}>
            <Text
              style={[
                styles.roundTitle,
                isSelected && styles.roundTitleSelected,
              ]}
            >
              Kolo {round.round_number}
            </Text>
            <Text
              style={[
                styles.roundSubtitle,
                isSelected && styles.roundSubtitleSelected,
              ]}
            >
              {round.fixtures.length} utakmica
            </Text>
          </View>
          <Text
            style={[styles.expandIcon, isSelected && styles.expandIconSelected]}
          >
            {isSelected ? "−" : "+"}
          </Text>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.fixturesContainer}>
            {round.fixtures.map((fixture, index) =>
              renderFixture(fixture, index, index === round.fixtures.length - 1)
            )}
          </View>
        )}
      </View>
    );
  };

  // NOVI render content ovisno o filter mode
  const renderContent = () => {
    if (filterMode === "team") {
      if (!selectedTeam) {
        return (
          <View style={styles.noSelectionContainer}>
            <Text style={styles.noSelectionText}>
              Odaberite tim za prikaz utakmica
            </Text>
          </View>
        );
      }

      const teamFixtures = getTeamFixtures(selectedTeam);

      return (
        <View style={styles.teamFixturesContainer}>
          <Text style={styles.teamFixturesTitle}>
            {selectedTeam} - {teamFixtures.length} utakmica
          </Text>
          {teamFixtures.map((item, index) =>
            renderTeamFixture(item, index, index === teamFixtures.length - 1)
          )}
        </View>
      );
    }

    // Round mode (postojeći kod)
    return fixturesData!.rounds.map((round) => renderRound(round));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Učitavam raspored utakmica...</Text>
      </View>
    );
  }

  if (error || !fixturesData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || "Nema podataka o rasporedu utakmica"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Pokušaj ponovno</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Raspored utakmica</Text>
          <Text style={styles.subtitle}>
            {fixturesData.total_rounds} kola • {fixturesData.total_fixtures}{" "}
            utakmica
          </Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refetch}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>⟳</Text>
        </TouchableOpacity>
      </View>

      {/* DODAJTE OVU SEKCIJU - FILTER SECTION */}
      <View style={styles.filterSection}>
        <View style={styles.filterToggle}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterMode === "round" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterMode("round")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterMode === "round" && styles.filterButtonTextActive,
              ]}
            >
              Round
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterMode === "team" && styles.filterButtonActive,
            ]}
            onPress={() => setFilterMode("team")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterMode === "team" && styles.filterButtonTextActive,
              ]}
            >
              Team
            </Text>
          </TouchableOpacity>
        </View>

        {filterMode === "team" && (
          <View style={styles.teamSelector}>
            <Text style={styles.selectorLabel}>Select Team:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTeam}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedTeam(itemValue)}
              >
                <Picker.Item label="Odaberite tim..." value="" />
                {availableTeams.map((team) => (
                  <Picker.Item key={team} label={team} value={team} />
                ))}
              </Picker>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {renderContent()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Prva faza lige - 6 utakmica po kolo
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  refreshButtonText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: "bold",
    textAlign: "center",
  },
  // NOVI STILOVI - dodajte ih
  filterSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  teamSelector: {
    marginTop: 8,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  picker: {
    height: 50,
  },
  noSelectionContainer: {
    padding: 40,
    alignItems: "center",
  },
  noSelectionText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  teamFixturesContainer: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  teamFixturesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  teamFixtureContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  roundNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    width: 60,
    textAlign: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  // POSTOJEĆI STILOVI
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  roundContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  roundHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  roundHeaderSelected: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 0,
  },
  roundHeaderContent: {
    flex: 1,
  },
  roundTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  roundTitleSelected: {
    color: COLORS.white,
  },
  roundSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  roundSubtitleSelected: {
    color: COLORS.white,
    opacity: 0.8,
  },
  expandIcon: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: "bold",
    width: 30,
    textAlign: "center",
  },
  expandIconSelected: {
    color: COLORS.white,
  },
  fixturesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: COLORS.white,
  },
  fixtureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 48,
  },
  fixtureRowLast: {
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  fixtureContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  homeTeam: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: "right",
    paddingRight: 8,
    lineHeight: 20,
  },
  vsContainer: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  vsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  awayTeam: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: "left",
    paddingLeft: 8,
    lineHeight: 20,
  },
  matchId: {
    fontSize: 10,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontFamily: "monospace",
    minWidth: 48,
    textAlign: "center",
    lineHeight: 14,
  },
  footer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  selectedTeamHighlight: {
    fontWeight: "bold",
    color: COLORS.primary,
    fontSize: 12, // malo veći font
  },
});

export default FixturesTable;
