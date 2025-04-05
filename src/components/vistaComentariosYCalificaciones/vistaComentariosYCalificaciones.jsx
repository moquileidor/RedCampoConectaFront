import React, { useState, useEffect } from "react";
import "./VistaComentariosYCalificaciones.css";

export default function VistaComentariosYCalificaciones({ idEmprendimiento, idUsuario }) {
  const [comentarios, setComentarios] = useState([]);
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState(1);

  // Obtener los comentarios del backend
  const obtenerComentarios = async () => {
    try {
      const response = await fetch(`http://localhost:8080/comentariosYCalificaciones`);
      const data = await response.json();
      console.log("Comentarios recibidos:", data);
      setComentarios(data || []);
    } catch (error) {
      console.error("Error al obtener los comentarios:", error);
    }
  };

  // Agregar un nuevo comentario
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
      const response = await fetch(`http://localhost:8080/comentariosYCalificaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoComentario),
      });

      if (response.ok) {
        setComentario("");
        setCalificacion(1);
        obtenerComentarios(); // Recargar la lista
      } else {
        console.error("Error al agregar comentario");
      }
    } catch (error) {
      console.error("Error en la petición:", error);
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
