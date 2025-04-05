// src/components/NewsFeed.jsx
import React from 'react';
import './NewsFeed.css';
import { Link } from 'react-router-dom';
import noticias from '../../data/noticiasData';
import './NewsFeed.css'




// src/components/NewsFeed.jsx


const NewsFeed = () => {
    return (
   <section className='seccion-noticias'>
       <div className="contenedor">
          <div className="news-grid">
            {noticias.map((noticia) => (
                <div key={noticia.id} className="news-card">
                    <img src={noticia.image} alt={noticia.titulo} className="news-image" />
                    <div className="news-content">
                        <div className="news-date">Publicado el: {noticia.fecha}</div>
                        <h3 className="news-title">{noticia.titulo}</h3>
                        <p className="news-description">{noticia.contenido}</p>
                        <Link to={`/noticia/${noticia.id}`} target='_blank' className="news-link">Ver más</Link>
                    </div>
                </div>
            ))}
        </div>
      </div>
   </section>
    );
};

export default NewsFeed;


