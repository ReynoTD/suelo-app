import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getReportStats } from "../services/reportService";
import { useFocusEffect } from "@react-navigation/native";

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({
    thisMonth: 0,
    total: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  // Recargar estadísticas cuando la pantalla gana foco
  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    const reportStats = await getReportStats();
    setStats({
      thisMonth: reportStats.thisMonth,
      total: reportStats.total,
    });
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>Bienvenido a Suelo Sano</Text>
        <Text style={styles.welcomeSubtitle}>
          Evalúa y reporta la contaminación de suelos por hidrocarburos
        </Text>

        {/* Reporte Básico Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#2d7a2e"
              />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Reporte Básico</Text>
              <Text style={styles.cardSubtitle}>
                Registro rápido con ubicación, foto y comentario
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => navigation.navigate("BasicReport")}
          >
            <Text style={styles.buttonPrimaryText}>+ Crear Reporte Básico</Text>
          </TouchableOpacity>
        </View>

        {/* Reporte Avanzado Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="camera-outline" size={24} color="#6b8e23" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Reporte Avanzado</Text>
              <Text style={styles.cardSubtitle}>
                Análisis detallado con tipo de hidrocarburo y concentración
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => navigation.navigate("AdvancedReport")}
          >
            <Text style={styles.buttonSecondaryText}>
              + Crear Reporte Avanzado
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.thisMonth}</Text>
            <Text style={styles.statLabel}>Reportes Este Mes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Reportes</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  buttonPrimary: {
    backgroundColor: "#1b5e20",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: "#6b8e23",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2d7a2e",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
});
