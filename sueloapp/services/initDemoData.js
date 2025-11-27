import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "registeredUsers";

// Usuarios de demostración
const demoUsers = [
  {
    id: "demo1",
    name: "Juan Pérez",
    email: "juan@demo.com",
    password: "123456",
    phone: "9931234567",
    profession: "Ingeniero Ambiental",
    organization: "SEMARNAT Tabasco",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo2",
    name: "María García",
    email: "maria@demo.com",
    password: "123456",
    phone: "9339876543",
    profession: "Geóloga",
    organization: "Universidad Juárez Autónoma de Tabasco",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo3",
    name: "Carlos Rodríguez",
    email: "carlos@demo.com",
    password: "123456",
    phone: "9335551234",
    profession: "Químico Ambiental",
    organization: "Laboratorio Estatal de Análisis",
    createdAt: new Date().toISOString(),
  },
  {
    id: "admin",
    name: "Admin Usuario",
    email: "admin@suelosano.com",
    password: "admin123",
    phone: "9331112233",
    profession: "Administrador del Sistema",
    organization: "Suelo Sano App",
    createdAt: new Date().toISOString(),
  },
];

// Inicializar usuarios de demostración
export const initializeDemoUsers = async () => {
  try {
    const existingUsersJson = await AsyncStorage.getItem(USERS_KEY);
    const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : [];

    // Si no hay usuarios, crear los de demostración
    if (existingUsers.length === 0) {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
      console.log("✅ Usuarios de demostración creados exitosamente");
      return {
        success: true,
        message: "Usuarios de demostración creados",
        users: demoUsers,
      };
    } else {
      // Si ya hay usuarios, verificar si existen los de demo
      const demoEmails = demoUsers.map((u) => u.email);
      const existingEmails = existingUsers.map((u) => u.email);
      const missingDemos = demoUsers.filter(
        (demo) => !existingEmails.includes(demo.email)
      );

      if (missingDemos.length > 0) {
        // Agregar los usuarios demo que faltan
        const updatedUsers = [...existingUsers, ...missingDemos];
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        console.log(
          `✅ ${missingDemos.length} usuarios de demostración agregados`
        );
        return {
          success: true,
          message: `${missingDemos.length} usuarios agregados`,
          users: missingDemos,
        };
      }

      console.log("ℹ️ Los usuarios de demostración ya existen");
      return {
        success: true,
        message: "Los usuarios de demostración ya existen",
        users: [],
      };
    }
  } catch (error) {
    console.error("❌ Error inicializando usuarios de demostración:", error);
    return {
      success: false,
      message: "Error al crear usuarios de demostración",
    };
  }
};

// Obtener lista de usuarios de demostración (para mostrar en pantalla de login)
export const getDemoUsersList = () => {
  return demoUsers.map((user) => ({
    name: user.name,
    email: user.email,
    password: user.password,
  }));
};

// Forzar recreación de usuarios demo (útil para testing)
export const resetDemoUsers = async () => {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
    console.log("✅ Usuarios de demostración restablecidos");
    return { success: true, message: "Usuarios restablecidos" };
  } catch (error) {
    console.error("❌ Error restableciendo usuarios:", error);
    return { success: false, message: "Error al restablecer usuarios" };
  }
};
