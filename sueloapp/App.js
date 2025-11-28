import React from "react";
import { StyleSheet, View, Text, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// Import screens
import HomeScreen from "./screens/homescreen";
import MapScreen from "./screens/mapscreen";
import MyReportsScreen from "./screens/myreportsscreen";
import ProfileScreen from "./screens/profilescreen";
import AdvancedReportScreen from "./screens/AdvancedReportScreen";
import BasicReport from "./screens/basicReport";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

// Stack Navigator para la pantalla Home (incluye el reporte avanzado)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="BasicReport" component={BasicReport} 
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
        }}/>
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
      <Tab.Screen name="Mis Reportes" component={MyReportsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2d7a2e" />
      <NavigationContainer>
        <View style={styles.container}>
          <Header />
          <MainTabs />
        </View>
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
});
