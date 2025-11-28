import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- CONSTANTES: OPCIONES INTELIGENTES CON PUNTOS DE RIESGO ---
// 1. OLOR
const OPCIONES_OLOR = [
  { label: 'No', puntos: 0 },
  { label: 'Sí', puntos: 25 }
];

// 2. COLOR
const OPCIONES_COLOR = [
  { label: 'Natural / Sin cambio', puntos: 0 },
  { label: 'Oscuro / Manchado', puntos: 15 },
  { label: 'Iridiscente (Brillo aceite)', puntos: 20 }
];

// 3. RESIDUOS
const OPCIONES_RESIDUOS = [
  { label: 'Ninguno visible', puntos: 0 },
  { label: 'Basura inorgánica', puntos: 5 },
  { label: 'Vegetación muerta/quemada', puntos: 15 },
  { label: 'Restos de hidrocarburo/aceite', puntos: 25 }
];

// 4. CUERPOS DE AGUA (Factor Crítico)
const OPCIONES_AGUA = [
  { label: 'No', puntos: 0 },
  { label: 'Sí, > 500m', puntos: 10 },
  { label: 'Sí, entre 50-500m', puntos: 25 },
  { label: '⚠️ Sí, < 50m (Crítico)', puntos: 45 }
];

// Riesgos para el selector manual
const RIESGOS_MANUAL = ['Bajo', 'Medio', 'Alto', 'Muy Alto'];

// Función para formatear fecha
const formatDateTime = (date) => {
  const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleString('es-ES', options);
};

// Componente de Input Normal
const CustomInput = ({ label, value, onChangeText, multiline = false, placeholder = "" }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      placeholder={placeholder}
      placeholderTextColor="#999"
    />
  </View>
);

