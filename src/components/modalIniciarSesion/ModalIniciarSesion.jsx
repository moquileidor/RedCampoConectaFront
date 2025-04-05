import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min";
import ModalRegistrarUsuario from '../modalRegistro/ModalRegistrarse';
import authService from '../../services/authService';
import { FaEnvelope, FaLock } from "react-icons/fa";
import './ModalIniciarSesion.css';

export default function IniciarSesionModal() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializar modales de Bootstrap si está disponible
    const initializeBootstrap = () => {
      if (window.bootstrap && window.bootstrap.Modal) {
        const modalElement = document.getElementById('iniciarSesion');
        if (modalElement) {
          // Solo inicializar si no está ya inicializado
          if (!window.bootstrap.Modal.getInstance(modalElement)) {
            new window.bootstrap.Modal(modalElement);
          }
        }
      }
    };
    
    // Limpiar modales al cargar el componente
    forceCleanupModals();
    
    // Inicializar Bootstrap
    initializeBootstrap();
    
    return () => {
      // Limpiar al desmontar el componente
      forceCleanupModals();
    };
  }, []);

  // Función para forzar la limpieza completa de modales y restaurar el scroll
  const forceCleanupModals = () => {
    // Remover todos los backdrops
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    
    // Restaurar el body a su estado normal
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    // Asegurarse de que no hay ningún estilo inline que bloquee el scroll
    document.body.removeAttribute('style');
    
    // Forzar el desbloqueo del scroll
    document.documentElement.style.overflow = '';
    document.documentElement.style.paddingRight = '';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(username, password);
      
      // Obtener datos del usuario autenticado
      const user = authService.getCurrentUser();
      console.log("Usuario autenticado:", user);

      // Cerrar el modal correctamente y limpiar todos los elementos de modal
      const closeModalAndCleanup = () => {
        // Cerrar el modal de manera adecuada con Bootstrap
        const modal = document.getElementById('iniciarSesion');
        if (modal) {
          const modalInstance = window.bootstrap?.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          } else {
            // Fallback si no existe la instancia
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            modal.removeAttribute('aria-modal');
          }
        }
        
        // Forzar la limpieza completa
        forceCleanupModals();
      };
      
      // Ejecutar la limpieza
      closeModalAndCleanup();
      
      // Forzar el desbloqueo del scroll después de un breve retraso
      for (let i = 1; i <= 5; i++) {
        setTimeout(forceCleanupModals, i * 100);
      }

      
      // Añadir una pequeña espera antes de navegar para asegurar que la limpieza se completa
      setTimeout(() => {
        // Usar window.location para forzar una recarga completa de la página
        window.location.href = '/';
      }, 300);

    } catch (error) {
      console.error("Error en login:", error);
      if (error.response) {
        // El servidor respondió con un código de error
        setError(error.response.data || "Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        setError("No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.");
      } else {
        // Error al configurar la solicitud
        setError("Error al procesar la solicitud. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Estilos para modal personalizado
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1050
  };

  return (
    <>
      <div className="modal fade iniciarSesion" id="iniciarSesion" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Iniciar sesión</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="usernameLogin" className="col-form-label">Correo Electrónico o Usuario:</label>
                  <div className="input-group">
                    <span className="input-icon"><FaEnvelope /></span>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="usernameLogin" 
                      required 
                      placeholder="Ingresa tu correo electrónico o nombre de usuario" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="passwordLogin" className="col-form-label">Contraseña:</label>
                  <div className="input-group">
                    <span className="input-icon"><FaLock /></span>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="passwordLogin" 
                      required 
                      placeholder="Ingresa tu contraseña" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="opcion-registrarse">
                  <p>¿No tienes una cuenta?  
                    <span data-bs-toggle="modal" data-bs-target="#registrarme" className="opcion-de-registro"> Regístrate aquí</span>
                  </p>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-outline-success w-100"
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ModalRegistrarUsuario />
    </>
  );
}
