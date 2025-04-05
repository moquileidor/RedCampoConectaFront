import React, { useState } from "react";

export default function ModalRegistroNegocio() {
  // Estados para los campos principales
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("");
  const [fechaCreacion, setFechaCreacion] = useState("");
  const [estado, setEstado] = useState("");
  const [imagen, setImagen] = useState(null);
  const [region, setRegion] = useState("");

  // Supongamos que el usuario ya está logueado y tenemos su id (esto lo puedes obtener del contexto o de un auth provider)
  const idusuarios = 1; // Ejemplo

  const handleImageUpload = (e) => {
    setImagen(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Creamos un FormData para enviar datos mixtos (texto y archivo)
    const formData = new FormData();
    formData.append("nombre", nombreNegocio);
    formData.append("descripcion", descripcion);
    formData.append("tipo", tipo);
    formData.append("fecha_creacion", fechaCreacion);
    formData.append("estado_emprendimiento", estado);
    if (imagen) formData.append("imagen_emprendimiento", imagen);
    formData.append("idregiones", region);
    formData.append("idusuarios", idusuarios);

    try {
      const response = await fetch("http://localhost:8080/emprendimientos", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al registrar el negocio");
      }
      const data = await response.json();
      console.log("Negocio registrado exitosamente!", data);
      // Aquí podrías limpiar el formulario o cerrar el modal
    } catch (error) {
      console.error(error);
      console.log("Error en el registro del negocio");
    }
  };

  return (
    <div
      className="modal fade"
      id="registrar-mi-negocio"
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              Registrar Negocio/Emprendimiento
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombreNegocio" className="col-form-label">
                  Nombre Negocio/Emprendimiento:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombreNegocio"
                  value={nombreNegocio}
                  onChange={(e) => setNombreNegocio(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="col-form-label">
                  Descripción:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="tipo" className="col-form-label">
                  Tipo:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="fechaCreacion" className="col-form-label">
                  Fecha de creación:
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="fechaCreacion"
                  value={fechaCreacion}
                  onChange={(e) => setFechaCreacion(e.target.value)}
                  required
                  max="2025-12-31"
                />
              </div>
              <div className="mb-3">
                <label className="col-form-label">Estado:</label>
                <div>
                  <input
                    type="radio"
                    id="negocioActivo"
                    name="estado"
                    value="Activo"
                    checked={estado === "Activo"}
                    onChange={(e) => setEstado(e.target.value)}
                    required
                  />
                  <label htmlFor="negocioActivo">Activo</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="negocioInactivo"
                    name="estado"
                    value="Inactivo"
                    checked={estado === "Inactivo"}
                    onChange={(e) => setEstado(e.target.value)}
                    required
                  />
                  <label htmlFor="negocioInactivo">Inactivo</label>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="imagenNegocio" className="col-form-label">
                  Imagen:
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="imagenNegocio"
                  onChange={handleImageUpload}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="region" className="col-form-label">
                  Región (ID):
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Registrar Negocio
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
