import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ViewMode } from "../types";

interface NavigationTabsProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

interface TabConfig {
  key: ViewMode;
  label: string;
  icon?: string;
}

const tabs: TabConfig[] = [
  { key: "phase1", label: "Faza 1", icon: "📊" },
  { key: "champions", label: "Prvaci", icon: "🏆" },
  { key: "relegation", label: "Ostanak", icon: "⚠️" },
  { key: "overall", label: "Ukupno", icon: "📈" },
  { key: "points", label: "Bodovi", icon: "📊" },
  { key: "fixtures", label: "Raspored", icon: "📅" }, // NOVO
  { key: "conditional", label: "Matrix", icon: "🔢" },
];

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentView,
  onViewChange,
}) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, currentView === tab.key && styles.activeTab]}
          onPress={() => onViewChange(tab.key)}
        >
          {tab.icon && <Text style={styles.tabIcon}>{tab.icon}</Text>}
          <Text
            style={[
              styles.tabText,
              currentView === tab.key && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
    minHeight: 50,
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#2E8B57",
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  activeTabText: {
    color: "#fff",
  },
});
