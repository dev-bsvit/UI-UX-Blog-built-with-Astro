import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyCPGe7HUB7xrfEH12gB-Ccgd6anRP140SA",
  authDomain: "enuance-b2f45.firebaseapp.com",
  projectId: "enuance-b2f45",
  storageBucket: "enuance-b2f45.firebasestorage.app",
  messagingSenderId: "374493765632",
  appId: "1:374493765632:web:990f4881850aaa221878e5",
  measurementId: "G-NZ8LEGJRDW"
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
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Ошибка выхода:', error);
    throw error;
  }
}; 