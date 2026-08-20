import React, { useState, useEffect } from "react";
import "./VistaComentariosYCalificaciones.css";
import api from '../../services/api';

export default function VistaComentariosYCalificaciones({ idEmprendimiento, idUsuario }) {
  const [comentarios, setComentarios] = useState([]);
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState(1);

  // Obtener los comentarios del backend
  const obtenerComentarios = async () => {
    try {
      const { data } = await api.get('/comentariosYCalificaciones');
      setComentarios(data || []);
    } catch {
      // sin comentarios disponibles
    }
  };

  const agregarComentario = async (e) => {
    e.preventDefault();

    const nuevoComentario = {
      comentario,
      calificacion,
      fecha_comentario: new Date().toISOString(),
      idemprendimiento: idEmprendimiento,
      idusuarios: idUsuario,
    };

    try {
      await api.post('/comentariosYCalificaciones', nuevoComentario);
      setComentario('');
      setCalificacion(1);
      obtenerComentarios();
    } catch {
      // error al agregar comentario
    }
  };

  useEffect(() => {
    obtenerComentarios();
  }, []);

  return (
    <section className="vista-comentarios">
      <div className="contenedor">
        <h2>Comentarios y Calificaciones</h2>

        {/* Formulario para agregar comentarios */}
      

        {/* Tabla de comentarios */}
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Usuario</th>
              <th>Comentario</th>
              <th>Calificación</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {comentarios.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>Usuario {item.idusuarios}</td>
                <td>{item.comentario}</td>
                <td>{item.calificacion} ⭐</td>
                <td>{new Date(item.fecha_comentario).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
