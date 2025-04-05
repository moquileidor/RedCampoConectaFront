// src/pages/NoticiaDetalle.jsx
import { useParams } from 'react-router-dom';
import noticias from '../data/noticiasData';
import { useState } from 'react';

const NoticiaDetalle = () => {
    const { id } = useParams();
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

    if (!noticia) return <p>Noticia no encontrada</p>;

    return (
        <div className="noticia-detalle" style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
            <h1>{noticia.titulo}</h1>
            <img src={noticia.image} alt={noticia.titulo} style={{ width: '100%', marginBottom: 10 }} />
            <p>{noticia.cuerpo}</p>
            <p><strong>Publicado el:</strong> {noticia.fecha}</p>

            <button onClick={() => setLikes(likes + 1)}>👍 Me gusta ({likes})</button>

            <div style={{ marginTop: 30 }}>
                <h3>Comentarios</h3>
                <textarea
                    rows="3"
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    placeholder="Escribe un comentario..."
                    style={{ width: '100%', marginBottom: 10 }}
                />
                <button onClick={agregarComentario}>Comentar</button>

                <ul>
                    {comentarios.map((c, i) => (
                        <li key={i} style={{ marginTop: 10 }}>{c}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default NoticiaDetalle;
