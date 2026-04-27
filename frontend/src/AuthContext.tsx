import { createContext, useContext, useState, type ReactNode } from 'react';
import { clearToken as clearStoredToken, getToken, setToken as storeToken } from './lib/auth';

interface AuthContextValue {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  isAuthed: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken);

  const setToken = (t: string) => {
    storeToken(t);
    setTokenState(t);
  };

  const clearToken = () => {
    clearStoredToken();
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, clearToken, isAuthed: token !== null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
