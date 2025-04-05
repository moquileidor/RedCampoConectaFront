import React from 'react';
import ImagenPersona from '../assets/persona.jpg'


export default function NosotrosPage() {
    return (
        <section className="informacion-equipo-de-trabajo">
            <div className="contenedor contenedor-info-equipo">
                <div className="descripcion-introduccion">
                    <h3>Sobre nosotros</h3>
                    <p>"Hola, somos Isabela, Jorge, Salomón y Brayan, un grupo de jóvenes que coincidimos en esta emocionante aventura de Talento Tech. Estamos aquí para dar lo mejor de nosotros y trabajar con dedicación en este gran proyecto, poniendo en práctica nuestras habilidades y valores. Juntos, buscamos alcanzar la excelencia y reflejar lo mejor de cada uno en equipo.</p>
                </div>
                <div className='contenedor-cards-nosotros'>
                    <div className="card" style={{ width: "288px" }}>
                        <img src={ImagenPersona} className="card-img-top" alt="..." />
                        <div className="card-body">
                            <h5 className="card-title">Isabela Grisales</h5>
                            <p className="card-text">
                                Some quick example text to build on the card title and make up the bulk of the card's content.
                            </p>
                        </div>
                    </div>

                    <div className="card" style={{ width: "288px" }}>
                        <img src={ImagenPersona} className="card-img-top" alt="..." />
                        <div className="card-body">
                            <h5 className="card-title">Jorge Alvarado</h5>
                            <p className="card-text">
                                Some quick example text to build on the card title and make up the bulk of the card's content.
                            </p>
                        </div>
                    </div>

                    <div className="card" style={{ width: "288px" }}>
                        <img src={ImagenPersona} className="card-img-top" alt="..." />
                        <div className="card-body">
                            <h5 className="card-title">Salomon Giraldo</h5>
                            <p className="card-text">
                                Some quick example text to build on the card title and make up the bulk of the card's content.
                            </p>
                        </div>
                    </div>

                    <div className="card" style={{ width: "288px" }}>
                        <img src={ImagenPersona} className="card-img-top" alt="..." />
                        <div className="card-body">
                            <h5 className="card-title">Brayan Murillo</h5>
                            <p className="card-text">
                                Some quick example text to build on the card title and make up the bulk of the card's content.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}