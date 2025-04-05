import React from 'react';
import NavBarUsuario from "../components/navBarUsuario/NavBarUsuario";
import VistaUsuariosAdmin from "../components/vistaUsuarios/VistaUsuarios";
import VistaComentariosYCalificaciones from "../components/vistaComentariosYCalificaciones/vistaComentariosYCalificaciones";
import VistaNegociosAdmin from "../components/vistaNegociosEmprendimientos/VistaNegociosEmprendimientos";

export default function VistaAdmin() {
  return (
    <>
      <NavBarUsuario />
      <div className="container mt-4">
        <h1 className="mb-4">Panel de Administración</h1>
        
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h2 className="h5 mb-0">Gestión de Usuarios</h2>
              </div>
              <div className="card-body">
                <VistaUsuariosAdmin />
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h2 className="h5 mb-0">Gestión de Negocios/Emprendimientos</h2>
              </div>
              <div className="card-body">
                <VistaNegociosAdmin />
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <h2 className="h5 mb-0">Gestión de Comentarios y Calificaciones</h2>
              </div>
              <div className="card-body">
                <VistaComentariosYCalificaciones />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
