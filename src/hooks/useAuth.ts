import { useLocalStorage } from './useLocalStorage';
import { AuthState, UserProfile } from '../types';

const MASTER_PIN = '20062026';
const AUTH_STORAGE_KEY = 'gamenight_filipe_duda_auth';

export function useAuth() {
  const [auth, setAuth] = useLocalStorage<AuthState>(AUTH_STORAGE_KEY, {
    user: null,
    isAuthenticated: false,
  });

  const login = (user: UserProfile, pin: string): { success: boolean; error?: string } => {
    if (pin.trim() !== MASTER_PIN) {
      return { success: false, error: 'Senha incorreta! Tente novamente.' };
    }

    setAuth({
      user,
      isAuthenticated: true,
    });

    return { success: true };
  };

  const logout = () => {
    setAuth({
      user: null,
      isAuthenticated: false,
    });
  };

  const switchUser = (newUser: UserProfile) => {
    setAuth((prev) => ({
      ...prev,
      user: newUser,
    }));
  };

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    login,
    logout,
    switchUser,
  };
}
