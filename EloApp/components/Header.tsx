import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = "ELO Simulacija",
  subtitle = "1. ZNL Varaždin - Statistika",
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerGradientTop} />
      <View style={styles.headerGradientMiddle} />
      <View style={styles.headerGradientBottom} />

      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "relative",
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerGradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "#2E8B57",
  },
  headerGradientMiddle: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "#32935D",
  },
  headerGradientBottom: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: "#3CB371",
  },
  headerContent: {
    position: "relative",
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "#e8f5e8",
    fontWeight: "600",
  },
});
