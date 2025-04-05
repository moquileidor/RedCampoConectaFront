import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../../css/Banner.css';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    image: "/Venecia-1-scaled.jpg",
    title: "Venecia, Antioquia",
    message: "Donde el café nace entre montañas que inspiran.",
  },
  {
    image: "/Venecia-slider2.jpg",
    title: "Café de Venecia",
    message: "Cultivado con amor y tradición.",
  },
  {
    image: "/Puerto-Berrio-1-scaled.jpg",
    title: "Puerto Berrío, Antioquia",
    message: "Donde el río Magdalena se convierte en vida.",
  },
  {
    image: "/Puerto-Berrio-2.jpg",
    title: "Pescado de Puerto Berrío",
    message: "Directo del río a tu mesa.",
  },
  {
    image : "/Puerto-Berrio-cacao2-1.jpg",
    title: "Frutas de Puerto Berrío",
    message: "Sabores tropicales que te harán vibrar.",
  },
  {
    image : "El-Retiro-1.jpg",
    title: "El Retiro, Antioquia",
    message: "Donde la naturaleza y la cultura se encuentran.",
  },
  {
    image : "El-Retiro-2.jpg",
    title: "Tomate de Arbol de El Retiro",
    message: "Frutas frescas y deliciosas.",
  }

];

// Definición rápida de flechas directamente en el archivo
const NextArrow = ({ onClick }) => (
  <div className="custom-arrow next" onClick={onClick}>
    🡺	
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div className="custom-arrow prev" onClick={onClick}>
    🡸
  </div>
);


const LandingSection = () => {
  // Configuración del slider 
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 1000,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  // Estilo para asegurar que el slider esté por debajo de la barra de navegación
  const sliderContainerStyle = {
    position: 'relative',
    zIndex: 1, // Un z-index menor que la barra de navegación
    marginTop: '0',
    clear: 'both', // Para evitar superposiciones
    display: 'block'
  };

  // Estilo para las diapositivas
  const slideStyle = {
    position: 'relative',
    width: '100%',
    height: 'auto'
  };

  return (
    <section className="landing" style={sliderContainerStyle}>
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} style={slideStyle}>
            <div
              className="slide"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                position: 'relative',
                zIndex: 5
              }}
            >
              <div className="overlay">
                <h2>{slide.title}</h2>
                <p>{slide.message}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default LandingSection;
