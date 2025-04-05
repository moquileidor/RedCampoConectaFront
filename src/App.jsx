import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Cookies from "js-cookie";
import AdminUserInfo from "./components/adminPanel/AdminUserinfo";
import GraficasDatos from "./pages/GraficasDatos";
import HomePage from "./pages/HomePage";
import PerfilUsuarioPage from "./pages/PerfilUsuarioPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GraficasDatosEnergia from "./pages/GraficasDatosEnergia";
import RegistroProduccionConsumo from "./pages/RegistroProduccionConsumo";
import MarketplacePage from "./pages/MarketplacePage";
import VistaUsuarios from "./pages/VistaUsuarios";
import authService from './services/authService';

// Componente para rutas protegidas que requieren autenticación
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  
  // Si requiere ser admin y el usuario no es admin, redirigir a inicio
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  // Si requiere autenticación y no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Si pasa todas las validaciones, mostrar el componente hijo
  return children;
};

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rutas protegidas para usuarios autenticados */}
      <Route path="/perfil" element={
        <ProtectedRoute>
          <PerfilUsuarioPage />
        </ProtectedRoute>
      } />
      
      <Route path="/estadisticas-energia" element={
        <ProtectedRoute>
          <GraficasDatosEnergia />
        </ProtectedRoute>
      } />
      
      <Route path="/registro-produccion-consumo" element={
        <ProtectedRoute>
          <RegistroProduccionConsumo />
        </ProtectedRoute>
      } />
      
      <Route path="/marketplace" element={
        <ProtectedRoute>
          <MarketplacePage />
        </ProtectedRoute>
      } />
      
      {/* Rutas para administradores */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly={true}>
          <AdminPage />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/usuarios" element={
        <ProtectedRoute adminOnly={true}>
          <VistaUsuarios />
        </ProtectedRoute>
      } />
      
      <Route path="/AdminUserInfo" element={
        <ProtectedRoute adminOnly={true}>
          <AdminUserInfo />
        </ProtectedRoute>
      } />
      
      <Route path="/graficas" element={
        <ProtectedRoute>
          <GraficasDatos />
        </ProtectedRoute>
      } />
      
      {/* Ruta para manejar páginas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; 