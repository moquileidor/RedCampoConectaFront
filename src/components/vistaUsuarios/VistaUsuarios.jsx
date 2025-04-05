import React, { useState, useEffect } from "react";
import './VistaUsuarios.css';
import ModalEliminar from '../modalEliminar/ModalEliminar';
import ModalActualizarUsuario from '../modalActualizarUsuario/ModalActualizarUsuario';

export default function VistaUsuarios() {
  // Estado para la lista de datos personales
  const [datosPersonales, setDatosPersonales] = useState([]);
  const [tipo, setTipo] = useState(""); // Para el modal
  const [nombre, setNombre] = useState(""); // Para el modal
  const [id, setId] = useState(null); // Para el modal
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); // Para el modal de actualización

  // Función para abrir el modal
  const abrirModal = (tipoEntidad, nombreEntidad, idEntidad) => {
    setTipo(tipoEntidad);
    setNombre(nombreEntidad);
    setId(idEntidad);
    
    // Buscamos el usuario completo, no solo por el ID de datos personales
    const datosPersonalesUsuario = datosPersonales.find(dato => dato.iddatospersonales === idEntidad);
    
    if (datosPersonalesUsuario) {
      // Asegurarnos de que todos los datos necesarios estén presentes
      console.log("Datos personales encontrados:", datosPersonalesUsuario);
      
      // Si falta idusuarios, obtenemos ese dato desde la API
      if (!datosPersonalesUsuario.idusuarios) {
        console.error("El usuario seleccionado no tiene ID de usuario asociado");
      }
      
      // Crear una copia completa del objeto para evitar referencias circulares
      const usuarioCompleto = {
        ...datosPersonalesUsuario,
        idUsuario: datosPersonalesUsuario.idusuarios, // Aseguramos que este campo exista
        iddatospersonales: idEntidad
      };
      
      console.log("Usuario completo para el modal:", usuarioCompleto);
      setUsuarioSeleccionado(usuarioCompleto);
    } else {
      console.error("No se encontraron datos personales para el ID:", idEntidad);
      setUsuarioSeleccionado(null);
    }
  };


  
  // Función para obtener datos desde el endpoint de datos personales
  const obtenerDatosPersonales = async () => {
    try {
      const response = await fetch(`http://localhost:8080/datosPersonales`);
      const data = await response.json();
      setDatosPersonales(data);
    } catch (error) {
      console.error("Error al obtener los datos personales:", error);
    }
  };
 // Función para eliminar un usuario
const eliminarUsuario = async () => {
    if (!id) return;
  
    try {
      const response = await fetch(`http://localhost:8080/datosPersonales/${id}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        console.log(`Usuario con ID ${id} eliminado correctamente.`);
        setDatosPersonales(datosPersonales.filter(dato => dato.iddatospersonales !== id));
      } else {
        console.error("Error al eliminar el usuario");
      }
    } catch (error) {
      console.error("Error en la petición de eliminación:", error);
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