import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAllReports } from "../services/reportService";
import { useFocusEffect } from "@react-navigation/native";

export default function MyReportsScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar reportes al montar el componente y cuando la pantalla gana foco
  useEffect(() => {
    loadReports();
  }, []);

  // Recargar cuando la pantalla gana foco (útil después de eliminar)
  useFocusEffect(
    React.useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async () => {
    try {
      const allReports = await getAllReports();
      setReports(allReports);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("es-ES", options);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Mis Reportes</Text>

        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No hay reportes guardados</Text>
            <Text style={styles.emptyStateSubtext}>
              Los reportes que completes aparecerán aquí
            </Text>
          </View>
        ) : (
          reports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() => {
                navigation.navigate("ReportDetail", { report });
              }}
            >
              <View style={styles.reportIcon}>
                <Ionicons
                  name={
                    report.type === "advanced"
                      ? "analytics"
                      : "document-text"
                  }
                  size={24}
                  color="#2d7a2e"
                />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportType}>
                  {report.type === "advanced" ? "Avanzado" : "Básico"}
                </Text>
                <Text style={styles.reportLocation}>
                  {report.siteData?.siteName ||
                    report.siteData?.location ||
                    "Sin ubicación"}
                </Text>
                <Text style={styles.reportDate}>
                  {formatDate(report.createdAt)}
                </Text>
              </View>
              {report.results && (
                <View
                  style={[
                    styles.statusBadge,
                    report.results.riskLevel === "Alto" && styles.statusHigh,
                    report.results.riskLevel === "Medio" && styles.statusMedium,
                    report.results.riskLevel === "Bajo" && styles.statusLow,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      report.results.riskLevel === "Alto" &&
                        styles.statusTextHigh,
                      report.results.riskLevel === "Medio" &&
                        styles.statusTextMedium,
                      report.results.riskLevel === "Bajo" &&
                        styles.statusTextLow,
                    ]}
                  >
                    {report.results.riskLevel}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  reportCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusLow: {
    backgroundColor: "#e8f5e9",
  },
  statusMedium: {
    backgroundColor: "#fff3e0",
  },
  statusHigh: {
    backgroundColor: "#ffebee",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2d7a2e",
  },
  statusTextLow: {
    color: "#2d7a2e",
  },
  statusTextMedium: {
    color: "#f57c00",
  },
  statusTextHigh: {
    color: "#d32f2f",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
    textAlign: "center",
  },
});
