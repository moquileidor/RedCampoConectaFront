import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Crear el contexto de autenticación
export const AuthContext = createContext();

// Componente proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    
    // Escuchar cambios en localStorage para actualizar el estado
    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Función para iniciar sesión
  const login = async (username, password) => {
    try {
      const userData = await authService.login(username, password);
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error('Error en login desde contexto:', error);
      throw error;
    }
  };

  // Función para registrarse
  const register = async (username, password) => {
    try {
      const userData = await authService.register(username, password);
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error('Error en registro desde contexto:', error);
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Valor del contexto que estará disponible para los componentes
  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 