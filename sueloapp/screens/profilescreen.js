import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, CommonActions } from "@react-navigation/native";
import { getCurrentUser, logoutUser } from "../services/authService";
import { getReportStats, getAllReports } from "../services/reportService";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    advanced: 0,
    basic: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      const reportStats = await getReportStats();

      // Obtener reportes no sincronizados
      const allReports = await getAllReports();
      const unsynced = allReports.filter((report) => !report.synced);

      setUser(currentUser);
      setStats(reportStats);
      setUnsyncedCount(unsynced.length);
    } catch (error) {
      console.error("Error cargando datos del usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (loggingOut) return; // Prevenir múltiples clics

    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              setLoggingOut(true);
              const result = await logoutUser();

              if (result.success) {
                // Pequeño delay para mostrar feedback visual
                setTimeout(() => {
                  // Resetear la navegación y redirigir al login
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: "Auth" }],
                    })
                  );
                  setLoggingOut(false);
                }, 300);
              } else {
                setLoggingOut(false);
                Alert.alert("Error", result.message || "No se pudo cerrar sesión");
              }
            } catch (error) {
              setLoggingOut(false);
              console.error("Error en logout:", error);
              Alert.alert(
                "Error",
                "Ocurrió un error al cerrar sesión. Por favor intenta de nuevo."
              );
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "Editar Perfil",
      color: "#2d7a2e",
      onPress: () => navigation.navigate("EditProfile")
    },
    {
      icon: "notifications-outline",
      title: "Notificaciones",
      color: "#2d7a2e",
      badge: unsyncedCount > 0 ? unsyncedCount : null,
      onPress: () => navigation.navigate("Notifications")
    },
    {
      icon: "settings-outline",
      title: "Configuración",
      color: "#2d7a2e",
      onPress: () => console.log("Configuración")
    },
    {
      icon: "help-circle-outline",
      title: "Ayuda",
      color: "#2d7a2e",
      onPress: () => navigation.navigate("Help")
    },
    {
      icon: "log-out-outline",
      title: "Cerrar Sesión",
      color: "#d32f2f",
      onPress: handleLogout
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d7a2e" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (loggingOut) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d7a2e" />
        <Text style={styles.loadingText}>Cerrando sesión...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text style={styles.name}>{user?.name || "Usuario"}</Text>
          <Text style={styles.email}>{user?.email || "usuario@suelosano.com"}</Text>

          {/* Información adicional del perfil */}
          {(user?.profession || user?.organization) && (
            <View style={styles.additionalInfo}>
              {user?.profession && (
                <View style={styles.infoRow}>
                  <Ionicons name="school" size={14} color="#666" />
                  <Text style={styles.infoText}>{user.profession}</Text>
                </View>
              )}
              {user?.organization && (
                <View style={styles.infoRow}>
                  <Ionicons name="business" size={14} color="#666" />
                  <Text style={styles.infoText}>{user.organization}</Text>
                </View>
              )}
              {user?.phone && (
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={14} color="#666" />
                  <Text style={styles.infoText}>{user.phone}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.advanced}</Text>
            <Text style={styles.statLabel}>Avanzados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.basic}</Text>
            <Text style={styles.statLabel}>Básicos</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon} size={24} color={item.color} />
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.menuTitle,
                    item.title === "Cerrar Sesión" && styles.menuTitleDanger,
                  ]}
                >
                  {item.title}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
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
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2d7a2e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  additionalInfo: {
    marginTop: 8,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
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
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2d7a2e",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#d32f2f",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  menuTitle: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  menuTitleDanger: {
    color: "#d32f2f",
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
});
