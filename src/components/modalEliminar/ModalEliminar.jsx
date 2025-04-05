import React from "react";

export default function ModalEliminar({ tipo, nombre, onEliminar }) {
  return (
    <>
      <div
        className="modal fade"
        id="eliminar"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="eliminarLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="eliminarLabel">
                Eliminar {tipo}
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que deseas eliminar {tipo} llamado "{nombre}"?</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onEliminar();
                  document.getElementById("eliminar").classList.remove("show");
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
    </>
  );
}