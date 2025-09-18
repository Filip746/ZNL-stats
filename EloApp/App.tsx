import React, { useState, useEffect } from "react";
import { View, ScrollView, ActivityIndicator, Text, Alert } from "react-native";
import { ViewMode } from "./types";
import { DEFAULT_VIEW, DEFAULT_TEAM } from "./constants";
import { styles } from "./styles";

// Components
import { Header } from "./components/Header";
import { RefreshSection } from "./components/RefreshSection";
import { NavigationTabs } from "./components/NavigationTabs";
import { Phase1Results } from "./components/Phase1Results";
import { ChampionsLeague } from "./components/ChampionsLeague";
import { RelegationLeague } from "./components/RelegationLeague";
import { OverallStatistics } from "./components/OverallStatistics";
import { PointsDistribution } from "./components/PointsDistribution";
import { ConditionalMatrix } from "./components/ConditionalMatrix";

// Hooks
import { useSimulation } from "./hooks/useSimulation";
import { usePointsDistribution } from "./hooks/usePointsDistribution";
import { useConditionalData } from "./hooks/useConditionalData";

export default function App() {
  // View state
  const [currentView, setCurrentView] = useState<ViewMode>(DEFAULT_VIEW);

  // Simulation hook
  const {
    simulationData,
    loading,
    refreshing,
    error,
    lastRefreshTime,
    availableTeams,
    handleRefreshSimulation,
  } = useSimulation();

  // Points distribution hook
  const {
    pointsDistribution,
    selectedTeam: pointsSelectedTeam,
    loadingPoints,
    error: pointsError,
    setSelectedTeam: setPointsSelectedTeam,
    setAvailableTeams: setPointsAvailableTeams,
    clearPointsData,
  } = usePointsDistribution();

  // Conditional data hook
  const {
    conditionalData,
    selectedTeam: conditionalSelectedTeam,
    loadingConditional,
    error: conditionalError,
    setSelectedTeam: setConditionalSelectedTeam,
    setAvailableTeams: setConditionalAvailableTeams,
    clearConditionalData,
  } = useConditionalData();

  // Sync available teams between hooks
  useEffect(() => {
    setPointsAvailableTeams(availableTeams);
    setConditionalAvailableTeams(availableTeams);
  }, [availableTeams, setPointsAvailableTeams, setConditionalAvailableTeams]);

  // Clear data when view changes
  useEffect(() => {
    if (currentView !== "points") {
      clearPointsData();
    }
    if (currentView !== "conditional") {
      clearConditionalData();
    }
  }, [currentView, clearPointsData, clearConditionalData]);

  // Handle view change
  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
  };

  // Render current view content
  const renderCurrentView = () => {
    if (
      !simulationData &&
      currentView !== "points" &&
      currentView !== "conditional"
    ) {
      return (
        <View style={styles.modernBlock}>
          <Text style={styles.noDataText}>Nema podataka za prikaz</Text>
        </View>
      );
    }

    switch (currentView) {
      case "phase1":
        return simulationData?.phase1_results ? (
          <Phase1Results
            teams={simulationData.phase1_results.teams}
            description={simulationData.phase1_results.description}
          />
        ) : null;

      case "champions":
        return simulationData?.champions_league ? (
          <ChampionsLeague
            teams={simulationData.champions_league.teams}
            description={simulationData.champions_league.description}
          />
        ) : null;

      case "relegation":
        return simulationData?.relegation_league ? (
          <RelegationLeague
            teams={simulationData.relegation_league.teams}
            description={simulationData.relegation_league.description}
          />
        ) : null;

      case "overall":
        return simulationData?.overall_statistics ? (
          <OverallStatistics
            teams={simulationData.overall_statistics.teams}
            description={simulationData.overall_statistics.description}
            metadata={simulationData.metadata}
            simulationSummary={simulationData.simulation_summary}
          />
        ) : null;

      case "points":
        return (
          <PointsDistribution
            availableTeams={availableTeams}
            selectedTeam={pointsSelectedTeam}
            pointsDistribution={pointsDistribution}
            loadingPoints={loadingPoints}
            onTeamSelect={setPointsSelectedTeam}
          />
        );

      case "conditional":
        return (
          <ConditionalMatrix
            availableTeams={availableTeams}
            selectedTeam={conditionalSelectedTeam}
            conditionalData={conditionalData}
            loadingConditional={loadingConditional}
            onTeamSelect={setConditionalSelectedTeam}
          />
        );

      default:
        return simulationData?.phase1_results ? (
          <Phase1Results
            teams={simulationData.phase1_results.teams}
            description={simulationData.phase1_results.description}
          />
        ) : null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E8B57" />
          <Text style={styles.loadingText}>Računanje simulacija...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !simulationData) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Greška pri dohvaćanju podataka</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  // Main app render
  return (
    <View style={styles.container}>
      <Header />

      <RefreshSection
        lastRefreshTime={lastRefreshTime}
        refreshing={refreshing}
        onRefresh={handleRefreshSimulation}
      />

      <NavigationTabs
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {renderCurrentView()}
      </ScrollView>
    </View>
  );
}
