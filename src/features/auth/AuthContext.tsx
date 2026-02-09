'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

import { auth } from '@/lib/firebase/config'; 

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1. Слушатель авторизации
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });

    // 2. Таймер безопасности (2 секунды)
    // Если Firebase тупит (медленный интернет), принудительно показываем приложение
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading((isLoading) => {
          if (isLoading) {
            console.warn("Auth check timed out - forcing render");
            return false;
          }
          return isLoading;
        });
      }
    }, 2000);

    return () => {
      mounted = false;
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCredential.user) {
        await updateProfile(userCredential.user, {
            displayName: name,
            photoURL: `https://api.dicebear.com/9.x/micah/svg?seed=${name}` 
        });
        setUser({ ...userCredential.user, displayName: name });
    }
  };

  // === ИСПРАВЛЕННАЯ ФУНКЦИЯ ВЫХОДА ===
  const logout = async () => {
    try {
      setLoading(true); // 1. Блокируем UI
      await signOut(auth); // 2. Ждем Firebase
      setUser(null); // 3. МГНОВЕННО удаляем пользователя из стейта
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false); // 4. Разблокируем UI
      // Опционально: перезагрузка страницы для полной очистки кэша
      // window.location.reload(); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, loginWithEmail, registerWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);