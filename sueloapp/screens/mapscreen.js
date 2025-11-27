import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { getAllReports } from "../services/reportService";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const [reports, setReports] = useState([]);
  const [region, setRegion] = useState({
    // Coordenadas por defecto (Villahermosa, Tabasco)
    latitude: 17.9892,
    longitude: -92.9281,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    loadReports();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async () => {
    try {
      const allReports = await getAllReports();

      // Filtrar solo reportes con coordenadas válidas
      const reportsWithCoordinates = allReports.filter((report) => {
        return report.siteData?.coordinates && report.siteData.coordinates.trim() !== "";
      });

      setReports(reportsWithCoordinates);

      // Si hay reportes, centrar el mapa en el primero
      if (reportsWithCoordinates.length > 0) {
        const firstReport = reportsWithCoordinates[0];
        const coords = parseCoordinates(firstReport.siteData.coordinates);
        if (coords) {
          setRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          });
        }
      }
    } catch (error) {
      console.error("Error cargando reportes:", error);
    }
  };

  const parseCoordinates = (coordsString) => {
    try {
      // Formato esperado: "lat, long" o "lat,long"
      const parts = coordsString.split(",").map((s) => s.trim());
      if (parts.length === 2) {
        const latitude = parseFloat(parts[0]);
        const longitude = parseFloat(parts[1]);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          return { latitude, longitude };
        }
      }
      return null;
    } catch (error) {
      console.error("Error parseando coordenadas:", error);
      return null;
    }
  };

  const getMarkerColor = (report) => {
    // Verde para sincronizados, naranja para locales
    return report.synced ? "#2d7a2e" : "#f57c00";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("es-ES", options);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {reports.map((report) => {
          const coords = parseCoordinates(report.siteData.coordinates);
          if (!coords) return null;

          return (
            <Marker
              key={report.id}
              coordinate={coords}
              pinColor={getMarkerColor(report)}
            >
              <Callout>
                <View style={styles.calloutContainer}>
                  <View style={styles.calloutHeader}>
                    <Ionicons
                      name={report.type === "advanced" ? "analytics" : "document-text"}
                      size={20}
                      color="#2d7a2e"
                    />
                    <Text style={styles.calloutTitle}>
                      Reporte {report.type === "advanced" ? "Avanzado" : "Básico"}
                    </Text>
                  </View>

                  {report.siteData?.siteName && (
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Sitio:</Text> {report.siteData.siteName}
                    </Text>
                  )}

                  {report.siteData?.location && (
                    <Text style={styles.calloutText}>
                      <Text style={styles.calloutLabel}>Ubicación:</Text> {report.siteData.location}
                    </Text>
                  )}

                  <Text style={styles.calloutText}>
                    <Text style={styles.calloutLabel}>Fecha:</Text> {formatDate(report.createdAt)}
                  </Text>

                  {report.results && (
                    <View style={styles.calloutRisk}>
                      <Text
                        style={[
                          styles.riskBadge,
                          report.results.riskLevel === "Alto" && styles.riskHigh,
                          report.results.riskLevel === "Medio" && styles.riskMedium,
                          report.results.riskLevel === "Bajo" && styles.riskLow,
                        ]}
                      >
                        Riesgo: {report.results.riskLevel}
                      </Text>
                    </View>
                  )}

                  <View style={styles.syncStatus}>
                    <Ionicons
                      name={report.synced ? "cloud-done" : "cloud-offline"}
                      size={16}
                      color={report.synced ? "#2d7a2e" : "#f57c00"}
                    />
                    <Text
                      style={[
                        styles.syncText,
                        { color: report.synced ? "#2d7a2e" : "#f57c00" },
                      ]}
                    >
                      {report.synced ? "Sincronizado" : "Local"}
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Leyenda */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Leyenda</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#2d7a2e" }]} />
          <Text style={styles.legendText}>Sincronizado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#f57c00" }]} />
          <Text style={styles.legendText}>Local (no sincronizado)</Text>
        </View>
      </View>

      {/* Contador de reportes */}
      <View style={styles.counter}>
        <Ionicons name="location" size={20} color="#2d7a2e" />
        <Text style={styles.counterText}>
          {reports.length} {reports.length === 1 ? "reporte" : "reportes"}
        </Text>
      </View>

      {reports.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyCard}>
            <Ionicons name="map-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No hay reportes con coordenadas</Text>
            <Text style={styles.emptySubtext}>
              Los reportes con ubicación GPS aparecerán aquí
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  calloutContainer: {
    width: 250,
    padding: 10,
  },
  calloutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  calloutText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  calloutLabel: {
    fontWeight: "600",
    color: "#333",
  },
  calloutRisk: {
    marginTop: 8,
    marginBottom: 4,
  },
  riskBadge: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
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
  syncStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  syncText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  legend: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  counter: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  counterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2d7a2e",
    marginLeft: 6,
  },
  emptyState: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(245, 245, 245, 0.9)",
  },
  emptyCard: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
    textAlign: "center",
  },
});
