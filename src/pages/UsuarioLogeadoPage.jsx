import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBarUsuario from "../components/navBarUsuario/NavBarUsuario";
import Banner from "../components/banner/Banner";
import Graficas from "../components/graficasProductos/GraficasProductos";
import Footer from "../components/footer/Footer";
import authService from "../services/authService";

export default function UsuarioLogeadoPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticación usando el servicio
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsLoggedIn(authenticated);
      
      // Si no está autenticado, redirigir a la página principal
      if (!authenticated) {
        navigate('/');
      }
    };
    
    checkAuth();
    
    // Volver a verificar cuando el localStorage cambie
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [navigate]);

  if (!isLoggedIn) {
    return null; // No renderizar nada mientras se redirige
  }

  return (
    <>
      <NavBarUsuario />
      <Banner />
      <Footer />
    </>
  );
}
