import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "userAuth";
const USERS_KEY = "registeredUsers";

// Registrar un nuevo usuario
export const registerUser = async (userData) => {
  try {
    const { email, password, name } = userData;

    // Validaciones básicas
    if (!email || !password || !name) {
      return {
        success: false,
        message: "Todos los campos son obligatorios",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      };
    }

    // Verificar si el email ya está registrado
    const existingUsers = await getRegisteredUsers();
    const userExists = existingUsers.some((user) => user.email === email);

    if (userExists) {
      return {
        success: false,
        message: "Este correo electrónico ya está registrado",
      };
    }

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // En producción, esto debería estar hasheado
      phone: userData.phone || "",
      profession: userData.profession || "",
      organization: userData.organization || "",
      createdAt: new Date().toISOString(),
    };

    // Guardar usuario
    existingUsers.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(existingUsers));

    return {
      success: true,
      message: "Usuario registrado exitosamente",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        profession: newUser.profession,
        organization: newUser.organization,
      },
    };
  } catch (error) {
    console.error("Error registrando usuario:", error);
    return {
      success: false,
      message: "Error al registrar usuario",
    };
  }
};

// Iniciar sesión
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      return {
        success: false,
        message: "Email y contraseña son obligatorios",
      };
    }

    // Obtener usuarios registrados
    const users = await getRegisteredUsers();

    // Buscar usuario
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return {
        success: false,
        message: "Email o contraseña incorrectos",
      };
    }

    // Guardar sesión
    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      profession: user.profession || "",
      organization: user.organization || "",
      loginAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(session));

    return {
      success: true,
      message: "Inicio de sesión exitoso",
      user: session,
    };
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    return {
      success: false,
      message: "Error al iniciar sesión",
    };
  }
};

// Cerrar sesión
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    return {
      success: true,
      message: "Sesión cerrada exitosamente",
    };
  } catch (error) {
    console.error("Error cerrando sesión:", error);
    return {
      success: false,
      message: "Error al cerrar sesión",
    };
  }
};

// Verificar si hay sesión activa
export const getCurrentUser = async () => {
  try {
    const sessionJson = await AsyncStorage.getItem(AUTH_KEY);
    if (sessionJson) {
      return JSON.parse(sessionJson);
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo usuario actual:", error);
    return null;
  }
};

// Obtener todos los usuarios registrados
const getRegisteredUsers = async () => {
  try {
    const usersJson = await AsyncStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return [];
  }
};

// Actualizar perfil de usuario
export const updateUserProfile = async (userId, updates) => {
  try {
    const users = await getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return {
        success: false,
        message: "Usuario no encontrado",
      };
    }

    // Actualizar usuario
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Actualizar sesión si está activa
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedSession = {
        ...currentUser,
        name: updates.name || currentUser.name,
        email: updates.email || currentUser.email,
        phone: updates.phone !== undefined ? updates.phone : currentUser.phone,
        profession: updates.profession !== undefined ? updates.profession : currentUser.profession,
        organization: updates.organization !== undefined ? updates.organization : currentUser.organization,
      };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedSession));
    }

    return {
      success: true,
      message: "Perfil actualizado exitosamente",
    };
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return {
      success: false,
      message: "Error al actualizar perfil",
    };
  }
};

// Cambiar contraseña
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const users = await getRegisteredUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return {
        success: false,
        message: "Usuario no encontrado",
      };
    }

    if (user.password !== currentPassword) {
      return {
        success: false,
        message: "La contraseña actual es incorrecta",
      };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      };
    }

    // Actualizar contraseña
    const userIndex = users.findIndex((u) => u.id === userId);
    users[userIndex].password = newPassword;
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

    return {
      success: true,
      message: "Contraseña cambiada exitosamente",
    };
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    return {
      success: false,
      message: "Error al cambiar contraseña",
    };
  }
};
