import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { deleteReport, markReportAsSynced } from "../services/reportService";

export default function ReportDetailScreen({ route, navigation }) {
  const { report } = route.params;
  const [syncing, setSyncing] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("es-ES", options);
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar Reporte",
      "¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const success = await deleteReport(report.id, report.type);
            if (success) {
              Alert.alert("Eliminado", "El reporte ha sido eliminado exitosamente.");
              navigation.goBack();
            } else {
              Alert.alert("Error", "No se pudo eliminar el reporte.");
            }
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    setSyncing(true);

    // Simular sincronización con servidor
    setTimeout(async () => {
      // Marcar el reporte como sincronizado
      const success = await markReportAsSynced(report.id, report.type);

      setSyncing(false);

      if (success) {
        Alert.alert(
          "Sincronizado",
          "El reporte ha sido marcado como sincronizado.\n\nEn producción, este reporte se enviaría al servidor.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert("Error", "No se pudo sincronizar el reporte.");
      }
    }, 1500);
  };

  const getOdorLabel = (value) => {
    if (value === 0) return "Sin olor";
    if (value === 3) return "Leve";
    if (value === 5) return "Severo";
    return "No especificado";
  };

  const getColorationLabel = (value) => {
    if (value === 0) return "Sin coloración";
    if (value === 2) return "Superficial";
    if (value === 4) return "Extensa y profunda";
    return "No especificado";
  };

  const getLandUseLabel = (value) => {
    if (value === 2) return "Industrial/Comercial";
    if (value === 3) return "Residencial/Agrícola";
    if (value === 4) return "Conservación";
    return "No especificado";
  };

  const getWaterTableLabel = (value) => {
    if (value === 2) return "Mayor a 10 metros (Riesgo Bajo)";
    if (value === 5) return "Entre 5 y 10 metros (Riesgo Medio)";
    if (value === 8) return "Menor a 5 metros - Somero (Riesgo Alto)";
    return "No especificado";
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header del reporte */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Ionicons
              name={report.type === "advanced" ? "analytics" : "document-text"}
              size={32}
              color="#2d7a2e"
            />
            <View style={styles.headerInfo}>
              <Text style={styles.reportTypeText}>
                Reporte {report.type === "advanced" ? "Avanzado" : "Básico"}
              </Text>
              <Text style={styles.reportDate}>{formatDate(report.createdAt)}</Text>
            </View>
          </View>
          <Text style={styles.reportId}>ID: {report.id}</Text>
        </View>

        {/* Información del Sitio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location" size={18} color="#2d7a2e" /> Información del Sitio
          </Text>

          {report.siteData?.siteName && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nombre del Sitio:</Text>
              <Text style={styles.fieldValue}>{report.siteData.siteName}</Text>
            </View>
          )}

          {report.siteData?.location && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Ubicación:</Text>
              <Text style={styles.fieldValue}>{report.siteData.location}</Text>
            </View>
          )}

          {report.siteData?.coordinates && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Coordenadas GPS:</Text>
              <Text style={styles.fieldValue}>{report.siteData.coordinates}</Text>
            </View>
          )}

          {report.siteData?.inspectionDate && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Fecha de Inspección:</Text>
              <Text style={styles.fieldValue}>{report.siteData.inspectionDate}</Text>
            </View>
          )}

          {report.siteData?.inspector && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Inspector:</Text>
              <Text style={styles.fieldValue}>{report.siteData.inspector}</Text>
            </View>
          )}
        </View>

        {/* Datos del Contaminante (solo para reportes avanzados) */}
        {report.type === "advanced" && report.contaminantData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="flask" size={18} color="#2d7a2e" /> Características del Contaminante
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Intensidad del Olor:</Text>
              <Text style={styles.fieldValue}>
                {getOdorLabel(report.contaminantData.odor)}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Coloración del Suelo:</Text>
              <Text style={styles.fieldValue}>
                {getColorationLabel(report.contaminantData.coloration)}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Presencia de Fase Libre:</Text>
              <Text style={styles.fieldValue}>
                {report.contaminantData.freePhase ? "Sí (Riesgo Máximo)" : "No"}
              </Text>
            </View>

            {report.contaminantData.affectedArea && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Área Afectada:</Text>
                <Text style={styles.fieldValue}>
                  {report.contaminantData.affectedArea} m²
                </Text>
              </View>
            )}

            {report.contaminantData.depth && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Profundidad:</Text>
                <Text style={styles.fieldValue}>
                  {report.contaminantData.depth} m
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Datos del Entorno (solo para reportes avanzados) */}
        {report.type === "advanced" && report.environmentData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="leaf" size={18} color="#2d7a2e" /> Hidrogeología y Entorno
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Uso de Suelo:</Text>
              <Text style={styles.fieldValue}>
                {getLandUseLabel(report.environmentData.landUse)}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Profundidad del Nivel Freático:</Text>
              <Text style={styles.fieldValue}>
                {getWaterTableLabel(report.environmentData.waterTableDepth)}
              </Text>
            </View>

            {report.environmentData.soilType && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Tipo de Suelo:</Text>
                <Text style={styles.fieldValue}>
                  {report.environmentData.soilType}
                </Text>
              </View>
            )}

            {report.environmentData.nearWaterBodies !== null && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Proximidad a Cuerpos de Agua:</Text>
                <Text style={styles.fieldValue}>
                  {report.environmentData.nearWaterBodies ? "Sí" : "No"}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Resultados de la Evaluación (solo para reportes avanzados) */}
        {report.results && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="analytics" size={18} color="#2d7a2e" /> Resultados de la Evaluación
            </Text>

            <View style={styles.resultCard}>
              <Ionicons
                name={
                  report.results.riskLevel === "Alto"
                    ? "alert-circle"
                    : report.results.riskLevel === "Medio"
                    ? "warning"
                    : "checkmark-circle"
                }
                size={48}
                color={
                  report.results.riskLevel === "Alto"
                    ? "#d32f2f"
                    : report.results.riskLevel === "Medio"
                    ? "#f57c00"
                    : "#2d7a2e"
                }
              />
              <Text style={styles.resultTitle}>Nivel de Contaminación</Text>
              <Text
                style={[
                  styles.resultLevel,
                  report.results.riskLevel === "Alto" && styles.resultHigh,
                  report.results.riskLevel === "Medio" && styles.resultMedium,
                  report.results.riskLevel === "Bajo" && styles.resultLow,
                ]}
              >
                {report.results.riskLevel}
              </Text>
              <Text style={styles.resultIRP}>
                IRP: {report.results.riskIndex.toFixed(1)}
              </Text>
            </View>

            {report.results.riskFactors && report.results.riskFactors.length > 0 && (
              <View style={styles.factorsBox}>
                <Text style={styles.factorsTitle}>Factores de Riesgo:</Text>
                {report.results.riskFactors.map((factor, index) => (
                  <View key={index} style={styles.factorItem}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color="#d32f2f"
                    />
                    <Text style={styles.factorText}>{factor}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Botones de Acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.syncButtonText}>Sincronizar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
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
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  reportTypeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  reportDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  reportId: {
    fontSize: 12,
    color: "#999",
    fontFamily: "monospace",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d7a2e",
    marginBottom: 16,
  },
  field: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 15,
    color: "#333",
  },
  resultCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 8,
  },
  resultLevel: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  resultHigh: {
    color: "#d32f2f",
  },
  resultMedium: {
    color: "#f57c00",
  },
  resultLow: {
    color: "#2d7a2e",
  },
  resultIRP: {
    fontSize: 14,
    color: "#666",
  },
  factorsBox: {
    backgroundColor: "#fff9e6",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f57c00",
  },
  factorsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  factorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  factorText: {
    fontSize: 13,
    color: "#333",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  syncButton: {
    flex: 1,
    backgroundColor: "#2d7a2e",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  syncButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#d32f2f",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
