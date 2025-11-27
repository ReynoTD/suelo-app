import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import { loginUser } from "../services/authService";
import { getDemoUsersList } from "../services/initDemoData";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const demoUsers = getDemoUsersList();

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email.trim() || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser(email.trim().toLowerCase(), password);

      setLoading(false);

      if (result.success) {
        // Resetear la navegación y dirigir a la app principal
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "MainApp" }],
          })
        );
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Ocurrió un error al iniciar sesión");
      console.error("Error en login:", error);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setShowDemoAccounts(false);

    // Hacer login automáticamente
    setTimeout(async () => {
      setLoading(true);
      try {
        const result = await loginUser(demoEmail, demoPassword);
        setLoading(false);

        if (result.success) {
          // Resetear la navegación y dirigir a la app principal
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "MainApp" }],
            })
          );
        } else {
          Alert.alert("Error", result.message);
        }
      } catch (error) {
        setLoading(false);
        Alert.alert("Error", "Ocurrió un error al iniciar sesión");
      }
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2d7a2e" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header con Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>SS</Text>
              </View>
              <Text style={styles.headerTitle}>Suelo Sano</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Evaluación de contaminación de suelos
            </Text>
          </View>

          {/* Formulario de Login */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.instructionText}>
              Ingresa tus credenciales para continuar
            </Text>

            {/* Input de Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Input de Contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Olvidé mi contraseña */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Botón de Login */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.divider} />
            </View>

            {/* Botón de Registro */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.registerButtonText}>Crear Cuenta Nueva</Text>
            </TouchableOpacity>

            {/* Botón para mostrar cuentas demo */}
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => setShowDemoAccounts(!showDemoAccounts)}
            >
              <Ionicons
                name={showDemoAccounts ? "chevron-up" : "chevron-down"}
                size={16}
                color="#2d7a2e"
              />
              <Text style={styles.demoButtonText}>
                {showDemoAccounts ? "Ocultar" : "Ver"} Cuentas de Prueba
              </Text>
            </TouchableOpacity>

            {/* Lista de cuentas demo */}
            {showDemoAccounts && (
              <View style={styles.demoAccountsContainer}>
                <Text style={styles.demoAccountsTitle}>
                  Cuentas de Prueba Disponibles
                </Text>
                {demoUsers.map((user, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.demoAccountItem}
                    onPress={() => handleDemoLogin(user.email, user.password)}
                  >
                    <View style={styles.demoAccountInfo}>
                      <Ionicons name="person-circle" size={32} color="#2d7a2e" />
                      <View style={styles.demoAccountText}>
                        <Text style={styles.demoAccountName}>{user.name}</Text>
                        <Text style={styles.demoAccountEmail}>{user.email}</Text>
                        <Text style={styles.demoAccountPassword}>
                          Contraseña: {user.password}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#2d7a2e" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Al continuar, aceptas nuestros{" "}
                <Text style={styles.footerLink}>Términos de Servicio</Text> y{" "}
                <Text style={styles.footerLink}>Política de Privacidad</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#2d7a2e",
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#9dc183",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#c8e6c9",
    fontSize: 14,
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#2d7a2e",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#1b5e20",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#999",
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2d7a2e",
  },
  registerButtonText: {
    color: "#2d7a2e",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: {
    color: "#2d7a2e",
    fontWeight: "600",
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 16,
    gap: 6,
  },
  demoButtonText: {
    color: "#2d7a2e",
    fontSize: 14,
    fontWeight: "600",
  },
  demoAccountsContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  demoAccountsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  demoAccountItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  demoAccountInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  demoAccountText: {
    marginLeft: 12,
    flex: 1,
  },
  demoAccountName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  demoAccountEmail: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  demoAccountPassword: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },
});
