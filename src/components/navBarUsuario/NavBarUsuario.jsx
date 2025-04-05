import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import logoUsuario from '../../assets/usuarioLogo.png';
import authService from '../../services/authService';
import UsuarioInfoModal from '../modalInfoUsuario/ModalInfoUsuario';

export default function NavBarUsuario() {
  const [userData, setUserData] = useState(null);
  const [datosPersonales, setDatosPersonales] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener datos del usuario autenticado
    const user = authService.getCurrentUser();
    if (user) {
      setUserData(user);
    }

    // También intentamos obtener datos personales si existen
    const storedDatosPersonales = localStorage.getItem('datosPersonales');
    if (storedDatosPersonales && storedDatosPersonales !== 'null') {
      try {
        setDatosPersonales(JSON.parse(storedDatosPersonales));
      } catch (error) {
        console.error("Error al parsear datos personales:", error);
      }
    }
    
    // Asegurarse de que bootstrap esté inicializado correctamente
    initBootstrapComponents();
    
    // Limpiar cualquier modal backdrop que pueda haber quedado
    cleanupModals();
    
    // Asegurarse de que no haya más problemas con el scroll
    document.documentElement.style.overflow = '';
    document.documentElement.style.paddingRight = '';
  }, []);
  
  // Función para inicializar componentes Bootstrap
  const initBootstrapComponents = () => {
    if (window.bootstrap && window.bootstrap.Dropdown) {
      const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
      [...dropdownElementList].map(dropdownToggleEl => new window.bootstrap.Dropdown(dropdownToggleEl));
    } else {
      // Si bootstrap no está listo, intentar de nuevo en 100ms
      setTimeout(initBootstrapComponents, 100);
    }
  };
  
  // Función para limpiar modales
  const cleanupModals = () => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    document.body.removeAttribute('style');
  };

  const handleLogout = () => {
    // Primero limpiamos cualquier modal
    cleanupModals();
    
    // Cerrar sesión
    authService.logout();
    
    // Forzar una recarga completa de la página para actualizar el estado
    window.location.href = '/';
  };

  // Función para navegar sin perder la sesión
  const handleNavigation = (e, path) => {
    e.preventDefault();
    
    // Limpiar cualquier modal backdrop antes de navegar
    cleanupModals();
    
    // Navegar a la ruta especificada
    navigate(path);
  };

  // Determinar qué nombre mostrar
  const displayName = datosPersonales?.nombre_completo || userData?.username || 'Usuario';
  
  // Verificar si el usuario tiene rol de administrador
  const isAdmin = userData?.rol === "ROLE_ADMIN";

  // Estilo específico para la barra
  const navbarStyle = {
    backgroundColor: '#6BB190',
    width: '100%',
    display: 'block',
    position: 'relative',
    zIndex: 1000,
    marginBottom: '0',
    padding: '10px 0'
  };

  return (
    <>
      <nav className="navbar navbar-campo-conecta" style={navbarStyle}>
        <div className="container-fluid contenedor-info-nav">
          <a 
            className="navbar-brand navbar-cc-principal" 
            href="/"
            onClick={(e) => handleNavigation(e, '/')}
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff' }}
          >
            <img
              src={logo}
              alt="Logo"
              width="80"
              height="80"
              className="d-inline-block align-text-top"
            />
            <p className="nombre-campo-conecta" style={{ margin: '0 0 0 10px', fontSize: '28px', fontWeight: '700' }}>Campo Conecta</p>
          </a>

          <div className="d-flex align-items-center" style={{ flexWrap: 'nowrap' }}>
            {/* Menú de navegación para usuario autenticado */}
            <div className="me-3">
              <a 
                href="/" 
                className="nav-link"
                onClick={(e) => handleNavigation(e, '/')}
              >
                Inicio
              </a>
            </div>
            <div className="me-3">
              <a 
                href="/marketplace" 
                className="nav-link"
                onClick={(e) => handleNavigation(e, '/marketplace')}
              >
                Marketplace
              </a>
            </div>
            <div className="me-3">
              <a 
                href="/perfil" 
                className="nav-link"
                onClick={(e) => handleNavigation(e, '/perfil')}
              >
                Mi Perfil
              </a>
            </div>
            
            {/* Enlace a Estadísticas */}
            <div className="me-3">
              <a 
                href="/estadisticas-energia" 
                className="nav-link"
                onClick={(e) => handleNavigation(e, '/estadisticas-energia')}
              >
                Estadísticas
              </a>
            </div>
            
            {/* Enlace a Admin solo para usuarios con rol de administrador */}
            {isAdmin && (
              <div className="me-3">
                <a 
                  href="/admin" 
                  className="nav-link"
                  onClick={(e) => handleNavigation(e, '/admin')}
                >
                  Administración
                </a>
              </div>
            )}
            
            {/* Botón de cerrar sesión siempre visible */}
            <div className="me-3">
              <button 
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm"
              >
                Cerrar Sesión
              </button>
            </div>
            
            {/* Información del usuario */}
            <div className="dropdown">
              <button
                className="btn dropdown-toggle"
                type="button"
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ backgroundColor: 'transparent', border: 'none', color: '#fff' }}
              >
                <div 
                  className="contenedor-informacion-usuario-nav"
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column-reverse', 
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <p className="nombre-usuario-campo-conecta" style={{ margin: '5px 0 0 0', textAlign: 'center' }}>
                    Bienvenido {displayName}
                  </p>
                  <img
                    src={datosPersonales?.imagen ? 
                      (typeof datosPersonales.imagen === 'string' ? 
                        `data:image/jpeg;base64,${datosPersonales.imagen}` : 
                        URL.createObjectURL(new Blob([datosPersonales.imagen], {type: 'image/jpeg'}))
                      ) : logoUsuario}
                    alt="Foto Usuario"
                    width="40"
                    height="40"
                    className="d-inline-block align-text-top imagen-usuario-cc"
                    onError={(e) => {
                      e.target.src = logoUsuario;
                      console.error("Error al cargar la imagen de usuario, usando predeterminada");
                    }}
                  />
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                <li>
                  <button 
                    className="dropdown-item" 
                    data-bs-toggle="modal" 
                    data-bs-target="#informacionUsuario"
                  >
                    Ver perfil
                  </button>
                </li>
                {isAdmin && (
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={(e) => handleNavigation(e, '/admin')}
                    >
                      Panel de administración
                    </button>
                  </li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <UsuarioInfoModal userId={userData?.idUsuario || null} />
    </>
  );
}
