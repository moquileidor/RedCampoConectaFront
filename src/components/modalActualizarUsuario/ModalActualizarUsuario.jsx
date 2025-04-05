import React, { useEffect, useState } from "react";
import { Alert } from 'react-bootstrap';
import authService from "../../services/authService";
import { FaUser, FaIdCard, FaMapMarkerAlt, FaPhone, FaImage, FaEnvelope, FaLock, FaFileAlt } from "react-icons/fa";
import './ModalActualizarUsuario.css';

export default function ModalActualizarUsuario({ usuarioSeleccionado, onUpdate }) {
  // Estado para mostrar mensajes
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  // Estado para almacenar el ID de usuario
  const [userId, setUserId] = useState(null);
  // Inicializamos el estado con dos identificadores:
  // - idUsuario: para actualizar el endpoint de /usuarios
  // - idDatos: para actualizar el endpoint de /datosPersonales
  const [userData, setUserData] = useState({
    idUsuario: "",
    idDatos: "",
    nombreCompleto: "",
    cedula: "",
    tipoDocumento: "",
    direccion: "",
    telefono: "",
    imagen: null,
    email: "",
    password: "",
  });

  // Cuando cambia el usuarioSeleccionado, actualizamos el estado
  useEffect(() => {
    // Declarar idUsuario al nivel del useEffect
    let idUsuario = null;
    
    if (usuarioSeleccionado) {
      console.log("Usuario seleccionado en modal:", usuarioSeleccionado);
      
      // Determinar el ID de usuario de manera confiable
      if (usuarioSeleccionado.idUsuario) {
        idUsuario = usuarioSeleccionado.idUsuario;
      } else if (usuarioSeleccionado.idusuarios) {
        idUsuario = usuarioSeleccionado.idusuarios;
      } else if (usuarioSeleccionado.id) {
        idUsuario = usuarioSeleccionado.id;
      }
      
      // Convertir a número si es posible
      if (idUsuario) {
        const idInt = parseInt(idUsuario, 10);
        if (!isNaN(idInt)) {
          idUsuario = idInt;
        }
      }
      
      console.log("ID de usuario determinado directo:", idUsuario);
    }
    
    // Si no hay ID en usuarioSeleccionado, intentar obtenerlo del localStorage
    if (!idUsuario) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          idUsuario = user.idUsuario || user.idusuarios || user.id;
          console.log("ID de usuario obtenido de localStorage:", idUsuario);
        }
      } catch (e) {
        console.error("Error al obtener ID de usuario de localStorage:", e);
      }
    }
    
    if (!idUsuario) {
      console.error("No se pudo determinar el ID de usuario:", usuarioSeleccionado);
      setMensaje({
        texto: "Error: No se pudo determinar el ID de usuario. Por favor, recargue la página.",
        tipo: "danger"
      });
    } else {
      console.log("ID de usuario final determinado:", idUsuario);
      setUserId(idUsuario);
    }
    
    // Verificar que usuarioSeleccionado no sea null antes de acceder a sus propiedades
    if (usuarioSeleccionado) {
      setUserData({
        idUsuario: idUsuario,
        idDatos: usuarioSeleccionado.iddatospersonales || "",
        nombreCompleto: usuarioSeleccionado.nombre_completo || "",
        cedula: usuarioSeleccionado.cedula || "",
        tipoDocumento: usuarioSeleccionado.idtipodocumento || "1", // Valor por defecto
        direccion: usuarioSeleccionado.direccion || "",
        telefono: usuarioSeleccionado.telefono || "",
        imagen: null, // Siempre inicializamos en null para la carga nueva
        email: usuarioSeleccionado.emailUser || usuarioSeleccionado.email || "",
        password: usuarioSeleccionado.password_user || usuarioSeleccionado.password || "",
      });
    } else {
      // Si no hay usuarioSeleccionado, inicializar con valores vacíos
      console.log("No hay usuario seleccionado, inicializando con valores vacíos");
      setUserData({
        idUsuario: idUsuario,
        idDatos: "",
        nombreCompleto: "",
        cedula: "",
        tipoDocumento: "1",
        direccion: "",
        telefono: "",
        imagen: null,
        email: "",
        password: "",
      });
    }
  }, [usuarioSeleccionado]);

  // Manejo de cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    setUserData((prevData) => ({
      ...prevData,
      imagen: e.target.files[0],
    }));
  };

  // Envío del formulario para actualizar los datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Limpiamos mensajes previos
      setMensaje({ texto: '', tipo: '' });
      
      // Comprobar si es una actualización o una creación nueva
      const esCreacionNueva = !userData.idDatos; 
      
      // Verificar que tenemos un ID de usuario válido
      if (!userId) {
        setMensaje({
          texto: "Error: ID de usuario no válido",
          tipo: "danger"
        });
        return;
      }
      
      if (esCreacionNueva) {
        console.log("Creando nuevos datos personales para el usuario con ID:", userId);
        
        // Crear formData con todos los campos
        const formData = new FormData();
        formData.append("nombre_completo", userData.nombreCompleto);
        formData.append("cedula", userData.cedula);
        formData.append("direccion", userData.direccion);
        formData.append("telefono", userData.telefono);
        formData.append("idtipodocumento", userData.tipoDocumento || "1");
        formData.append("idusuarios", userId.toString());
        if (userData.imagen) formData.append("imagen", userData.imagen);

        console.log("Enviando formData para creación:", Object.fromEntries(formData));

        try {
          // Mostrar en la consola los datos enviados
          for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
          }
          
          const datosResponse = await fetch("http://localhost:8080/datosPersonales", {
            method: "POST",
            body: formData
          });

          console.log("Respuesta del servidor:", datosResponse);

          if (!datosResponse.ok) {
            const errorText = await datosResponse.text();
            console.error("Error en la respuesta:", datosResponse.status, errorText);
            throw new Error(`Error creando datos personales: ${datosResponse.status} ${errorText}`);
          }

          const datosNuevos = await datosResponse.json();
          console.log("Datos personales creados:", datosNuevos);
          
          setMensaje({
            texto: "Perfil completado correctamente",
            tipo: "success"
          });
          
          // Actualizar localStorage con los nuevos datos
          localStorage.setItem('datosPersonales', JSON.stringify(datosNuevos));
          
          // Si proporcionaron un callback de actualización, llamarlo
          if (typeof onUpdate === 'function') {
            setTimeout(() => {
              onUpdate();
              cerrarModal();
            }, 1500);
          } else {
            setTimeout(cerrarModal, 1500);
          }
          
          return;
        } catch (error) {
          console.error("Error en la petición de creación:", error);
          setMensaje({
            texto: `Error al crear datos personales: ${error.message}`,
            tipo: "danger"
          });
          return;
        }
      }
      
      // Actualizar datos de usuario (correo, contraseña, estado) en el endpoint /usuarios
      try {
        console.log("Actualizando usuario:", userId);
        const usuarioData = {
          emailUser: userData.email,
          password_user: userData.password,
          estado_user: true,
        };
        console.log("Datos para actualizar usuario:", usuarioData);
        
        const usuarioResponse = await fetch(
          `http://localhost:8080/usuarios/${userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(usuarioData),
          }
        );

        if (!usuarioResponse.ok) {
          const errorText = await usuarioResponse.text();
          console.error("Error en la respuesta de usuarios:", usuarioResponse.status, errorText);
          throw new Error(`Error actualizando usuario: ${usuarioResponse.status} ${errorText}`);
        }

        console.log("Usuario actualizado correctamente");
      } catch (error) {
        console.error("Error en la petición de actualización de usuario:", error);
        setMensaje({
          texto: `Error al actualizar usuario: ${error.message}`,
          tipo: "warning"
        });
        // Continuamos para intentar actualizar los datos personales
      }

      // Actualizar datos personales en el endpoint /datosPersonales
      try {
        console.log("Actualizando datos personales:", userData.idDatos, "para usuario ID:", userId);
        
        // Crear formData con todos los campos
        const formData = new FormData();
        formData.append("nombre_completo", userData.nombreCompleto);
        formData.append("cedula", userData.cedula);
        formData.append("direccion", userData.direccion);
        formData.append("telefono", userData.telefono);
        formData.append("idtipodocumento", userData.tipoDocumento || "1");
        formData.append("idusuarios", userId.toString());
        if (userData.imagen) formData.append("imagen", userData.imagen);
        
        // Mostrar en la consola los datos enviados
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }
        
        const datosResponse = await fetch(
          `http://localhost:8080/datosPersonales/${userData.idDatos}`,
          {
            method: "PUT",
            body: formData
          }
        );

        if (!datosResponse.ok) {
          const errorText = await datosResponse.text();
          console.error("Error en la respuesta de datos personales:", datosResponse.status, errorText);
          throw new Error(`Error actualizando datos personales: ${datosResponse.status} ${errorText}`);
        }

        const datosActualizados = await datosResponse.json();
        console.log("Datos personales actualizados correctamente:", datosActualizados);
        
        // Actualizar localStorage con los nuevos datos
        localStorage.setItem('datosPersonales', JSON.stringify(datosActualizados));
        
        setMensaje({
          texto: "Datos actualizados correctamente",
          tipo: "success"
        });
        
        // Si proporcionaron un callback de actualización, llamarlo
        if (typeof onUpdate === 'function') {
          setTimeout(() => {
            onUpdate();
            cerrarModal();
          }, 1500);
        } else {
          setTimeout(cerrarModal, 1500);
        }
        
      } catch (error) {
        console.error("Error en la petición de actualización de datos personales:", error);
        setMensaje({
          texto: `Error al actualizar datos personales: ${error.message}`,
          tipo: "danger"
        });
      }
    } catch (error) {
      console.error("Error general al actualizar los datos:", error);
      setMensaje({
        texto: `Error al procesar la operación: ${error.message}`,
        tipo: "danger"
      });
    }
  };

  const cerrarModal = () => {
    // Cerrar el modal usando Bootstrap
    const modal = document.getElementById('actualizar-info-usuario');
    if (modal && window.bootstrap && window.bootstrap.Modal) {
      const modalInstance = window.bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  };

  return (
    <div 
      className="modal fade actualizar-usuario-modal" 
      id="actualizar-info-usuario" 
      tabIndex="-1" 
      aria-labelledby="exampleModalLabel" 
      aria-hidden="true"
      style={{zIndex: 10000}}
    >
      <div className="modal-dialog modal-dialog-scrollable" style={{position: 'relative', zIndex: 10001}}>
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              {userData.idDatos ? "Actualizar Información" : "Completar Perfil"}
            </h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {!userId && (
              <Alert variant="warning" className="mb-3">
                No se pudo determinar el ID de usuario. Por favor, recargue la página.
              </Alert>
            )}
            
            {mensaje.texto && (
              <Alert variant={mensaje.tipo} className="mb-3">
                {mensaje.texto}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombreCompleto" className="col-form-label">
                  Nombre Completo:
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <FaUser />
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    id="nombreCompleto"
                    name="nombreCompleto"
                    value={userData.nombreCompleto}
                    onChange={handleChange}
                    placeholder="Ingresa tu nombre completo"
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="cedula" className="col-form-label">
                  Cédula:
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <FaIdCard />
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    id="cedula"
                    name="cedula"
                    value={userData.cedula}
                    onChange={handleChange}
                    placeholder="Ingresa tu número de documento"
                    readOnly={userData.idDatos ? true : false}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="direccion" className="col-form-label">
                  Dirección:
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    id="direccion"
                    name="direccion"
                    value={userData.direccion}
                    onChange={handleChange}
                    placeholder="Ingresa tu dirección"
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="telefono_admin" className="col-form-label">
                  Teléfono:
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <FaPhone />
                  </div>
                  <input
                    type="tel"
                    className="form-control"
                    id="telefono_admin"
                    name="telefono"
                    value={userData.telefono}
                    onChange={handleChange}
                    placeholder="Ingresa tu número telefónico"
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="imagen_admin" className="col-form-label">
                  Imagen:
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <FaImage />
                  </div>
                  <input
                    type="file"
                    className="form-control"
                    id="imagen_admin"
                    name="imagen"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="email_admin" className="col-form-label">
                  Correo Electrónico:
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    className="form-control"
                    id="email_admin"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="Ingresa tu correo electrónico"
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="password_admin" className="col-form-label">
                  Contraseña:
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    className="form-control"
                    id="password_admin"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    placeholder="Ingresa tu contraseña"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="tipo_documento_admin" className="col-form-label">
                  Tipo de Documento:
                </label>
                <div className="input-group">
                  <div className="input-icon">
                    <FaFileAlt />
                  </div>
                  <select
                    className="form-select"
                    id="tipo_documento_admin"
                    name="tipoDocumento"
                    value={userData.tipoDocumento || "1"}
                    onChange={handleChange}
                    required
                  >
                    <option value="1">Cédula de Ciudadanía</option>
                    <option value="2">Tarjeta de Identidad</option>
                    <option value="3">Pasaporte</option>
                    <option value="4">Cédula de Extranjería</option>
                  </select>
                </div>
              </div>
              <div className="d-grid">
                <button 
                  type="submit" 
                  className="btn btn-actualizar"
                  disabled={!userId}
                >
                  {userData.idDatos ? "Actualizar Perfil" : "Guardar Perfil"}
                </button>
              </div>
            </form>
            
            <div className="mt-3 text-center">
              <small className="text-muted">
                * Todos los campos son obligatorios excepto la imagen
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
