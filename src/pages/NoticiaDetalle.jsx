import { useParams, useNavigate } from 'react-router-dom';
import noticias from '../data/noticiasData';
import { useState } from 'react';
import './NoticiaDetalle.css';

const NoticiaDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const noticia = noticias.find(n => n.id === id);

    const [likes, setLikes] = useState(0);
    const [comentarios, setComentarios] = useState([]);
    const [nuevoComentario, setNuevoComentario] = useState("");

    const agregarComentario = () => {
        if (nuevoComentario.trim() !== "") {
            setComentarios([...comentarios, nuevoComentario]);
            setNuevoComentario("");
        }
    };

    if (!noticia) return <p className="mensaje-error">Noticia no encontrada</p>;

    return (
        <div className="noticia-detalle">
            <button className="btn-volver" onClick={() => navigate('/')}>⬅️ Volver al inicio</button>
            
            <h1 className="noticia-titulo">{noticia.titulo}</h1>
            <img src={noticia.image} alt={noticia.titulo} className="noticia-imagen" />
            <p className="noticia-cuerpo">{noticia.cuerpo}</p>
            <p className="noticia-fecha"><strong>Publicado el:</strong> {noticia.fecha}</p>
            
            <button className="btn-like" onClick={() => setLikes(likes + 1)}>👍 Me gusta ({likes})</button>
            
            <div className="comentarios">
                <h3>Comentarios</h3>
                <textarea
                    rows="3"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe un comentario..."
                />
                <button className="btn-comentar" onClick={agregarComentario}>Comentar</button>
                
                <ul className="lista-comentarios">
                    {comentarios.map((c, i) => (
                        <li key={i} className="comentario">{c}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default NoticiaDetalle;
