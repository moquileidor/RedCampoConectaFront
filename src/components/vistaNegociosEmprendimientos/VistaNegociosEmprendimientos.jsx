import React, { useState, useEffect } from "react";
import "./VistaNegociosEmprendimientos.css";
import ModalActualizarNegocio from "../modalActualizarNegocio/ModalActualizarNegocio";
import ModalEliminarNegocio from "../modalEliminarNegocio/ModalEliminarNegocio";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min";

export default function VistaNegociosEmprendimientos() {
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [nombre, setNombre] = useState("");
  const [id, setId] = useState(null);
  const [negocioSeleccionado, setNegocioSeleccionado] = useState(null);

  // Abre el modal configurando los datos correspondientes
  const abrirModalEliminar = (tipoEntidad, nombreEntidad, idEntidad) => {
    setTipo(tipoEntidad);
    setNombre(nombreEntidad);
    setId(idEntidad);
    console.log("ID seleccionado para eliminar:", idEntidad);
  };

  // Nueva función para abrir modal de actualizar
  const abrirModalActualizar = (emprendimiento) => {
    // Adaptar el formato del objeto para que coincida con el esperado por ModalActualizarNegocio
    const negocioAdaptado = {
      id: emprendimiento.idemprendimiento,
      nombreEmprendimiento: emprendimiento.nombre,
      descripcion: emprendimiento.descripcion,
      tipo: emprendimiento.tipo,
      fechaCreacion: emprendimiento.fecha_creacion,
      estado: emprendimiento.estado_emprendimiento ? "Activo" : "Inactivo",
      region: emprendimiento.idregiones,
      produccion: emprendimiento.produccionConsumoEnergia,
      consumoEnergia: emprendimiento.produccionConsumoEnergia,
      // Si hay campos adicionales que necesites incluir:
      pais: "",  // Agrega el valor correcto si está disponible
      cantidadNegocios: "",  // Agrega el valor correcto si está disponible
      fechaNacimiento: "", // Agrega el valor correcto si está disponible
    };
    
    setNegocioSeleccionado(negocioAdaptado);
    // Usa setTimeout para asegurar que el DOM está actualizado
    setTimeout(() => {
      const modalElement = document.getElementById("actualizar-negocio");
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }, 100);
  };

  // Obtener datos del backend
  const obtenerEmprendimientos = async () => {
    try {
      const response = await fetch(`http://localhost:8080/emprendimientos`);
      const data = await response.json();
      console.log("Respuesta API:", data);
      setEmprendimientos(data.content || data || []);
    } catch (error) {
      console.error("Error al obtener los emprendimientos:", error);
    }
  };

  // Función para eliminar un negocio
  const eliminarNegocio = async (idNegocio) => {
    if (!idNegocio) {
      console.error("Error: No se ha seleccionado un negocio para eliminar.");
      return;
    }
    try {
      console.log(`Intentando eliminar negocio con ID: ${idNegocio}`);
      const response = await fetch(`http://localhost:8080/emprendimientos/${idNegocio}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log(`Negocio con ID ${idNegocio} eliminado correctamente.`);
        setEmprendimientos(emprendimientos.filter((dato) => dato.idemprendimiento !== idNegocio));
      } else {
        console.error("Error al eliminar el negocio. Verifica el backend.");
      }
    } catch (error) {
      console.error("Error en la petición de eliminación:", error);
    }
  };

  useEffect(() => {
    obtenerEmprendimientos();
    
    // Asegurarnos de que bootstrap esté cargado correctamente
    // Este paso es crucial para resolver el error con .backdrop
    const initBootstrap = () => {
      // Ya importamos bootstrap en la parte superior, solo necesitamos asegurarnos
      // de que esté disponible
      if (typeof bootstrap !== 'undefined') {
        console.log("Bootstrap cargado correctamente");
      } else {
        console.error("Bootstrap no está disponible");
      }
    };
    
    initBootstrap();
  }, []);

  return (
    <>
      <section className="vista-negocios">
        <div className="contenedor">
          <h2>Vista listado negocios</h2>
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Fecha de creación</th>
                <th>Estado</th>
                <th>Imagen</th>
                <th>Ubicación</th>
                <th>Producción/Consumo Energía</th>
                <th>Historial</th>
                <th>Opciones Negocio</th>
              </tr>
            </thead>
            <tbody>
              {emprendimientos.map((emprendimiento, index) => (
                <tr key={emprendimiento.idemprendimiento}>
                  <td>{index + 1}</td>
                  <td>{emprendimiento.nombre}</td>
                  <td>{emprendimiento.descripcion}</td>
                  <td>{emprendimiento.tipo}</td>
                  <td>{emprendimiento.fecha_creacion}</td>
                  <td>{emprendimiento.estado_emprendimiento ? "Activo" : "Inactivo"}</td>
                  <td>
                    <img
                      src={emprendimiento.imagen_emprendimiento ? `data:image/jpeg;base64,${emprendimiento.imagen_emprendimiento}` : "https://via.placeholder.com/200"}
                      alt="Imagen del negocio"
                      width="50"
                      height="50"
                    />
                  </td>
                  <td>{emprendimiento.idregiones}</td>
                  <td>{emprendimiento.produccionConsumoEnergia}</td>
                  <td>{emprendimiento.historial}</td>
                  <td>
                    <div className="opciones-negocios">
                      <div
                        className="actualizar-negocio"
                        onClick={() => abrirModalActualizar(emprendimiento)}
                      >
                        <i className="bi bi-pencil"></i>
                      </div>
                      <div
                        className="eliminar-negocio"
                        onClick={() =>
                          abrirModalEliminar("negocio", emprendimiento.nombre, emprendimiento.idemprendimiento)
                        }
                        data-bs-toggle="modal"
                        data-bs-target="#eliminar-negocio"
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

      <ModalEliminarNegocio 
        tipo={tipo} 
        nombre={nombre} 
        id={id} 
        onEliminar={eliminarNegocio} 
      />

      <ModalActualizarNegocio 
        negocioSeleccionado={negocioSeleccionado} 
        onActualizarExito={obtenerEmprendimientos}
      />
    </>
  );
}