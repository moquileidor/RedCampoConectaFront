import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { cleanupBootstrapModals } from './utils/modalCleanup';

// Lazy loading — solo se descarga la página cuando el usuario la visita
const HomePage              = lazy(() => import('./pages/HomePage'));
const MarketplacePage       = lazy(() => import('./pages/MarketplacePage'));
const AddProduct            = lazy(() => import('./pages/AddProduct'));
const Admin                 = lazy(() => import('./pages/VistaAdminPage'));
const UsuarioLogeadoPage    = lazy(() => import('./pages/UsuarioLogeadoPage'));
const PerfilUsuarioPage     = lazy(() => import('./pages/PerfilUsuarioPage'));
const SobreNosotros         = lazy(() => import('./pages/NosotrosPage'));
const GraficasDatos         = lazy(() => import('./pages/GraficasDatos'));
const GraficasDatosEnergia  = lazy(() => import('./pages/GraficasDatosEnergia'));
const RegistroProduccionConsumo    = lazy(() => import('./pages/RegistroProduccionConsumo'));
const RegistroEmprendimientoPage   = lazy(() => import('./pages/RegistroEmprendimientoPage'));
const NoticiaDetalle        = lazy(() => import('./pages/NoticiaDetalle'));

const theme = createTheme({
  palette: {
    primary:   { main: '#6BB190', light: '#8EC3A7', dark: '#4A9074' },
    secondary: { main: '#4A6B59' },
    error:     { main: '#DC3545' },
    warning:   { main: '#FFC107' },
    info:      { main: '#17A2B8' },
    success:   { main: '#28A745' },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
    h1: { fontFamily: '"Revalia", sans-serif' },
    h2: { fontFamily: '"Revalia", sans-serif' },
    h3: { fontFamily: '"Revalia", sans-serif' },
    h4: { fontFamily: '"Revalia", sans-serif' },
    h5: { fontFamily: '"Revalia", sans-serif' },
    h6: { fontFamily: '"Revalia", sans-serif' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
          borderRadius: '0.5rem',
          transition: 'box-shadow 0.3s ease',
          '&:hover': { boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
        },
      },
    },
  },
});

// Redirige a "/" si no hay sesión; a "/usuario" si el rol no coincide
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <CircularProgress sx={{ display: 'block', m: 'auto', mt: 8 }} />;
  if (!currentUser) return <Navigate to="/" replace />;
  if (requiredRole && currentUser.rol !== requiredRole) return <Navigate to="/usuario" replace />;

  return children;
};

// Limpia backdrops de Bootstrap y hace scroll al inicio en cada cambio de ruta
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    cleanupBootstrapModals();
  }, [pathname]);

  return null;
}

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress color="primary" />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-container">
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"               element={<HomePage />} />
            <Route path="/marketplace"    element={<MarketplacePage />} />
            <Route path="/sobre-nosotros" element={<SobreNosotros />} />
            <Route path="/noticia/:id"    element={<NoticiaDetalle />} />

            <Route path="/add-product" element={
              <ProtectedRoute><AddProduct /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="ROLE_ADMIN"><Admin /></ProtectedRoute>
            } />
            <Route path="/usuario" element={
              <ProtectedRoute><UsuarioLogeadoPage /></ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute><PerfilUsuarioPage /></ProtectedRoute>
            } />
            <Route path="/graficas" element={
              <ProtectedRoute><GraficasDatos /></ProtectedRoute>
            } />
            <Route path="/estadisticas-energia" element={
              <ProtectedRoute><GraficasDatosEnergia /></ProtectedRoute>
            } />
            <Route path="/registro-produccion-consumo" element={
              <ProtectedRoute><RegistroProduccionConsumo /></ProtectedRoute>
            } />
            <Route path="/registro-emprendimiento" element={
              <ProtectedRoute><RegistroEmprendimientoPage /></ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </Box>
    </ThemeProvider>
  );
}

export default App;
