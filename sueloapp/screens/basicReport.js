import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
} from "react-native";

// Constantes y datos para la lista de riesgo
const RIESGOS = ["Bajo", "Medio", "Alto", "Muy Alto"];

// Función para formatear la fecha/hora (solo para inicialización)
const formatDateTime = (date) => {
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  // Usamos toLocaleString para incluir la fecha y hora
  return date.toLocaleString("es-ES", options);
};

// Componente de Input Personalizado MOVIDO FUERA de ReporteBasicoForm para evitar problemas de enfoque (re-renderización)
const CustomInput = ({
  label,
  value,
  onChangeText,
  multiline = false,
  keyboardType = "default",
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      keyboardType={keyboardType}
    />
  </View>
);

const ReporteBasicoForm = () => {
  // Inicializamos el texto del input con la hora actual formateada
  const [fechaHoraTexto, setFechaHoraTexto] = useState(
    formatDateTime(new Date())
  );

  // 1. Estados para todos los campos del formulario
  const [usuario, setUsuario] = useState("Usuario Predeterminado");
  const [colorSuelo, setColorSuelo] = useState("");
  const [olorDetectado, setOlorDetectado] = useState("");
  const [texturaSuelo, setTexturaSuelo] = useState("");
  const [viscosidadSustancia, setViscosidadSustancia] = useState("");
  const [residuosPresentes, setResiduosPresentes] = useState("");
  const [observacionesAdicionales, setObservacionesAdicionales] = useState("");
  const [riesgoInicial, setRiesgoInicial] = useState(RIESGOS[0]);
  const [estadoSincronizacion, setEstadoSincronizacion] = useState("Pendiente");

  // Estados de UI
  const [isRiskModalVisible, setIsRiskModalVisible] = useState(false);

  // Función de simulación de guardado
  const handleGuardarReporte = () => {
    // Intentamos parsear la cadena editada por el usuario.
    const dateToSave = new Date(fechaHoraTexto);
    // Verificamos si la fecha es válida
    const fechaReporteISO = isNaN(dateToSave.getTime())
      ? "Error al parsear fecha o formato incorrecto"
      : dateToSave.toISOString();

    const reporte = {
      usuario,
      fechaHoraReporte: fechaReporteISO,
      colorSuelo,
      olorDetectado,
      texturaSuelo,
      viscosidadSustancia,
      residuosPresentes,
      observacionesAdicionales,
      riesgoInicial,
      estadoSincronizacion,
    };
    console.log("--- Reporte Guardado ---", reporte);
    // Usamos alert para notificar al usuario
    alert("Reporte guardado con éxito (Revisa la consola para ver los datos).");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado Superior (similar a la imagen) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} accessibilityLabel="Volver">
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>SS</Text>
        </View>
        <Text style={styles.headerTitle}>Suelo Sano</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Título de la Sección */}
        <Text style={styles.sectionTitle}>Reporte Básico</Text>
        {/* Tarjeta del Formulario */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Información del Reporte</Text>

          {/* 1. Usuario */}
          <CustomInput
            label="Usuario"
            value={usuario}
            onChangeText={setUsuario}
          />

          {/* 2. Fecha y hora del reporte (por defecto actual y editable) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Fecha y hora del reporte (Editable)
            </Text>
            <TextInput
              style={styles.input}
              value={fechaHoraTexto}
              onChangeText={setFechaHoraTexto} // Este cambio fue para evitar que el valor se resetee
              placeholder="dd/mm/aaaa, hh:mm:ss"
              keyboardType={Platform.OS === "ios" ? "default" : "datetime"}
            />
          </View>

          {/* 3. Color del suelo */}
          <CustomInput
            label="Color del suelo"
            value={colorSuelo}
            onChangeText={setColorSuelo}
          />

          {/* 4. Olor detectado */}
          <CustomInput
            label="Olor detectado"
            value={olorDetectado}
            onChangeText={setOlorDetectado}
          />

          {/* 5. Textura del suelo */}
          <CustomInput
            label="Textura del suelo"
            value={texturaSuelo}
            onChangeText={setTexturaSuelo}
          />

          {/* 6. Viscosidad de la sustancia */}
          <CustomInput
            label="Viscosidad de la sustancia"
            value={viscosidadSustancia}
            onChangeText={setViscosidadSustancia}
            keyboardType="numeric"
          />

          {/* 7. Residuos presentes */}
          <CustomInput
            label="Residuos presentes"
            value={residuosPresentes}
            onChangeText={setResiduosPresentes}
          />

          {/* 8. Observaciones adicionales (multilínea) */}
          <CustomInput
            label="Observaciones adicionales"
            value={observacionesAdicionales}
            onChangeText={setObservacionesAdicionales}
            multiline={true}
          />

          {/* 9. Riesgo sugerido inicial (Lista/Dropdown) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Riesgo sugerido inicial</Text>
            <Pressable
              style={styles.pickerDisplay}
              onPress={() => setIsRiskModalVisible(true)}
            >
              <Text style={styles.pickerText}>{riesgoInicial}</Text>
              <Text style={styles.pickerIcon}>▼</Text>
            </Pressable>

            <Modal
              animationType="slide"
              transparent={true}
              visible={isRiskModalVisible}
              onRequestClose={() => setIsRiskModalVisible(false)}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalTitle}>Seleccionar Riesgo</Text>
                  {RIESGOS.map((risk, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.modalOption,
                        index === RIESGOS.length - 1 && styles.lastModalOption,
                      ]}
                      onPress={() => {
                        setRiesgoInicial(risk);
                        setIsRiskModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalOptionText}>{risk}</Text>
                    </Pressable>
                  ))}
                  <TouchableOpacity
                    style={[styles.saveButton, styles.closeModalButton]}
                    onPress={() => setIsRiskModalVisible(false)}
                  >
                    <Text style={styles.saveButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          {/* 10. Estado de sincronizacion */}
          <CustomInput
            label="Estado de sincronización"
            value={estadoSincronizacion}
            onChangeText={setEstadoSincronizacion}
          />

          {/* Botón Guardar Reporte */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleGuardarReporte}
          >
            <Text style={styles.saveButtonText}>💾 Guardar Reporte</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 50 }} /> {/* Espacio al final */}
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Fondo general claro
  },
  // --- Estilos del Encabezado (Header) ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#388e3c", // Verde oscuro
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  backButton: {
    paddingRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  logoContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logoText: {
    color: "#388e3c",
    fontWeight: "900",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  // --- Estilos del Contenido y Formulario ---
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 15,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#388e3c",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  // --- Estilos de Inputs ---
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
    padding: 10,
  },
  // --- Estilos del Botón de Guardar ---
  saveButton: {
    backgroundColor: "#4caf50", // Verde vibrante
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  // --- Estilos para el Selector de Riesgo (Simulación con Modal) ---
  pickerDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  pickerText: {
    fontSize: 16,
    color: "#333",
  },
  pickerIcon: {
    fontSize: 12,
    color: "#888",
  },
  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalOption: {
    width: "100%",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  lastModalOption: {
    borderBottomWidth: 0, // Elimina la línea divisoria del último elemento
    marginBottom: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  closeModalButton: {
    backgroundColor: "#f44336", // Rojo para cerrar
    width: "100%",
    marginTop: 15,
  },
});
export default ReporteBasicoForm;
