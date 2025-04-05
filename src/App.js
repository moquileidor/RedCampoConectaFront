import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import AddProduct from "./pages/AddProduct";
import Admin from "./pages/VistaAdminPage";
import UsuarioLogeadoPage from "./pages/UsuarioLogeadoPage";
import PerfilUsuarioPage from "./pages/PerfilUsuarioPage";
import SobreNosotros from './pages/NosotrosPage'
import GraficasDatos from './pages/GraficasDatos'
import GraficasDatosEnergia from './pages/GraficasDatosEnergia'
import RegistroProduccionConsumo from './pages/RegistroProduccionConsumo'
import RegistroEmprendimientoPage from './pages/RegistroEmprendimientoPage'
import authService from './services/authService';

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';

// Ejemplo si el archivo está en src/components
import NoticiaDetalle from './pages/NoticiaDetalle';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = !!currentUser;
  
  // Si no está autenticado, redirigir a la página de inicio
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Si se requiere un rol específico y el usuario no lo tiene, redirigir a la página de usuario
  if (requiredRole && currentUser.rol !== requiredRole) {
    return <Navigate to="/usuario" replace />;
  }
  
  // Si está autenticado y tiene el rol requerido (o no se requiere rol), mostrar el contenido
  return children;
};

// Componente para eliminar cualquier modal backdrop al cargar
function ModalBackdropCleaner() {
  useEffect(() => {
    // Función para eliminar cualquier backdrop de modal y restaurar el scroll
    const removeModalBackdrop = () => {
      // Eliminar todos los backdrops
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      
      // Restaurar el body a su estado normal
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Asegurarse de que no hay ningún estilo inline que bloquee el scroll
      document.body.removeAttribute('style');
      
      // Forzar el desbloqueo del scroll
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
    };
    
    // Ejecutar inmediatamente y también configurar un temporizador para asegurarse
    removeModalBackdrop();
    const timer = setTimeout(removeModalBackdrop, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return null;
}

// Componente para forzar scroll al inicio en cambios de ruta
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Cuando cambia la ruta, hacer scroll al inicio
    window.scrollTo(0, 0);
    
    // También asegurarse de que el scroll esté habilitado
    const enableScroll = () => {
      // Eliminar todos los backdrops
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      
      // Restaurar el body a su estado normal
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Asegurarse de que no hay ningún estilo inline que bloquee el scroll
      document.body.removeAttribute('style');
      
      // Forzar el desbloqueo del scroll
      document.documentElement.style.overflow = '';
      document.documentElement.style.paddingRight = '';
    };
    
    // Ejecutar varias veces para asegurar que se aplique
    enableScroll();
    setTimeout(enableScroll, 100);
    setTimeout(enableScroll, 300);
    setTimeout(enableScroll, 500);
  }, [pathname]);
  
  return null;
}

// Crear un tema personalizado con colores hexadecimales en lugar de variables CSS
const theme = createTheme({
  palette: {
    primary: {
      main: '#6BB190', // Color primario, antes era var(--color-primary)
      light: '#8EC3A7', // Color primario claro
      dark: '#4A9074', // Color primario oscuro
    },
    secondary: {
      main: '#4A6B59', // Color secundario, antes era var(--color-secondary)
    },
    error: {
      main: '#DC3545', // Color de error, antes era var(--color-error)
    },
    warning: {
      main: '#FFC107', // Color de advertencia, antes era var(--color-warning)
    },
    info: {
      main: '#17A2B8', // Color de información, antes era var(--color-info)
    },
    success: {
      main: '#28A745', // Color de éxito, antes era var(--color-success)
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif', // Antes era var(--font-primary)
    h1: { fontFamily: '"Revalia", sans-serif' }, // Antes era var(--font-title)
    h2: { fontFamily: '"Revalia", sans-serif' },
    h3: { fontFamily: '"Revalia", sans-serif' },
    h4: { fontFamily: '"Revalia", sans-serif' },
    h5: { fontFamily: '"Revalia", sans-serif' },
    h6: { fontFamily: '"Revalia", sans-serif' },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
          borderRadius: '0.5rem',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  },
});

//En esta parate es donde contrala la vista de las paginas 
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    // Verificar autenticación al cargar la app
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsLoggedIn(authenticated);
    };
    
    checkAuth();
    
    // Volver a verificar cuando el localStorage cambie
    window.addEventListener('storage', checkAuth);
    
    // Limpiar cualquier modal backdrop al iniciar
    const cleanupModals = () => {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.removeAttribute('style');
    };
    
    // Ejecutar inmediatamente y después de un pequeño retraso
    cleanupModals();
    setTimeout(cleanupModals, 300);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-container">
        <AuthProvider>
          <ModalBackdropCleaner />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
            <Route path="/Marketplace" element={<MarketplacePage />} />
            
            <Route 
              path="/add-product" 
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="ROLE_ADMIN">
                  <Admin />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/usuario" 
              element={
                <ProtectedRoute>
                  <UsuarioLogeadoPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/perfil" 
              element={
                <ProtectedRoute>
                  <PerfilUsuarioPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/graficas" 
              element={
                <ProtectedRoute>
                  <GraficasDatos />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/noticia/:id" element={<NoticiaDetalle />} />
            
            <Route 
              path="/estadisticas-energia" 
              element={
                <ProtectedRoute>
                  <GraficasDatosEnergia />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/registro-produccion-consumo" 
              element={
                <ProtectedRoute>
                  <RegistroProduccionConsumo />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/registro-emprendimiento" 
              element={
                <ProtectedRoute>
                  <RegistroEmprendimientoPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </Box>
    </ThemeProvider>
  );
}

export default App;
