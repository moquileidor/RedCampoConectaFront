import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        setCurrentUser(authService.getCurrentUser());
      } catch {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Sesión expirada por el interceptor de api.js
    const handleExpired = () => setCurrentUser(null);
    // Cambio de localStorage en otra pestaña
    const handleStorage = () => loadUser();

    window.addEventListener('auth:expired', handleExpired);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('auth:expired', handleExpired);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const userData = await authService.login(username, password);
    setCurrentUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (username, password) => {
    const userData = await authService.register(username, password);
    setCurrentUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
  }, []);

  const value = useMemo(() => ({
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  }), [currentUser, loading, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
