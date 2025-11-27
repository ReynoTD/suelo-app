import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, StatusBar, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { getCurrentUser } from "./services/authService";
import { initializeDemoUsers } from "./services/initDemoData";

// Import screens
import HomeScreen from "./screens/homescreen";
import MapScreen from "./screens/mapscreen";
import MyReportsScreen from "./screens/myreportsscreen";
import ProfileScreen from "./screens/profilescreen";
import AdvancedReportScreen from "./screens/AdvancedReportScreen";
import BasicReportScreen from "./screens/basicReport";
import ReportDetailScreen from "./screens/ReportDetailScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import HelpScreen from "./screens/HelpScreen";
import Login from "./screens/login";
import Register from "./screens/register";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>SS</Text>
        </View>
        <Text style={styles.headerTitle}>Suelo Sano</Text>
      </View>
    </View>
  );
}

// Stack Navigator para la pantalla Home (incluye reportes básico y avanzado)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="BasicReport"
        component={BasicReportScreen}
        options={{
          headerShown: true,
          headerTitle: "Reporte Básico",
          headerStyle: {
            backgroundColor: "#2d7a2e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <Stack.Screen
        name="AdvancedReport"
        component={AdvancedReportScreen}
        options={{
          headerShown: true,
          headerTitle: "Reporte Avanzado",
          headerStyle: {
            backgroundColor: "#2d7a2e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator para la pantalla Mis Reportes (incluye detalles)
function ReportsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyReportsMain" component={MyReportsScreen} />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{
          headerShown: true,
          headerTitle: "Detalles del Reporte",
          headerStyle: {
            backgroundColor: "#2d7a2e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator para la pantalla Perfil (incluye editar perfil y notificaciones)
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          headerTitle: "Editar Perfil",
          headerStyle: {
            backgroundColor: "#2d7a2e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: true,
          headerTitle: "Notificaciones",
          headerStyle: {
            backgroundColor: "#2d7a2e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          headerShown: true,
          headerTitle: "Ayuda",
          headerStyle: {
            backgroundColor: "#2d7a2e",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      />
    </Stack.Navigator>
  );
}

// Tab Navigator principal
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Reportes") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "Mapa") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Mis Reportes") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2d7a2e",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen name="Reportes" component={HomeStack} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Mis Reportes" component={ReportsStack} />
      <Tab.Screen name="Perfil" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// Stack Navigator para autenticación (Login y Register)
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

// Navegador principal de la app (con Header y Tabs)
function MainAppNavigator() {
  return (
    <View style={styles.container}>
      <Header />
      <MainTabs />
    </View>
  );
}

// Navegador raíz que decide entre Auth y Main App
function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Inicializar usuarios de demostración
      await initializeDemoUsers();

      // Verificar si hay sesión activa
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error("Error initializing app:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d7a2e" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="MainApp" component={MainAppNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStack} />
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2d7a2e" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
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
    paddingTop: 40,
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
