import React, { useState, useEffect } from "react";
import './VistaUsuarios.css';
import ModalEliminar from '../modalEliminar/ModalEliminar';
import ModalActualizarUsuario from '../modalActualizarUsuario/ModalActualizarUsuario';
import api from '../../services/api';

export default function VistaUsuarios() {
  // Estado para la lista de datos personales
  const [datosPersonales, setDatosPersonales] = useState([]);
  const [tipo, setTipo] = useState(""); // Para el modal
  const [nombre, setNombre] = useState(""); // Para el modal
  const [id, setId] = useState(null); // Para el modal
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); // Para el modal de actualización

  const abrirModal = (tipoEntidad, nombreEntidad, idEntidad) => {
    setTipo(tipoEntidad);
    setNombre(nombreEntidad);
    setId(idEntidad);

    const datosPersonalesUsuario = datosPersonales.find((dato) => dato.iddatospersonales === idEntidad);
    if (datosPersonalesUsuario) {
      setUsuarioSeleccionado({
        ...datosPersonalesUsuario,
        idUsuario: datosPersonalesUsuario.idusuarios,
        iddatospersonales: idEntidad,
      });
    } else {
      setUsuarioSeleccionado(null);
    }
  };


  
  const obtenerDatosPersonales = async () => {
    try {
      const { data } = await api.get('/datosPersonales');
      setDatosPersonales(data);
    } catch {
      // error al obtener datos personales
    }
  };

  const eliminarUsuario = async () => {
    if (!id) return;
    try {
      await api.delete(`/datosPersonales/${id}`);
      setDatosPersonales((prev) => prev.filter((dato) => dato.iddatospersonales !== id));
    } catch {
      // error al eliminar
    }
  };
  


  // Llamar a la API al cargar el componente
  useEffect(() => {
    obtenerDatosPersonales();
  }, []);

  return (
    <>
      <section className="vista-usuarios">
        <div className="contenedor">
          <h2>Vista listado de usuarios</h2>
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre Completo</th>
                <th>Cédula</th>
                <th>Dirección</th>
                <th>Imagen</th>
                <th>Teléfono</th>
                <th>Opciones</th>
              </tr>
            </thead>
            <tbody>
              {datosPersonales.map((dato, index) => (
                <tr key={dato.iddatospersonales}>
                  <td>{index + 1}</td>
                  <td>{dato.nombre_completo}</td>
                  <td>{dato.cedula}</td>
                  <td>{dato.direccion}</td>
                  <td>
                    {dato.imagen ? (
                      <img
                        src={`data:image/jpeg;base64,${dato.imagen}`}
                        alt="Imagen de usuario"
                        width="50"
                        height="50"
                      />
                    ) : (
                      "Sin imagen"
                    )}
                  </td>
                  <td>{dato.telefono}</td>
                  <td>
                   
                  <div  className="opciones-usuario">

                  <div
  className="actualizar"
  data-bs-toggle="modal"
  data-bs-target="#actualizar-info-usuario"
  onClick={() =>
    abrirModal("usuario", dato.nombre_completo, dato.iddatospersonales)
  }
>
  <i className="bi bi-pencil"></i>
</div>

                    <div
                      className="eliminar-usuario"
                      data-bs-toggle="modal"
                      data-bs-target="#eliminar"
                      onClick={() =>
                        abrirModal("usuario", dato.nombre_completo, dato.iddatospersonales)
                      }
                    >
                      <i className="bi bi-trash"></i>
                    </div>
                  </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal para eliminar */}
      <ModalEliminar
  tipo={tipo}
  nombre={nombre}
  onEliminar={eliminarUsuario}
/>


      {/* Modal para actualizar */}
      <ModalActualizarUsuario usuarioSeleccionado={usuarioSeleccionado} />



    </>
  );
}