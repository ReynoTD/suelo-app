import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANTE: Reemplaza estos valores con tu configuración de Firebase
// Ve a Firebase Console > Configuración del proyecto > Tus apps > Configuración
const firebaseConfig = {
  apiKey: "AIzaSyCQiIERT25JbSfycj6C5zxCZUxUjyiqnmw",
  authDomain: "suelo-sano.firebaseapp.com",
  projectId: "suelo-sano",
  storageBucket: "suelo-sano.firebasestorage.app",
  messagingSenderId: "207249757092",
  appId: "1:207249757092:web:f0568d70030f640f702731",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
