import React, { useState, useEffect } from "react";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min";

export default function ModalActualizarNegocio({ negocioSeleccionado, onActualizarExito }) {
  const [negocioData, setNegocioData] = useState({
    id: "",
    nombreEmprendimiento: "",
    descripcion: "",
    tipo: "",
    fechaCreacion: "",
    estado: "Activo",
    imagen: null,
    region: "",
    produccion: "",
    consumoEnergia: "",
    pais: "",
    cantidadNegocios: "",
    fechaNacimiento: "",
  });

  useEffect(() => {
    if (negocioSeleccionado) {
      setNegocioData({
        ...negocioSeleccionado,
        imagen: null,
        fechaCreacion: negocioSeleccionado.fechaCreacion
          ? negocioSeleccionado.fechaCreacion.split("T")[0]
          : "",
      });
    }
  }, [negocioSeleccionado]);

  const handleChange = (e) => {
    const { id, value, name, type } = e.target;

    if (type === "radio") {
      setNegocioData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      setNegocioData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };

  const handleImageUpload = (e) => {
    setNegocioData((prevData) => ({
      ...prevData,
      imagen: e.target.files[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const estadoBooleano = negocioData.estado === "Activo";

      // Estos nombres deben coincidir exactamente con los nombres de los atributos 
      // del modelo Emprendimiento en el backend
      formData.append("idemprendimiento", negocioData.id);
      formData.append("nombre", negocioData.nombreEmprendimiento);
      formData.append("descripcion", negocioData.descripcion);
      formData.append("tipo", negocioData.tipo);
      
      if (negocioData.fechaCreacion) {
        formData.append("fecha_creacion", negocioData.fechaCreacion);
      }
      
      formData.append("estado_emprendimiento", estadoBooleano);
      formData.append("idregiones", negocioData.region);
      formData.append("idusuarios", 1); // ID del usuario actual
      
      // La imagen debe enviarse con el nombre "imagen", no "imagen_emprendimiento"
      if (negocioData.imagen) {
        formData.append("imagen", negocioData.imagen);
      }
      
      // Para depuración - mostrar lo que estamos enviando
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      const response = await fetch(`http://localhost:8080/emprendimientos/${negocioData.id}/actualizar`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        alert("Negocio actualizado correctamente");
        if (onActualizarExito) onActualizarExito();
  
        const modalElement = document.getElementById("actualizar-negocio");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
      } else {
        const errorText = await response.text();
        console.error("Respuesta del backend:", errorText);
        alert("Error al actualizar el negocio");
      }
    } catch (error) {
      console.error("Error al actualizar el negocio:", error);
      alert("Hubo un problema con la actualización");
    }
  };
  

  return (
    <div className="modal fade" id="actualizar-negocio" tabIndex="-1" aria-labelledby="modalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="modalLabel">Actualizar Negocio/Emprendimiento</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombreEmprendimiento" className="col-form-label">Nombre Negocio:</label>
                <input type="text" className="form-control" id="nombreEmprendimiento" value={negocioData.nombreEmprendimiento || ""} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="descripcion" className="col-form-label">Descripción:</label>
                <textarea className="form-control" id="descripcion" value={negocioData.descripcion || ""} onChange={handleChange} required></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="tipo" className="col-form-label">Tipo:</label>
                <input type="text" className="form-control" id="tipo" value={negocioData.tipo || ""} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label htmlFor="fechaCreacion" className="col-form-label">Fecha de Creación:</label>
                <input type="date" className="form-control" id="fechaCreacion" value={negocioData.fechaCreacion || ""} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="col-form-label">Estado:</label>
                <div>
                  <input type="radio" id="estadoActivo" name="estado" value="Activo" checked={negocioData.estado === "Activo"} onChange={handleChange} />
                  <label htmlFor="estadoActivo" className="ms-2">Activo</label>
                </div>
                <div>
                  <input type="radio" id="estadoInactivo" name="estado" value="Inactivo" checked={negocioData.estado === "Inactivo"} onChange={handleChange} />
                  <label htmlFor="estadoInactivo" className="ms-2">Inactivo</label>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="imagen" className="col-form-label">Imagen:</label>
                <input type="file" className="form-control" id="imagen-upload" onChange={handleImageUpload} />
              </div>
              <div className="mb-3">
                <label htmlFor="region" className="col-form-label">Región:</label>
                <input type="text" className="form-control" id="region" value={negocioData.region || ""} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary w-100">Actualizar Negocio</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
