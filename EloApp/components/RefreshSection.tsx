import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { formatLastRefreshTime } from "../utils/helpers";

interface RefreshSectionProps {
  lastRefreshTime: Date | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export const RefreshSection: React.FC<RefreshSectionProps> = ({
  lastRefreshTime,
  refreshing,
  onRefresh,
}) => {
  return (
    <View style={styles.refreshSection}>
      <View style={styles.refreshInfo}>
        <Text style={styles.refreshTitle}>Monte Carlo Simulacija</Text>
        {lastRefreshTime && (
          <Text style={styles.refreshTime}>
            {formatLastRefreshTime(lastRefreshTime)}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.refreshButton,
          refreshing && styles.refreshButtonDisabled,
        ]}
        onPress={onRefresh}
        disabled={refreshing}
      >
        {refreshing ? (
          <View style={styles.refreshButtonContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.refreshButtonText}>Simulira...</Text>
          </View>
        ) : (
          <View style={styles.refreshButtonContent}>
            <Text style={styles.refreshButtonIcon}>🔄</Text>
            <Text style={styles.refreshButtonText}>Nova simulacija</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  refreshSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshInfo: {
    flex: 1,
  },
  refreshTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E8B57",
    marginBottom: 4,
  },
  refreshTime: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  refreshButton: {
    backgroundColor: "#2E8B57",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
  },
  refreshButtonDisabled: {
    backgroundColor: "#9E9E9E",
  },
  refreshButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
