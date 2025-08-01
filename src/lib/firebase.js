import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Firebase конфигурация с переменными окружения
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCPGe7HUB7xrfEH12gB-Ccgd6anRP140SA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "enuance-b2f45.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "enuance-b2f45",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "enuance-b2f45.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "374493765632",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:374493765632:web:990f4881850aaa221878e5",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NZ8LEGJRDW"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Функция для входа через Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    throw error;
  }
};

// Функция для выхода
export const signOutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Ошибка выхода:', error);
    throw error;
  }
};

// Для обратной совместимости
export const logOut = signOutGoogle; 