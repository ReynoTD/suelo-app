import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { getAllReports, markReportAsSynced } from "../services/reportService";

export default function NotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unsyncedReports, setUnsyncedReports] = useState([]);
  const [syncingReportId, setSyncingReportId] = useState(null);

  useEffect(() => {
    loadUnsyncedReports();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUnsyncedReports();
    }, [])
  );

  const loadUnsyncedReports = async () => {
    try {
      const allReports = await getAllReports();
      // Filtrar solo reportes no sincronizados
      const unsynced = allReports.filter((report) => !report.synced);
      setUnsyncedReports(unsynced);
    } catch (error) {
      console.error("Error cargando reportes no sincronizados:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUnsyncedReports();
  };

  const handleSyncReport = async (reportId, reportType) => {
    setSyncingReportId(reportId);

    // Simular sincronización
    setTimeout(async () => {
      const success = await markReportAsSynced(reportId, reportType);

      setSyncingReportId(null);

      if (success) {
        Alert.alert(
          "Sincronizado",
          "El reporte ha sido marcado como sincronizado exitosamente.",
          [
            {
              text: "OK",
              onPress: () => loadUnsyncedReports(),
            },
          ]
        );
      } else {
        Alert.alert("Error", "No se pudo sincronizar el reporte.");
      }
    }, 1500);
  };

  const handleSyncAll = () => {
    Alert.alert(
      "Sincronizar Todos",
      `¿Deseas sincronizar todos los ${unsyncedReports.length} reportes pendientes?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sincronizar",
          onPress: async () => {
            setLoading(true);
            // Sincronizar todos los reportes
            for (const report of unsyncedReports) {
              await markReportAsSynced(report.id, report.type);
            }
            setLoading(false);
            Alert.alert(
              "Completado",
              "Todos los reportes han sido sincronizados.",
              [{ text: "OK", onPress: () => loadUnsyncedReports() }]
            );
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Hoy";
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d7a2e" />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#2d7a2e"]}
        />
      }
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="notifications" size={32} color="#2d7a2e" />
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <Text style={styles.headerSubtitle}>
            Recordatorios de sincronización
          </Text>
        </View>

        {/* Resumen */}
        {unsyncedReports.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryBadge}>
                <Ionicons name="cloud-offline" size={24} color="#fff" />
                <Text style={styles.summaryNumber}>
                  {unsyncedReports.length}
                </Text>
              </View>
              <View style={styles.summaryTextContainer}>
                <Text style={styles.summaryTitle}>
                  {unsyncedReports.length === 1
                    ? "Reporte Pendiente"
                    : "Reportes Pendientes"}
                </Text>
                <Text style={styles.summarySubtitle}>
                  {unsyncedReports.length === 1
                    ? "Tienes un reporte sin sincronizar"
                    : `Tienes ${unsyncedReports.length} reportes sin sincronizar`}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.syncAllButton}
              onPress={handleSyncAll}
            >
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={styles.syncAllButtonText}>Sincronizar Todos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de reportes no sincronizados */}
        {unsyncedReports.length > 0 ? (
          <View style={styles.notificationsList}>
            <Text style={styles.sectionTitle}>Reportes Locales</Text>
            {unsyncedReports.map((report) => (
              <View key={report.id} style={styles.notificationCard}>
                <View style={styles.notificationIcon}>
                  <Ionicons
                    name={
                      report.type === "advanced"
                        ? "analytics"
                        : "document-text"
                    }
                    size={24}
                    color="#f57c00"
                  />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>
                      Reporte {report.type === "advanced" ? "Avanzado" : "Básico"}
                    </Text>
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>Local</Text>
                    </View>
                  </View>

                  {report.siteData?.siteName && (
                    <Text style={styles.notificationText}>
                      📍 {report.siteData.siteName}
                    </Text>
                  )}

                  {report.siteData?.location && (
                    <Text style={styles.notificationSubtext}>
                      {report.siteData.location}
                    </Text>
                  )}

                  {report.results?.riskLevel && (
                    <View style={styles.notificationMeta}>
                      <Text
                        style={[
                          styles.riskBadge,
                          report.results.riskLevel === "Alto" && styles.riskHigh,
                          report.results.riskLevel === "Medio" &&
                            styles.riskMedium,
                          report.results.riskLevel === "Bajo" && styles.riskLow,
                        ]}
                      >
                        Riesgo: {report.results.riskLevel}
                      </Text>
                    </View>
                  )}

                  <View style={styles.notificationFooter}>
                    <Text style={styles.notificationDate}>
                      {formatDate(report.createdAt)}
                    </Text>

                    <TouchableOpacity
                      style={styles.syncButton}
                      onPress={() => handleSyncReport(report.id, report.type)}
                      disabled={syncingReportId === report.id}
                    >
                      {syncingReportId === report.id ? (
                        <ActivityIndicator size="small" color="#2d7a2e" />
                      ) : (
                        <>
                          <Ionicons
                            name="cloud-upload-outline"
                            size={16}
                            color="#2d7a2e"
                          />
                          <Text style={styles.syncButtonText}>Sincronizar</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          // Estado vacío
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={64}
                color="#2d7a2e"
                style={styles.emptyIcon}
              />
            </View>
            <Text style={styles.emptyTitle}>¡Todo sincronizado!</Text>
            <Text style={styles.emptyText}>
              No tienes reportes pendientes de sincronizar.
            </Text>
            <Text style={styles.emptySubtext}>
              Todos tus reportes están respaldados en la nube.
            </Text>
          </View>
        )}

        {/* Info adicional */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#2d7a2e" />
          <Text style={styles.infoText}>
            Los reportes locales se sincronizan con el servidor para mantener un
            respaldo seguro de tu información.
          </Text>
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f57c00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  summaryNumber: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#d32f2f",
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: "center",
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: "#666",
  },
  syncAllButton: {
    backgroundColor: "#2d7a2e",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  syncAllButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  notificationsList: {
    marginBottom: 24,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#f57c00",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff3e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  notificationBadge: {
    backgroundColor: "#fff3e0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#f57c00",
  },
  notificationText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  notificationSubtext: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  notificationMeta: {
    marginBottom: 8,
  },
  riskBadge: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  riskLow: {
    backgroundColor: "#e8f5e9",
    color: "#2d7a2e",
  },
  riskMedium: {
    backgroundColor: "#fff3e0",
    color: "#f57c00",
  },
  riskHigh: {
    backgroundColor: "#ffebee",
    color: "#d32f2f",
  },
  notificationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  notificationDate: {
    fontSize: 12,
    color: "#999",
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#2d7a2e",
    backgroundColor: "#fff",
  },
  syncButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2d7a2e",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIcon: {
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2d7a2e",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    marginLeft: 10,
    lineHeight: 18,
  },
});
