import React, { useState, useEffect } from "react";
import NavBar from "../components/navBar/Navbar";
import NavBarUsuario from "../components/navBarUsuario/NavBarUsuario";
import Banner from "../components/banner/Banner";
import FooterPage from "../components/footer/Footer";
import ContentSection from "../components/cardsDescubre/ContentSection";
import TestimonialSection from "../components/testimonios/TestimonialSection";
import authService from "../services/authService";
import AboutSection from "../components/AboutSection/AboutSection";
import NewsFeed from "../components/nuevasnoticias/NewsFeed";




const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Limpiar cualquier backdrop al cargar
    const cleanupModals = () => {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.removeAttribute('style');
    };
    
    cleanupModals();
    
    // Verificar autenticación usando el servicio
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsLoggedIn(authenticated);
      setLoading(false);
    };
    
    checkAuth();
    
    // Volver a verificar cuando el localStorage cambie
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      cleanupModals();
    };
  }, []);

  // Forzar la renderización con ambos componentes disponibles
  return (
    <div className="HomePage">
      {/* Mostramos la barra correspondiente */}
      {loading ? (
        // Mientras se carga, mostrar una barra temporal
        <div style={{ backgroundColor: '#6BB190', padding: '10px 0' }}>
          <div className="container">
            <h3>Campo Conecta</h3>
          </div>
        </div>
      ) : (
        isLoggedIn ? <NavBarUsuario /> : <NavBar />
      )}

      {/* Carrusel y contenido */}
      <Banner />

      <ContentSection
        title="¿Qué es Campo Conecta?"
        text="Una red social comunitaria que conecta personas, productos y tradiciones del campo colombiano."
        showButton={false}
      />

      <AboutSection />

      <NewsFeed />
      

      <TestimonialSection
        title="Testimonios"
        text="Esto es un testimonio real de nuestros usuarios satisfechos."
        showButton={false}
      />

      <FooterPage />
    </div>
  );
};

export default HomePage;
