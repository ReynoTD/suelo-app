import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser, updateUserProfile } from "../services/authService";

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    organization: "",
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          profession: user.profession || "",
          organization: user.organization || "",
        });
      }
    } catch (error) {
      console.error("Error cargando datos del usuario:", error);
      Alert.alert("Error", "No se pudo cargar la información del usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validaciones
    if (!userData.name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }

    if (userData.phone && !/^\d{10}$/.test(userData.phone.replace(/\s/g, ""))) {
      Alert.alert(
        "Error",
        "El teléfono debe tener 10 dígitos numéricos"
      );
      return;
    }

    setSaving(true);

    try {
      const currentUser = await getCurrentUser();
      const result = await updateUserProfile(currentUser.id, {
        name: userData.name.trim(),
        phone: userData.phone.trim(),
        profession: userData.profession.trim(),
        organization: userData.organization.trim(),
      });

      setSaving(false);

      if (result.success) {
        Alert.alert(
          "Éxito",
          "Tu perfil ha sido actualizado exitosamente",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      setSaving(false);
      Alert.alert("Error", "Ocurrió un error al actualizar el perfil");
      console.error("Error actualizando perfil:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d7a2e" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color="#fff" />
              </View>
              <TouchableOpacity style={styles.avatarEditButton}>
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>Editar Perfil</Text>
            <Text style={styles.headerSubtitle}>
              Actualiza tu información personal
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.formSection}>
            {/* Nombre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nombre y Apellido <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Juan Pérez García"
                  value={userData.name}
                  onChangeText={(text) =>
                    setUserData({ ...userData, name: text })
                  }
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email (solo lectura) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.inputReadOnly]}
                  value={userData.email}
                  editable={false}
                />
                <Ionicons name="lock-closed" size={16} color="#999" />
              </View>
              <Text style={styles.helperText}>
                El correo no puede ser modificado
              </Text>
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono de Contacto</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 9931234567"
                  value={userData.phone}
                  onChangeText={(text) =>
                    setUserData({ ...userData, phone: text })
                  }
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <Text style={styles.helperText}>10 dígitos numéricos</Text>
            </View>

            {/* Profesión */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Profesión / Especialidad</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="school-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ej. Ingeniero Ambiental, Geólogo"
                  value={userData.profession}
                  onChangeText={(text) =>
                    setUserData({ ...userData, profession: text })
                  }
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Organización */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Organización / Empresa</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="business-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ej. SEMARNAT, Universidad de..."
                  value={userData.organization}
                  onChangeText={(text) =>
                    setUserData({ ...userData, organization: text })
                  }
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* Información adicional */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#2d7a2e" />
            <Text style={styles.infoText}>
              Los campos marcados con <Text style={styles.required}>*</Text>{" "}
              son obligatorios. El resto de la información es opcional pero
              ayuda a mejorar tu experiencia.
            </Text>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Ionicons name="close-circle-outline" size={20} color="#666" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2d7a2e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarEditButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6b8e23",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  formSection: {
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#d32f2f",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 12,
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  inputReadOnly: {
    color: "#999",
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
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
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#2d7a2e",
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
