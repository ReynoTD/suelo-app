import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MyReportsScreen() {
  const reports = [
    {
      id: 1,
      type: "Básico",
      location: "Villahermosa Centro",
      date: "02 Nov 2025",
      status: "Completado",
    },
    {
      id: 2,
      type: "Avanzado",
      location: "Zona Industrial",
      date: "01 Nov 2025",
      status: "Pendiente",
    },
    {
      id: 3,
      type: "Básico",
      location: "Parque La Choca",
      date: "30 Oct 2025",
      status: "Completado",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mis Reportes</Text>

        {reports.map((report) => (
          <TouchableOpacity key={report.id} style={styles.reportCard}>
            <View style={styles.reportIcon}>
              <Ionicons
                name={report.type === "Básico" ? "document-text" : "camera"}
                size={24}
                color="#2d7a2e"
              />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportType}>{report.type}</Text>
              <Text style={styles.reportLocation}>{report.location}</Text>
              <Text style={styles.reportDate}>{report.date}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                report.status === "Pendiente" && styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  report.status === "Pendiente" && styles.statusTextPending,
                ]}
              >
                {report.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  reportCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e8f5e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: "#fff3e0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2d7a2e",
  },
  statusTextPending: {
    color: "#f57c00",
  },
});
