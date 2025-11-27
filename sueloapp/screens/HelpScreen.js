import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HelpScreen() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const faqData = [
    {
      question:
        "¿Cuál es el objetivo principal del apartado avanzado de la aplicación?",
      answer:
        "El objetivo principal de este apartado es permitir a un profesional con conocimientos técnicos realizar una caracterización preliminar y una estimación del riesgo potencial en un sitio contaminado. Esta evaluación se basa exclusivamente en observaciones in situ y conocimiento experto, sin necesidad de resultados de laboratorio inmediatos. Su función es priorizar sitios y orientar los siguientes pasos de muestreo, conforme a los lineamientos de la NOM-138.",
      icon: "bulb",
      iconColor: "#2d7a2e",
    },
    {
      question:
        "¿Qué información del sitio es crítica recopilar y cómo se relaciona con la NOM-138?",
      answer:
        "La información más crítica es el Uso de Suelo Predominante (residencial, agrícola, industrial, etc.) y la Ubicación Geográfica del sitio. Esto es fundamental porque la NOM-138-SEMARNAT/SSA1-2012 (Tabla 1) establece Límites Máximos Permisibles (LMP) de hidrocarburos distintos para cada uso de suelo. Un sitio clasificado como residencial o agrícola tendrá límites más estrictos, lo que automáticamente incrementa el riesgo asociado.",
      icon: "location",
      iconColor: "#6b8e23",
    },
    {
      question:
        "¿Qué tipo de observaciones técnicas se deben registrar en el formulario?",
      answer:
        "El profesional debe registrar observaciones específicas que indican la presencia y concentración de contaminantes. Esto incluye:\n\n• Intensidad y tipo de Olor (ej., a combustible, a aceite quemado)\n• Coloración y Extensión de la mancha\n• Textura y Consistencia del suelo (si es grasoso, pegajoso)\n• Presencia de Fase Libre, que es el hidrocarburo puro inmovilizado en el suelo o flotando sobre el agua",
      icon: "eye",
      iconColor: "#f57c00",
    },
    {
      question:
        "¿Por qué es importante considerar la hidrogeología, como la Profundidad del Nivel Freático (NF)?",
      answer:
        "Es crucial registrar una estimación de la Profundidad Aparente del Nivel Freático (NF). Esto se debe a que la cercanía del contaminante al agua subterránea incrementa significativamente el riesgo de migración y dispersión. Un NF somero (generalmente <= 5 metros) es un factor que aumenta el ponderador de riesgo, lo que obliga a una acción más rápida y detallada en la evaluación, tal como lo requiere el enfoque de riesgo de la NOM-138.",
      icon: "water",
      iconColor: "#1976d2",
    },
    {
      question:
        "¿Cómo realiza la aplicación el análisis y emite un resultado sin tener datos de laboratorio?",
      answer:
        "La aplicación utiliza un Sistema de Puntuación Ponderada para calcular un Índice de Riesgo Preliminar (IRP). Este índice se obtiene asignando puntos a cada observación técnica de riesgo (si hay fase libre, si el olor es severo, etc.) y multiplicando la suma de estos puntos por ponderadores de riesgo (ej., x3 si el uso de suelo es residencial, o un factor alto si el NF es somero). Este método permite generar una clasificación estimada del sitio (Bajo, Medio o Alto riesgo).",
      icon: "analytics",
      iconColor: "#7b1fa2",
    },
    {
      question:
        "¿Cómo se interpreta el resultado del IRP y qué acciones se recomiendan?",
      answer:
        "El resultado final se presenta como un Nivel de Contaminación Estimado (Bajo, Medio o Alto), basado en los rangos del IRP:\n\n• Nivel Bajo: Sugiere monitoreo\n• Nivel Medio: Indica una probable superación de los LMP de la NOM-138\n• Nivel Alto: Requiere Atención Inmediata debido a la alta probabilidad de contaminación y riesgo ambiental/salud\n\nSe recomienda realizar el Muestreo de Caracterización siguiendo los lineamientos del Capítulo 4 de la NOM-138-SEMARNAT/SSA1-2012 para confirmar los niveles de contaminación.",
      icon: "warning",
      iconColor: "#d32f2f",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="book" size={40} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>Centro de Ayuda</Text>
          <Text style={styles.headerSubtitle}>
            NOM-138-SEMARNAT/SSA1-2012
          </Text>
        </View>

        {/* Intro Card */}
        <View style={styles.introCard}>
          <Ionicons name="information-circle" size={24} color="#2d7a2e" />
          <View style={styles.introTextContainer}>
            <Text style={styles.introTitle}>
              Preguntas Frecuentes del Apartado Avanzado
            </Text>
            <Text style={styles.introText}>
              Información técnica sobre evaluación de sitios contaminados
            </Text>
          </View>
        </View>

        {/* FAQ Sections */}
        <View style={styles.faqContainer}>
          {faqData.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
              >
                <View style={styles.questionLeft}>
                  <View
                    style={[
                      styles.questionIconContainer,
                      { backgroundColor: `${item.iconColor}15` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={item.iconColor}
                    />
                  </View>
                  <Text style={styles.questionText}>{item.question}</Text>
                </View>
                <Ionicons
                  name={
                    expandedIndex === index ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>

              {expandedIndex === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Reference Card */}
        <View style={styles.referenceCard}>
          <View style={styles.referenceHeader}>
            <Ionicons name="document-text" size={20} color="#2d7a2e" />
            <Text style={styles.referenceTitle}>Referencia Normativa</Text>
          </View>
          <Text style={styles.referenceText}>
            NOM-138-SEMARNAT/SSA1-2012: Límites máximos permisibles de
            hidrocarburos en suelos y lineamientos para el muestreo en la
            caracterización y especificaciones para la remediación.
          </Text>
        </View>

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <Ionicons name="help-circle" size={24} color="#2d7a2e" />
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactTitle}>
              ¿Necesitas más información?
            </Text>
            <Text style={styles.contactText}>
              Consulta la documentación completa de la NOM-138 o contacta a un
              especialista ambiental certificado.
            </Text>
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Suelo Sano App v1.0.0</Text>
          <Text style={styles.versionSubtext}>
            Evaluación preliminar de sitios contaminados
          </Text>
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
  header: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 20,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2d7a2e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontWeight: "500",
  },
  introCard: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#2d7a2e",
  },
  introTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  introText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  faqContainer: {
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  questionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  questionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    lineHeight: 20,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  answerText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    textAlign: "justify",
  },
  referenceCard: {
    backgroundColor: "#fff9e6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f57c00",
  },
  referenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  referenceText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  contactText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  versionContainer: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  versionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: "#bbb",
  },
});
