import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2d7a2e" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>SS</Text>
          </View>
          <Text style={styles.headerTitle}>Suelo Sano</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>Bienvenido a Suelo Sano</Text>
        <Text style={styles.welcomeSubtitle}>
          Evalúa y reporta la contaminación de suelos por hidrocarburos
        </Text>

        {/* Reporte Básico Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#2d7a2e"
              />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Reporte Básico</Text>
              <Text style={styles.cardSubtitle}>
                Registro rápido con ubicación, foto y comentario
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => console.log("Crear Reporte Básico")}
          >
            <Text style={styles.buttonPrimaryText}>+ Crear Reporte Básico</Text>
          </TouchableOpacity>
        </View>

        {/* Reporte Avanzado Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="camera-outline" size={24} color="#6b8e23" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Reporte Avanzado</Text>
              <Text style={styles.cardSubtitle}>
                Análisis detallado con tipo de hidrocarburo y concentración
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => console.log("Crear Reporte Avanzado")}
          >
            <Text style={styles.buttonSecondaryText}>
              + Crear Reporte Avanzado
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Reportes Este Mes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="document-text" size={24} color="#2d7a2e" />
          <Text style={[styles.navText, styles.navTextActive]}>Reportes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="map-outline" size={24} color="#888" />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="list-outline" size={24} color="#888" />
          <Text style={styles.navText}>Mis Reportes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#888" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2d7a2e",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#9dc183",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  buttonPrimary: {
    backgroundColor: "#1b5e20",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: "#6b8e23",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2d7a2e",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  navTextActive: {
    color: "#2d7a2e",
    fontWeight: "600",
  },
});
