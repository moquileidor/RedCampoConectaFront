import React from 'react';
import NavBar from '../components/navBar/Navbar';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';
import Banner from '../components/banner/Banner';
import FooterPage from '../components/footer/Footer';
import ContentSection from '../components/cardsDescubre/ContentSection';
import TestimonialSection from '../components/testimonios/TestimonialSection';
import AboutSection from '../components/AboutSection/AboutSection';
import NewsFeed from '../components/nuevasnoticias/NewsFeed';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="HomePage">
      {isAuthenticated ? <NavBarUsuario /> : <NavBar />}
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
