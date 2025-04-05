import React, { useEffect, useState } from "react";

export default function ModalEliminarNegocio({ tipo, nombre, id, onEliminar }) {
  // Estado local para asegurarse de usar el ID actualizado
  const [localId, setLocalId] = useState(id);

  useEffect(() => {
    setLocalId(id);
  }, [id]);

  useEffect(() => {
    const modalElement = document.getElementById("eliminar-negocio");

    const handleShow = () => {
      modalElement.removeAttribute("aria-hidden");
      modalElement.style.display = "block";
    };

    const handleHide = () => {
      modalElement.setAttribute("aria-hidden", "true");
      modalElement.style.display = "none";
    };

    modalElement.addEventListener("shown.bs.modal", handleShow);
    modalElement.addEventListener("hidden.bs.modal", handleHide);

    return () => {
      modalElement.removeEventListener("shown.bs.modal", handleShow);
      modalElement.removeEventListener("hidden.bs.modal", handleHide);
    };
  }, []);

  return (
    <div
      className="modal fade"
      id="eliminar-negocio"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="eliminarLabel"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="eliminarLabel">
              Eliminar {tipo}
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>
              ¿Estás seguro de que deseas eliminar {tipo} llamado "{nombre}"?
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"

              onClick={() => {
                onEliminar(localId);
                document.getElementById("eliminar-negocio").classList.remove("show");
                document.body.classList.remove("modal-open");
              }}
              
              data-bs-dismiss="modal"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
