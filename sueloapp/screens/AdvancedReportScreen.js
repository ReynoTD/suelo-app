import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdvancedReportScreen({ navigation }) {
  // A. Identificación del Sitio y Datos Generales
  const [siteData, setSiteData] = useState({
    siteName: "",
    location: "",
    coordinates: "",
    inspectionDate: "",
    inspector: "",
  });

  const [loadingLocation, setLoadingLocation] = useState(false);

  // B. Observación y Características del Contaminante
  const [contaminantData, setContaminantData] = useState({
    odor: null, // 0: Sin olor, 3: Leve, 5: Severo
    coloration: null, // 0: Sin coloración, 2: Superficial, 4: Extensa y profunda
    freePhase: null, // false: No, true: Sí (10 puntos)
    affectedArea: "",
    depth: "",
  });

  // C. Hidrogeología y Entorno
  const [environmentData, setEnvironmentData] = useState({
    landUse: null, // Residencial: 3, Industrial: 2, Conservación: 4
    waterTableDepth: null, // >10m: 2, 5-10m: 5, <5m: 8
    soilType: "",
    nearWaterBodies: null,
  });

  const [showResults, setShowResults] = useState(false);
  const [riskIndex, setRiskIndex] = useState(0);
  const [riskLevel, setRiskLevel] = useState("");
  const [riskFactors, setRiskFactors] = useState([]);

  // Función para obtener la ubicación actual
  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      // Solicitar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permiso Denegado",
          "Se necesita permiso de ubicación para obtener las coordenadas GPS."
        );
        setLoadingLocation(false);
        return;
      }

      // Obtener la ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      // Actualizar el estado con las coordenadas
      setSiteData({
        ...siteData,
        coordinates: coordinates,
      });

      Alert.alert(
        "Ubicación Obtenida",
        `Coordenadas: ${coordinates}`
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo obtener la ubicación. Verifica que el GPS esté activado."
      );
      console.error("Error obteniendo ubicación:", error);
    } finally {
      setLoadingLocation(false);
    }
  };

  // Obtener ubicación automáticamente al cargar la pantalla
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const calculateRiskIndex = () => {
    // Validar que se hayan completado los campos críticos
    if (
      contaminantData.odor === null ||
      contaminantData.coloration === null ||
      contaminantData.freePhase === null ||
      environmentData.landUse === null ||
      environmentData.waterTableDepth === null
    ) {
      Alert.alert(
        "Campos Incompletos",
        "Por favor complete todos los campos marcados como obligatorios."
      );
      return;
    }

    let totalPoints = 0;
    let factors = [];

    // Puntos por Olor
    totalPoints += contaminantData.odor;
    if (contaminantData.odor >= 5) {
      factors.push("Olor severo detectado");
    }

    // Puntos por Coloración
    totalPoints += contaminantData.coloration;
    if (contaminantData.coloration >= 4) {
      factors.push("Coloración extensa y profunda");
    }

    // Puntos por Fase Libre (Máximo riesgo)
    if (contaminantData.freePhase) {
      totalPoints += 10;
      factors.push("Presencia de fase libre (riesgo máximo de migración)");
    }

    // Puntos por Profundidad del Nivel Freático
    totalPoints += environmentData.waterTableDepth;
    if (environmentData.waterTableDepth >= 8) {
      factors.push(
        "Nivel freático somero (alto riesgo de afectación al agua subterránea)"
      );
    }

    // Aplicar ponderador por Uso de Suelo
    const landUseMultiplier = environmentData.landUse;
    const weightedPoints = totalPoints * landUseMultiplier;

    // Determinar nivel de riesgo
    let level = "";
    if (weightedPoints < 30) {
      level = "Bajo";
    } else if (weightedPoints < 60) {
      level = "Medio";
    } else {
      level = "Alto";
    }

    // Agregar factor de uso de suelo
    if (environmentData.landUse === 4) {
      factors.push("Uso de suelo: Conservación (límites más estrictos)");
    } else if (environmentData.landUse === 3) {
      factors.push(
        "Uso de suelo: Residencial/Agrícola (límites estrictos NOM-138)"
      );
    }

    setRiskIndex(weightedPoints);
    setRiskLevel(level);
    setRiskFactors(factors);
    setShowResults(true);
  };

  const resetForm = () => {
    setSiteData({
      siteName: "",
      location: "",
      coordinates: "",
      inspectionDate: "",
      inspector: "",
    });
    setContaminantData({
      odor: null,
      coloration: null,
      freePhase: null,
      affectedArea: "",
      depth: "",
    });
    setEnvironmentData({
      landUse: null,
      waterTableDepth: null,
      soilType: "",
      nearWaterBodies: null,
    });
    setShowResults(false);
  };

  const saveReport = async () => {
    try {
      // Crear el objeto del reporte con todos los datos
      const report = {
        id: Date.now().toString(), // ID único basado en timestamp
        type: "advanced", // Tipo de reporte
        createdAt: new Date().toISOString(), // Fecha de creación
        synced: false, // Indica si el reporte ha sido sincronizado con el servidor

        // Datos del sitio
        siteData: {
          siteName: siteData.siteName,
          location: siteData.location,
          coordinates: siteData.coordinates,
          inspectionDate: siteData.inspectionDate,
          inspector: siteData.inspector,
        },

        // Datos del contaminante
        contaminantData: {
          odor: contaminantData.odor,
          coloration: contaminantData.coloration,
          freePhase: contaminantData.freePhase,
          affectedArea: contaminantData.affectedArea,
          depth: contaminantData.depth,
        },

        // Datos del entorno
        environmentData: {
          landUse: environmentData.landUse,
          waterTableDepth: environmentData.waterTableDepth,
          soilType: environmentData.soilType,
          nearWaterBodies: environmentData.nearWaterBodies,
        },

        // Resultados de la evaluación
        results: {
          riskIndex: riskIndex,
          riskLevel: riskLevel,
          riskFactors: riskFactors,
        },
      };

      // Obtener reportes existentes
      const existingReportsJson = await AsyncStorage.getItem("advancedReports");
      const existingReports = existingReportsJson
        ? JSON.parse(existingReportsJson)
        : [];

      // Agregar el nuevo reporte
      existingReports.push(report);

      // Guardar en AsyncStorage
      await AsyncStorage.setItem(
        "advancedReports",
        JSON.stringify(existingReports)
      );

      console.log("Reporte guardado exitosamente:", report);

      Alert.alert(
        "Reporte Guardado",
        "El reporte avanzado ha sido guardado exitosamente en el dispositivo.",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error guardando el reporte:", error);
      Alert.alert(
        "Error",
        "No se pudo guardar el reporte. Por favor intenta de nuevo."
      );
    }
  };

  if (showResults) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Resultado Principal */}
          <View style={styles.resultCard}>
            <Ionicons
              name={
                riskLevel === "Alto"
                  ? "alert-circle"
                  : riskLevel === "Medio"
                  ? "warning"
                  : "checkmark-circle"
              }
              size={60}
              color={
                riskLevel === "Alto"
                  ? "#d32f2f"
                  : riskLevel === "Medio"
                  ? "#f57c00"
                  : "#2d7a2e"
              }
            />
            <Text style={styles.resultTitle}>
              Nivel de Contaminación Estimado
            </Text>
            <Text
              style={[
                styles.resultLevel,
                riskLevel === "Alto" && styles.resultHigh,
                riskLevel === "Medio" && styles.resultMedium,
                riskLevel === "Bajo" && styles.resultLow,
              ]}
            >
              {riskLevel}
            </Text>
            <Text style={styles.resultIRP}>
              Índice de Riesgo Preliminar (IRP): {riskIndex.toFixed(1)}
            </Text>
          </View>

          {/* Factores de Riesgo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Factores que Contribuyen al Riesgo
            </Text>
            {riskFactors.map((factor, index) => (
              <View key={index} style={styles.factorItem}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#d32f2f"
                />
                <Text style={styles.factorText}>{factor}</Text>
              </View>
            ))}
          </View>

          {/* Referencia a NOM-138 */}
          <View style={styles.alertBox}>
            <Ionicons name="information-circle" size={24} color="#1976d2" />
            <Text style={styles.alertText}>
              {environmentData.landUse === 3 &&
                "El uso de suelo 'Residencial/Agrícola' implica los límites más estrictos de la NOM-138-SEMARNAT/SSA1-2012 (Tabla 1)."}
              {environmentData.landUse === 4 &&
                "El uso de suelo 'Conservación' requiere cumplimiento estricto con la NOM-138-SEMARNAT/SSA1-2012."}
              {environmentData.landUse === 2 &&
                "El uso de suelo 'Industrial/Comercial' debe cumplir con los límites establecidos en la NOM-138-SEMARNAT/SSA1-2012 (Tabla 2)."}
            </Text>
          </View>

          {/* Recomendaciones Técnicas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendaciones Técnicas</Text>
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationText}>
                Se recomienda seguir los Lineamientos para el Muestreo de
                Caracterización establecidos en el Capítulo 4 de la
                NOM-138-SEMARNAT/SSA1-2012 para confirmar los niveles de
                contaminación.
              </Text>
            </View>

            {riskLevel === "Alto" && (
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationText}>
                  • Realizar muestreo inmediato del suelo y agua subterránea
                  {"\n"}• Evaluar la extensión horizontal y vertical de la
                  contaminación{"\n"}• Considerar medidas de contención urgentes
                  {"\n"}• Notificar a las autoridades ambientales
                  correspondientes
                </Text>
              </View>
            )}

            {riskLevel === "Medio" && (
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationText}>
                  • Programar muestreo de caracterización{"\n"}• Delimitar el
                  área afectada{"\n"}• Evaluar riesgos a receptores cercanos
                  {"\n"}• Documentar el sitio fotográficamente
                </Text>
              </View>
            )}
          </View>

          {/* Botones */}
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={saveReport}
          >
            <Text style={styles.buttonText}>Guardar Reporte</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={resetForm}>
            <Text style={styles.buttonSecondaryText}>Nuevo Reporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.mainTitle}>Reporte Avanzado</Text>
        <Text style={styles.subtitle}>
          Caracterización preliminar y estimación de riesgo
        </Text>

        {/* A. Identificación del Sitio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            A. Identificación del Sitio y Datos Generales
          </Text>

          <Text style={styles.label}>Nombre del Sitio</Text>
          <TextInput
            style={styles.input}
            value={siteData.siteName}
            onChangeText={(text) =>
              setSiteData({ ...siteData, siteName: text })
            }
            placeholder="Ej. Estación de servicio Centro"
          />

          <Text style={styles.label}>Ubicación</Text>
          <TextInput
            style={styles.input}
            value={siteData.location}
            onChangeText={(text) =>
              setSiteData({ ...siteData, location: text })
            }
            placeholder="Dirección completa"
          />

          <Text style={styles.label}>Coordenadas GPS</Text>
          <View style={styles.coordinatesContainer}>
            <TextInput
              style={[styles.input, styles.coordinatesInput]}
              value={siteData.coordinates}
              onChangeText={(text) =>
                setSiteData({ ...siteData, coordinates: text })
              }
              placeholder="Lat, Long"
              editable={!loadingLocation}
            />
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="location" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Fecha de Inspección</Text>
          <TextInput
            style={styles.input}
            value={siteData.inspectionDate}
            onChangeText={(text) =>
              setSiteData({ ...siteData, inspectionDate: text })
            }
            placeholder="DD/MM/AAAA"
          />

          <Text style={styles.label}>Inspector</Text>
          <TextInput
            style={styles.input}
            value={siteData.inspector}
            onChangeText={(text) =>
              setSiteData({ ...siteData, inspector: text })
            }
            placeholder="Nombre del profesional"
          />
        </View>

        {/* B. Observación y Características del Contaminante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            B. Observación y Características del Contaminante *
          </Text>

          <Text style={styles.label}>Intensidad del Olor *</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                contaminantData.odor === 0 && styles.optionSelected,
              ]}
              onPress={() =>
                setContaminantData({ ...contaminantData, odor: 0 })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  contaminantData.odor === 0 && styles.optionTextSelected,
                ]}
              >
                Sin Olor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                contaminantData.odor === 3 && styles.optionSelected,
              ]}
              onPress={() =>
                setContaminantData({ ...contaminantData, odor: 3 })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  contaminantData.odor === 3 && styles.optionTextSelected,
                ]}
              >
                Leve
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                contaminantData.odor === 5 && styles.optionSelected,
              ]}
              onPress={() =>
                setContaminantData({ ...contaminantData, odor: 5 })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  contaminantData.odor === 5 && styles.optionTextSelected,
                ]}
              >
                Severo
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Coloración del Suelo *</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                contaminantData.coloration === 0 && styles.optionSelected,
              ]}
              onPress={() =>
                setContaminantData({ ...contaminantData, coloration: 0 })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  contaminantData.coloration === 0 && styles.optionTextSelected,
                ]}
              >
                Sin Coloración
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                contaminantData.coloration === 2 && styles.optionSelected,
              ]}
              onPress={() =>
                setContaminantData({ ...contaminantData, coloration: 2 })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  contaminantData.coloration === 2 && styles.optionTextSelected,
                ]}
              >
                Superficial
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                contaminantData.coloration === 4 && styles.optionSelected,
              ]}
              onPress={() =>
                setContaminantData({ ...contaminantData, coloration: 4 })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  contaminantData.coloration === 4 && styles.optionTextSelected,
                ]}
              >
                Extensa y Profunda
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>¿Presencia de Fase Libre? *</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButtonWide,
                contaminantData.freePhase === false && styles.optionSelected,
              ]}
              onPress={() =>
                setContaminantData({ ...contaminantData, freePhase: false })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  contaminantData.freePhase === false &&
                    styles.optionTextSelected,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButtonWide,
                contaminantData.freePhase === true && styles.optionSelected,
              ]}
              onPress={() =>
                setContaminantData({ ...contaminantData, freePhase: true })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  contaminantData.freePhase === true &&
                    styles.optionTextSelected,
                ]}
              >
                Sí (Riesgo Máximo)
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Área Afectada Estimada (m²)</Text>
          <TextInput
            style={styles.input}
            value={contaminantData.affectedArea}
            onChangeText={(text) =>
              setContaminantData({ ...contaminantData, affectedArea: text })
            }
            placeholder="Ej. 50"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Profundidad Observada (m)</Text>
          <TextInput
            style={styles.input}
            value={contaminantData.depth}
            onChangeText={(text) =>
              setContaminantData({ ...contaminantData, depth: text })
            }
            placeholder="Ej. 2.5"
            keyboardType="numeric"
          />
        </View>

        {/* C. Hidrogeología y Entorno */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>C. Hidrogeología y Entorno *</Text>

          <Text style={styles.label}>Uso de Suelo (NOM-138) *</Text>
          <TouchableOpacity
            style={[
              styles.optionButtonFull,
              environmentData.landUse === 3 && styles.optionSelected,
            ]}
            onPress={() =>
              setEnvironmentData({ ...environmentData, landUse: 3 })
            }
          >
            <Text
              style={[
                styles.optionText,
                environmentData.landUse === 3 && styles.optionTextSelected,
              ]}
            >
              Residencial / Agrícola (Límites Estrictos)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButtonFull,
              environmentData.landUse === 2 && styles.optionSelected,
            ]}
            onPress={() =>
              setEnvironmentData({ ...environmentData, landUse: 2 })
            }
          >
            <Text
              style={[
                styles.optionText,
                environmentData.landUse === 2 && styles.optionTextSelected,
              ]}
            >
              Industrial / Comercial (Límites Intermedios)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButtonFull,
              environmentData.landUse === 4 && styles.optionSelected,
            ]}
            onPress={() =>
              setEnvironmentData({ ...environmentData, landUse: 4 })
            }
          >
            <Text
              style={[
                styles.optionText,
                environmentData.landUse === 4 && styles.optionTextSelected,
              ]}
            >
              Conservación (Límites Máximos)
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Profundidad del Nivel Freático *</Text>
          <TouchableOpacity
            style={[
              styles.optionButtonFull,
              environmentData.waterTableDepth === 2 && styles.optionSelected,
            ]}
            onPress={() =>
              setEnvironmentData({ ...environmentData, waterTableDepth: 2 })
            }
          >
            <Text
              style={[
                styles.optionText,
                environmentData.waterTableDepth === 2 &&
                  styles.optionTextSelected,
              ]}
            >
              Mayor a 10 metros (Riesgo Bajo)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButtonFull,
              environmentData.waterTableDepth === 5 && styles.optionSelected,
            ]}
            onPress={() =>
              setEnvironmentData({ ...environmentData, waterTableDepth: 5 })
            }
          >
            <Text
              style={[
                styles.optionText,
                environmentData.waterTableDepth === 5 &&
                  styles.optionTextSelected,
              ]}
            >
              Entre 5 y 10 metros (Riesgo Medio)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButtonFull,
              environmentData.waterTableDepth === 8 && styles.optionSelected,
            ]}
            onPress={() =>
              setEnvironmentData({ ...environmentData, waterTableDepth: 8 })
            }
          >
            <Text
              style={[
                styles.optionText,
                environmentData.waterTableDepth === 8 &&
                  styles.optionTextSelected,
              ]}
            >
              Menor a 5 metros - Somero (Riesgo Alto)
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Tipo de Suelo Observado</Text>
          <TextInput
            style={styles.input}
            value={environmentData.soilType}
            onChangeText={(text) =>
              setEnvironmentData({ ...environmentData, soilType: text })
            }
            placeholder="Ej. Arcilloso, arenoso, limoso"
          />

          <Text style={styles.label}>¿Proximidad a Cuerpos de Agua?</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButtonWide,
                environmentData.nearWaterBodies === false &&
                  styles.optionSelected,
              ]}
              onPress={() =>
                setEnvironmentData({
                  ...environmentData,
                  nearWaterBodies: false,
                })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  environmentData.nearWaterBodies === false &&
                    styles.optionTextSelected,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButtonWide,
                environmentData.nearWaterBodies === true &&
                  styles.optionSelected,
              ]}
              onPress={() =>
                setEnvironmentData({
                  ...environmentData,
                  nearWaterBodies: true,
                })
              }
            >
              <Text
                style={[
                  styles.optionText,
                  environmentData.nearWaterBodies === true &&
                    styles.optionTextSelected,
                ]}
              >
                Sí
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón Calcular */}
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={calculateRiskIndex}
        >
          <Text style={styles.buttonText}>Calcular Índice de Riesgo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonSecondaryText}>Cancelar</Text>
        </TouchableOpacity>
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
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  coordinatesContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  coordinatesInput: {
    flex: 1,
  },
  locationButton: {
    backgroundColor: "#2d7a2e",
    borderRadius: 8,
    padding: 12,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  optionButtonWide: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  optionButtonFull: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    alignItems: "center",
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: "#e8f5e9",
    borderColor: "#2d7a2e",
  },
  optionText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#2d7a2e",
    fontWeight: "600",
  },
  buttonPrimary: {
    backgroundColor: "#2d7a2e",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 2,
    borderColor: "#2d7a2e",
  },
  buttonSecondaryText: {
    color: "#2d7a2e",
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos para la pantalla de resultados
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  resultLevel: {
    fontSize: 32,
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
    fontSize: 16,
    color: "#666",
  },
  factorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingLeft: 8,
  },
  factorText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  alertBox: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#1976d2",
  },
  alertText: {
    fontSize: 13,
    color: "#1565c0",
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  recommendationBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 20,
  },
});