// Componente Selector de Opciones (Chips)
const SelectorOpciones = ({ label, opciones, seleccionActual, onSeleccionar }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label} *</Text>
    <View style={styles.optionsContainer}>
      {opciones.map((opcion, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            seleccionActual?.label === opcion.label && styles.optionSelected
          ]}
          onPress={() => onSeleccionar(opcion)}
        >
          <Text
            style={[
              styles.optionText,
              seleccionActual?.label === opcion.label && styles.optionTextSelected
            ]}
          >
            {opcion.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);


const ReporteBasicoForm = () => {
  const [fechaHoraTexto, setFechaHoraTexto] = useState(formatDateTime(new Date()));

  // --- ESTADOS DEL FORMULARIO ---
  // CAMBIO 1: Usuario inicia vacío para que escriban su nombre
  const [usuario, setUsuario] = useState('');
  
  const [seleccionOlor, setSeleccionOlor] = useState(null);
  const [seleccionColor, setSeleccionColor] = useState(null);
  const [seleccionResiduos, setSeleccionResiduos] = useState(null);
  const [seleccionAgua, setSeleccionAgua] = useState(null);
  const [areaAfectada, setAreaAfectada] = useState('');
  const [observacionesAdicionales, setObservacionesAdicionales] = useState('');

  // Selector Manual
  const [riesgoManual, setRiesgoManual] = useState(RIESGOS_MANUAL[0]);
  const [isRiskModalVisible, setIsRiskModalVisible] = useState(false);

  // --- ESTADOS CÁLCULO Y AYUDA ---
  const [riesgoCalculado, setRiesgoCalculado] = useState(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  // CAMBIO 2: Estado para el modal de ayuda (?)
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

  // Estados Geolocalización
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [address, setAddress] = useState(null);

  // Efecto Geolocalización
  useEffect(() => {
    (async () => {
      setLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setErrorMsg('Permiso denegado.'); setLoadingLocation(false); return; }
      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude
        });
        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          setAddress(`${place.street || ''} ${place.streetNumber || ''}, ${place.city || ''}, ${place.region || ''}`);
        }
      } catch (error) { setErrorMsg('Error de ubicación.'); } finally { setLoadingLocation(false); }
    })();
  }, []);
  
  // --- ALGORITMO DE CÁLCULO ---
  const calcularRiesgoAutomatico = () => {
    if (!seleccionOlor || !seleccionColor || !seleccionResiduos || !seleccionAgua || !areaAfectada) {
      Alert.alert("Faltan datos", "Por favor responde todas las preguntas con asterisco (*) y el área.");
      return;
    }
    let puntosTotales = 0;
    let factoresRiesgo = [];

    puntosTotales += seleccionOlor.puntos;
    if (seleccionOlor.puntos > 0) factoresRiesgo.push(`Olor: ${seleccionOlor.label}`);
    puntosTotales += seleccionColor.puntos;
    if (seleccionColor.puntos > 10) factoresRiesgo.push(`Color: ${seleccionColor.label}`);
    puntosTotales += seleccionResiduos.puntos;
    if (seleccionResiduos.puntos > 10) factoresRiesgo.push(`Residuos: ${seleccionResiduos.label}`);
    puntosTotales += seleccionAgua.puntos;
    if (seleccionAgua.puntos >= 25) factoresRiesgo.push(`Agua cercana: ${seleccionAgua.label} ⚠️`);

    const areaNum = parseFloat(areaAfectada) || 0;
    if (areaNum > 1000) { puntosTotales += 30; factoresRiesgo.push("Área muy grande (>1000 m²)"); }
    else if (areaNum > 100) { puntosTotales += 20; factoresRiesgo.push("Área grande (>100 m²)"); }
    else if (areaNum > 10) { puntosTotales += 10; }

    let nivel = 'Bajo';
    if (puntosTotales >= 60) nivel = 'Alto ⚠️';
    else if (puntosTotales >= 30) nivel = 'Medio';

    const resultado = { puntos: puntosTotales, nivel: nivel, factores: factoresRiesgo };
    setRiesgoCalculado(resultado);
    setMostrarResultado(true);
    // Alert.alert("Cálculo Realizado", `Nivel: ${nivel}\nPuntaje: ${puntosTotales}/120`); // Comenté la alerta para que solo se vea en el cuadro
  };

  // Función Guardar Local
  const handleGuardarReporte = async () => {
    if (!riesgoManual && !riesgoCalculado) { Alert.alert("Falta información", "Calcula el riesgo o selecciona uno manual."); return; }
    // CAMBIO 1: Validación si no pusieron nombre
    const usuarioFinal = usuario.trim() === '' ? 'Anónimo' : usuario;

    const nuevoReporte = {
      id: Date.now().toString(),
      usuario: usuarioFinal,
      fechaHoraReporte: new Date().toISOString(),
      ubicacion: location ? { lat: location.coords.latitude, lon: location.coords.longitude, dir: address } : 'No disp.',
      datos: {
        olor: seleccionOlor?.label || '',
        color: seleccionColor?.label || '',
        residuos: seleccionResiduos?.label || '',
        agua: seleccionAgua?.label || '',
        area: areaAfectada,
        observaciones: observacionesAdicionales
      },
      riesgoManual: riesgoManual,
      riesgoCalculado: riesgoCalculado,
      estadoSincronizacion: 'Pendiente'
    };
    try {
      const reportesJson = await AsyncStorage.getItem('mis_reportes_suelo');
      let reportes = reportesJson ? JSON.parse(reportesJson) : [];
      reportes.push(nuevoReporte);
      await AsyncStorage.setItem('mis_reportes_suelo', JSON.stringify(reportes));
      Alert.alert("¡Guardado!", `Reporte de ${usuarioFinal} guardado localmente.`);
    } catch (error) { Alert.alert("Error", "No se pudo guardar."); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}><Text style={styles.backButtonText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Reporte Básico</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Datos del Sitio</Text>
          {/* CAMBIO 1: Input de Usuario con Placeholder */}
          <CustomInput 
            label="Nombre del evaluador" 
            value={usuario} 
            onChangeText={setUsuario}
            placeholder="Escribe tu nombre aquí"
          />
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ubicación</Text>
            <View style={styles.locationBox}>
              {loadingLocation ? <Text>📡 Buscando...</Text> : errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : 
               address ? <Text style={styles.addressText}>{address}</Text> : <Text>No disponible</Text>}
            </View>
          </View>

          <Text style={styles.cardTitle}>Evaluación Visual *</Text>
          <SelectorOpciones label="¿Olor a combustible?" opciones={OPCIONES_OLOR} seleccionActual={seleccionOlor} onSeleccionar={setSeleccionOlor} />
          <SelectorOpciones label="Color del suelo" opciones={OPCIONES_COLOR} seleccionActual={seleccionColor} onSeleccionar={setSeleccionColor} />
          <SelectorOpciones label="Residuos visibles" opciones={OPCIONES_RESIDUOS} seleccionActual={seleccionResiduos} onSeleccionar={setSeleccionResiduos} />
          <SelectorOpciones label="Cuerpos de agua cercanos" opciones={OPCIONES_AGUA} seleccionActual={seleccionAgua} onSeleccionar={setSeleccionAgua} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Área afectada estimada (m²) *</Text>
            <TextInput
              style={styles.input}
              value={areaAfectada}
              onChangeText={setAreaAfectada}
              placeholder="Ej. 50"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <CustomInput label="Observaciones adicionales" value={observacionesAdicionales} onChangeText={setObservacionesAdicionales} multiline />

          <Text style={styles.cardTitle}>Análisis de Riesgo</Text>

          <TouchableOpacity style={styles.calculateButton} onPress={calcularRiesgoAutomatico}>
            <Ionicons name="calculator-outline" size={20} color="white" style={{marginRight:8}} />
            <Text style={styles.saveButtonText}>Calcular Riesgo Automático</Text>
          </TouchableOpacity>

          {/* RESULTADO DEL CÁLCULO CON BOTÓN DE AYUDA (?) */}
          {mostrarResultado && riesgoCalculado && (
            <View style={[styles.resultBox, riesgoCalculado.nivel.includes('Alto') ? styles.resultHigh : riesgoCalculado.nivel === 'Medio' ? styles.resultMedium : styles.resultLow]}>
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={styles.resultTitle}>Resultado de la App:</Text>
                {/* CAMBIO 2: Botón de Ayuda (?) */}
                <TouchableOpacity onPress={() => setIsHelpModalVisible(true)}>
                  <Ionicons name="help-circle-outline" size={24} color="#1976D2" />
                </TouchableOpacity>
              </View>
              <Text style={styles.resultLevel}>{riesgoCalculado.nivel}</Text>
              <Text>Puntaje: {riesgoCalculado.puntos} / 120 puntos</Text>
              {riesgoCalculado.factores.length > 0 && (
                 <View style={{marginTop: 5}}><Text style={{fontWeight:'bold'}}>Factores principales:</Text>
                 {riesgoCalculado.factores.map((f, i) => <Text key={i} style={{fontSize:12}}>• {f}</Text>)}</View>
              )}
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Riesgo sugerido (Manual)</Text>
            <Pressable style={styles.pickerDisplay} onPress={() => setIsRiskModalVisible(true)}>
              <Text style={styles.pickerText}>{riesgoManual}</Text><Text>▼</Text>
            </Pressable>
          </View>

          {/* CAMBIO 3: Se eliminó el botón azul de Historial */}
          <TouchableOpacity style={styles.saveButton} onPress={handleGuardarReporte}>
            <Text style={styles.saveButtonText}>💾 Guardar Reporte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL RIESGO MANUAL */}
      <Modal animationType="slide" transparent={true} visible={isRiskModalVisible} onRequestClose={() => setIsRiskModalVisible(false)}>
        <View style={styles.centeredView}><View style={styles.modalView}>
            <Text style={styles.modalTitle}>Seleccionar Riesgo Manual</Text>
            {RIESGOS_MANUAL.map((risk, index) => (
              <Pressable key={index} style={styles.modalOption} onPress={() => { setRiesgoManual(risk); setIsRiskModalVisible(false); }}>
                <Text style={styles.modalOptionText}>{risk}</Text>
              </Pressable>
            ))}
            <TouchableOpacity style={[styles.saveButton, styles.closeModalButton]} onPress={() => setIsRiskModalVisible(false)}>
              <Text style={styles.saveButtonText}>Cerrar</Text>
            </TouchableOpacity>
        </View></View>
      </Modal>
      
      {/* CAMBIO 2: NUEVO MODAL DE AYUDA (?) */}
      <Modal animationType="fade" transparent={true} visible={isHelpModalVisible} onRequestClose={() => setIsHelpModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>¿Cómo se calcula el riesgo?</Text>
            <ScrollView style={{maxHeight: 300}}>
              <Text style={{marginBottom:10}}>El sistema asigna puntos basado en indicios críticos de la NOM-138:</Text>
              <Text style={{fontWeight:'bold'}}>Puntos Clave:</Text>
              <Text>• Agua cercana (&lt;50m): +45 pts (Crítico)</Text>
              <Text>• Olor a combustible: +25 pts</Text>
              <Text>• Residuos de hidrocarburo: +25 pts</Text>
              <Text>• Área muy grande: +30 pts</Text>
              <Text style={{fontWeight:'bold', marginTop:10}}>Escala de Riesgo (Máx 120):</Text>
              <Text>🔴 Alto: 60 puntos o más</Text>
              <Text>🟠 Medio: 30 a 59 puntos</Text>
              <Text>🟢 Bajo: Menos de 30 puntos</Text>
            </ScrollView>
            <TouchableOpacity style={[styles.saveButton, {marginTop:15, backgroundColor:'#1976D2'}]} onPress={() => setIsHelpModalVisible(false)}>
              <Text style={styles.saveButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#388e3c' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 16 },
  backButtonText: { fontSize: 24, color: '#fff' },
  content: { flex: 1, padding: 16 },
  formCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#388e3c', marginBottom: 15, marginTop: 10 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: '#333', fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f5f5f5' },
  multilineInput: { height: 80, textAlignVertical: 'top' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: { flexGrow: 1, backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', marginBottom: 8 },
  optionSelected: { backgroundColor: '#e8f5e9', borderColor: '#388e3c' },
  optionText: { fontSize: 14, color: '#666' },
  optionTextSelected: { color: '#388e3c', fontWeight: 'bold' },
  locationBox: { backgroundColor: '#e8f5e9', padding: 12, borderRadius: 8, borderColor: '#c8e6c9', borderWidth:1 },
  addressText: { color: '#2e7d32', fontWeight: 'bold' },
  errorText: { color: '#d32f2f' },
  saveButton: { backgroundColor: '#4caf50', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  calculateButton: { backgroundColor: '#FF9800', padding: 12, borderRadius: 10, alignItems: 'center', marginVertical: 15, flexDirection:'row', justifyContent:'center' },
  resultBox: { padding: 15, borderRadius: 8, marginBottom: 15, borderWidth: 1 },
  resultTitle: { fontWeight: 'bold', fontSize: 16 },
  resultLevel: { fontSize: 24, fontWeight: 'bold', marginVertical: 5 },
  resultHigh: { backgroundColor: '#ffebee', borderColor: '#d32f2f', color: '#d32f2f' },
  resultMedium: { backgroundColor: '#fff3e0', borderColor: '#f57c00', color: '#e65100' },
  resultLow: { backgroundColor: '#e8f5e9', borderColor: '#388e3c', color: '#2e7d32' },
  pickerDisplay: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, backgroundColor: '#f5f5f5' },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '85%', backgroundColor: 'white', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalOption: { width: '100%', padding: 12, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center' },
  closeModalButton: { backgroundColor: '#f44336', marginTop: 15, width: '100%' }
});

export default ReporteBasicoForm;