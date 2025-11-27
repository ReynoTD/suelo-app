import AsyncStorage from "@react-native-async-storage/async-storage";

const ADVANCED_REPORTS_KEY = "advancedReports";
const BASIC_REPORTS_KEY = "basicReports";

// Obtener todos los reportes avanzados
export const getAdvancedReports = async () => {
  try {
    const reportsJson = await AsyncStorage.getItem(ADVANCED_REPORTS_KEY);
    return reportsJson ? JSON.parse(reportsJson) : [];
  } catch (error) {
    console.error("Error obteniendo reportes avanzados:", error);
    return [];
  }
};

// Obtener todos los reportes básicos
export const getBasicReports = async () => {
  try {
    const reportsJson = await AsyncStorage.getItem(BASIC_REPORTS_KEY);
    return reportsJson ? JSON.parse(reportsJson) : [];
  } catch (error) {
    console.error("Error obteniendo reportes básicos:", error);
    return [];
  }
};

// Obtener todos los reportes (básicos y avanzados)
export const getAllReports = async () => {
  try {
    const advanced = await getAdvancedReports();
    const basic = await getBasicReports();

    // Combinar y ordenar por fecha de creación (más reciente primero)
    const allReports = [...advanced, ...basic].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return allReports;
  } catch (error) {
    console.error("Error obteniendo todos los reportes:", error);
    return [];
  }
};

// Obtener un reporte por ID
export const getReportById = async (id) => {
  try {
    const allReports = await getAllReports();
    return allReports.find((report) => report.id === id);
  } catch (error) {
    console.error("Error obteniendo reporte por ID:", error);
    return null;
  }
};

// Eliminar un reporte
export const deleteReport = async (id, type) => {
  try {
    const key = type === "advanced" ? ADVANCED_REPORTS_KEY : BASIC_REPORTS_KEY;
    const reportsJson = await AsyncStorage.getItem(key);
    const reports = reportsJson ? JSON.parse(reportsJson) : [];

    const updatedReports = reports.filter((report) => report.id !== id);

    await AsyncStorage.setItem(key, JSON.stringify(updatedReports));
    return true;
  } catch (error) {
    console.error("Error eliminando reporte:", error);
    return false;
  }
};

// Marcar un reporte como sincronizado
export const markReportAsSynced = async (id, type) => {
  try {
    const key = type === "advanced" ? ADVANCED_REPORTS_KEY : BASIC_REPORTS_KEY;
    const reportsJson = await AsyncStorage.getItem(key);
    const reports = reportsJson ? JSON.parse(reportsJson) : [];

    const updatedReports = reports.map((report) => {
      if (report.id === id) {
        return { ...report, synced: true, syncedAt: new Date().toISOString() };
      }
      return report;
    });

    await AsyncStorage.setItem(key, JSON.stringify(updatedReports));
    return true;
  } catch (error) {
    console.error("Error marcando reporte como sincronizado:", error);
    return false;
  }
};

// Limpiar todos los reportes (para testing)
export const clearAllReports = async () => {
  try {
    await AsyncStorage.removeItem(ADVANCED_REPORTS_KEY);
    await AsyncStorage.removeItem(BASIC_REPORTS_KEY);
    return true;
  } catch (error) {
    console.error("Error limpiando reportes:", error);
    return false;
  }
};

// Obtener estadísticas de reportes
export const getReportStats = async () => {
  try {
    const allReports = await getAllReports();
    const advanced = await getAdvancedReports();
    const basic = await getBasicReports();

    // Calcular reportes del mes actual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthReports = allReports.filter((report) => {
      const reportDate = new Date(report.createdAt);
      return (
        reportDate.getMonth() === currentMonth &&
        reportDate.getFullYear() === currentYear
      );
    });

    // Contar reportes por nivel de riesgo (solo avanzados)
    const riskCounts = {
      Alto: 0,
      Medio: 0,
      Bajo: 0,
    };

    advanced.forEach((report) => {
      if (report.results && report.results.riskLevel) {
        const level = report.results.riskLevel;
        if (riskCounts.hasOwnProperty(level)) {
          riskCounts[level]++;
        }
      }
    });

    return {
      total: allReports.length,
      advanced: advanced.length,
      basic: basic.length,
      thisMonth: thisMonthReports.length,
      riskCounts,
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return {
      total: 0,
      advanced: 0,
      basic: 0,
      thisMonth: 0,
      riskCounts: { Alto: 0, Medio: 0, Bajo: 0 },
    };
  }
};
