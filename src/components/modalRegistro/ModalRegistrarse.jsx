import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaHome, FaPhone, FaFileImage } from "react-icons/fa";
import authService from '../../services/authService';
import axios from 'axios';
import './ModalRegistrarse.css';

export default function RegistrarmeModal() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idTipoUsuario] = useState(2);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [cedula, setCedula] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    setImagen(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Paso 1: Registrar al usuario
      const userData = await authService.register(username, password);

      // Obtener el ID del usuario recién registrado
      const userId = userData.idUsuario || userData.idusuarios;
      console.log("Usuario registrado con ID:", userId);

      // Paso 2: Crear datos personales si se proporcionaron campos opcionales
      if (userId && (nombreCompleto || cedula || direccion || telefono || tipoDocumento || imagen)) {
        console.log("Intentando guardar datos personales para el usuario ID:", userId);
        
        const formData = new FormData();
        formData.append("nombre_completo", nombreCompleto || "");
        formData.append("cedula", cedula || "");
        formData.append("direccion", direccion || "");
        formData.append("telefono", telefono || "");
        formData.append("idusuarios", userId);
        formData.append("idtipodocumento", tipoDocumento || "4"); // Valor por defecto: Cédula de Ciudadanía
        
        if (imagen) {
          formData.append("imagen", imagen);
        }

        try {
          const token = authService.getToken();
          const datosResponse = await axios.post("http://localhost:8080/datosPersonales", formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log("Datos personales guardados correctamente:", datosResponse.data);
          localStorage.setItem('datosPersonales', JSON.stringify(datosResponse.data));
        } catch (datosError) {
          console.error("Error al guardar datos personales:", datosError);
          // Continuamos con el proceso aunque falle el guardado de datos personales
        }
      }

      // Cerrar el modal y limpiar correctamente
      const modal = document.getElementById('registrarme');
      if (modal) {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
        
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';
      }

      console.log("Usuario registrado:", userData);

      navigate("/usuario");
      alert("¡Registro exitoso! Bienvenido a la plataforma.");
    } catch (error) {
      console.error("Error en el registro:", error);
      setError(error.response?.data?.message || "Error al registrar usuario. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar el modal correctamente
  const closeModal = () => {
    const modal = document.getElementById('registrarme');
    if (modal) {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      document.body.style.paddingRight = '';
      document.body.style.overflow = '';
    }
  };

  return (
    <div className="modal fade registro-modal" id="registrarme" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" style={{zIndex: 10000, paddingRight: 0}}>
      <div className="modal-dialog modal-dialog-scrollable" style={{position: 'relative', zIndex: 10001}}>
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">Registro</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={closeModal}></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <h5>Datos de Usuario</h5>

              <div className="mb-3">
                <label className="col-form-label">Nombre de Usuario:</label>
                <div className="input-group">
                  <div className="input-icon"><FaUser /></div>
                  <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Nombre de Usuario"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="col-form-label">Correo Electrónico:</label>
                <div className="input-group">
                  <div className="input-icon"><FaEnvelope /></div>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Correo Electrónico"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="col-form-label">Contraseña:</label>
                <div className="input-group">
                  <div className="input-icon"><FaLock /></div>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Contraseña"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="col-form-label">Confirmar Contraseña:</label>
                <div className="input-group">
                  <div className="input-icon"><FaLock /></div>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirmar Contraseña"
                  />
                </div>
              </div>

              <h5>Datos Personales (Opcional)</h5>
              <p className="text-muted small">Podrás completar esta información más tarde en tu perfil</p>

              <div className="mb-3">
                <label className="col-form-label">Nombre Completo:</label>
                <div className="input-group">
                  <div className="input-icon"><FaUser /></div>
                  <input
                    type="text"
                    className="form-control"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Nombre Completo"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="col-form-label">Cédula:</label>
                <div className="input-group">
                  <div className="input-icon"><FaIdCard /></div>
                  <input
                    type="text"
                    className="form-control"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Cédula"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="col-form-label">Dirección:</label>
                <div className="input-group">
                  <div className="input-icon"><FaHome /></div>
                  <input
                    type="text"
                    className="form-control"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Dirección"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="col-form-label">Teléfono:</label>
                <div className="input-group">
                  <div className="input-icon"><FaPhone /></div>
                  <input
                    type="text"
                    className="form-control"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Teléfono"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="col-form-label">Tipo de Documento:</label>
                <div className="input-group">
                  <div className="input-icon"><FaIdCard /></div>
                  <select
                    className="form-control"
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value)}
                  >
                    <option value="">Seleccione un tipo de documento</option>
                    <option value="1">Nacido Vivo</option>
                    <option value="2">Registro Civil</option>
                    <option value="3">Tarjeta de Identidad</option>
                    <option value="4">Cédula de Ciudadanía</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="col-form-label">Imagen (opcional):</label>
                <div className="input-group">
                  <div className="input-icon"><FaFileImage /></div>
                  <input type="file" className="form-control" onChange={handleImageUpload} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
