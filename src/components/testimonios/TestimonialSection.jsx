import React from "react";
import "../../css/TestimonialSection.css";

const TestimonialSection = () => {
  const testimonios = [
    {
      nombre: "Ana Torres",
      texto: "Campo Conecta transformó mi negocio rural.",
    },
    {
      nombre: "Luis Herrera",
      texto: "Ahora tengo acceso a más clientes y herramientas.",
    },
  ];

  return (
    <section className="testimonios">
      <div className="contenedor">      
        <h2>Testimonios</h2>
        <div className="contenedor-testimonios">
          {testimonios.map((t, i) => (
            <div key={i}>
              <blockquote>“{t.texto}”</blockquote>
              <p>- {t.nombre}</p>
            </div>
          ))}
        </div></div>
    </section>
  );
};

export default TestimonialSection;
