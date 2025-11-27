import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

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

    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Guardar datos adicionales en Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      phone: userData.phone || "",
      profession: userData.profession || "",
      organization: userData.organization || "",
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Usuario registrado exitosamente",
      user: {
        id: user.uid,
        name,
        email,
        phone: userData.phone || "",
        profession: userData.profession || "",
        organization: userData.organization || "",
      },
    };
  } catch (error) {
    console.error("Error registrando usuario:", error);

    let message = "Error al registrar usuario";
    if (error.code === 'auth/email-already-in-use') {
      message = "Este correo electrónico ya está registrado";
    } else if (error.code === 'auth/invalid-email') {
      message = "Correo electrónico inválido";
    } else if (error.code === 'auth/weak-password') {
      message = "La contraseña es muy débil";
    }

    return {
      success: false,
      message,
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

    // Autenticar con Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Obtener datos adicionales de Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      return {
        success: false,
        message: "Datos de usuario no encontrados",
      };
    }

    const userData = userDoc.data();

    return {
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user.uid,
        name: userData.name,
        email: user.email,
        phone: userData.phone || "",
        profession: userData.profession || "",
        organization: userData.organization || "",
      },
    };
  } catch (error) {
    console.error("Error iniciando sesión:", error);

    let message = "Error al iniciar sesión";
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      message = "Email o contraseña incorrectos";
    } else if (error.code === 'auth/invalid-email') {
      message = "Correo electrónico inválido";
    } else if (error.code === 'auth/too-many-requests') {
      message = "Demasiados intentos fallidos. Intenta más tarde";
    }

    return {
      success: false,
      message,
    };
  }
};

// Cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
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
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();

      if (user) {
        // Obtener datos adicionales de Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            resolve({
              id: user.uid,
              name: userData.name,
              email: user.email,
              phone: userData.phone || "",
              profession: userData.profession || "",
              organization: userData.organization || "",
            });
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error("Error obteniendo datos de usuario:", error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// Actualizar perfil de usuario
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);

    // Actualizar en Firestore
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: "Perfil actualizado exitosamente",
    };
  } catch (error) {
    console.error("Error actualizando perfil:", error);

    let message = "Error al actualizar perfil";
    if (error.code === 'not-found') {
      message = "Usuario no encontrado";
    }

    return {
      success: false,
      message,
    };
  }
};

// Cambiar contraseña
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        message: "Usuario no autenticado",
      };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      };
    }

    // Re-autenticar al usuario con la contraseña actual
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    try {
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      return {
        success: false,
        message: "La contraseña actual es incorrecta",
      };
    }

    // Actualizar contraseña
    await updatePassword(user, newPassword);

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
