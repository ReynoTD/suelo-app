import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
  Alert,
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

const ReporteBasicoForm = ({ navigation }) => {
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
    Alert.alert(
      "Reporte Guardado",
      "El reporte básico ha sido guardado exitosamente."
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Título de la Sección */}
        <Text style={styles.mainTitle}>Reporte Básico</Text>
        <Text style={styles.subtitle}>
          Registro rápido de contaminación de suelos
        </Text>
        {/* Sección del Formulario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Reporte</Text>

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
            style={styles.buttonPrimary}
            onPress={handleGuardarReporte}
          >
            <Text style={styles.buttonText}>Guardar Reporte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonSecondaryText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// Estilos
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
  inputGroup: {
    marginBottom: 15,
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
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
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
  pickerDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  pickerText: {
    fontSize: 14,
    color: "#333",
  },
  pickerIcon: {
    fontSize: 12,
    color: "#666",
  },
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
    color: "#333",
  },
  modalOption: {
    width: "100%",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  lastModalOption: {
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
  },
  closeModalButton: {
    backgroundColor: "#d32f2f",
    width: "100%",
    marginTop: 15,
  },
});
export default ReporteBasicoForm;
