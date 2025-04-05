import React, { useState } from "react";


export default function ModalRegistroComentario() {
  // Estados para los campos
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState("");
  const [fechaComentario, setFechaComentario] = useState("");
  const [idEmprendimiento, setIdEmprendimiento] = useState("");
  const [idUsuarios, setIdUsuarios] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const comentarioData = {
      comentario,
      fecha_comentario: fechaComentario,
      calificacion: parseInt(calificacion, 10),
      idemprendimiento: parseInt(idEmprendimiento, 10),
      idusuarios: parseInt(idUsuarios, 10),
    };

    try {
      const response = await fetch("http://localhost:8080/comentariosYCalificaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comentarioData),
      });

      if (!response.ok) {
        throw new Error("Error al registrar el comentario");
      }
      const data = await response.json();
      console.log("Comentario registrado exitosamente!", data);
      // Aquí podrías limpiar el formulario o cerrar el modal
    } catch (error) {
      console.error(error);
      console.log("Error en el registro del comentario");
    }
  };

  return (
    <div className="modal fade" id="registrar-comentario" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              Registrar Comentario
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="comentario" className="col-form-label">
                  Comentario:
                </label>
                <textarea
                  className="form-control"
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="calificacion" className="col-form-label">
                  Calificación (1-5):
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="calificacion"
                  min="1"
                  max="5"
                  value={calificacion}
                  onChange={(e) => setCalificacion(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="fechaComentario" className="col-form-label">
                  Fecha del comentario:
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="fechaComentario"
                  value={fechaComentario}
                  onChange={(e) => setFechaComentario(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="idEmprendimiento" className="col-form-label">
                  ID Emprendimiento:
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="idEmprendimiento"
                  value={idEmprendimiento}
                  onChange={(e) => setIdEmprendimiento(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="idUsuarios" className="col-form-label">
                  ID Usuario:
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="idUsuarios"
                  value={idUsuarios}
                  onChange={(e) => setIdUsuarios(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Registrar Comentario
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
