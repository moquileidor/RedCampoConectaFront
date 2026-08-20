import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import logoUsuario from '../../assets/usuarioLogo.png';
import UsuarioInfoModal from '../modalInfoUsuario/ModalInfoUsuario';
import { useAuth } from '../../contexts/AuthContext';
import { cleanupBootstrapModals } from '../../utils/modalCleanup';

export default function NavBarUsuario() {
  const { currentUser, logout } = useAuth();
  const [datosPersonales, setDatosPersonales] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedDatos = localStorage.getItem('datosPersonales');
    if (storedDatos && storedDatos !== 'null') {
      try {
        setDatosPersonales(JSON.parse(storedDatos));
      } catch {
        // datos personales corruptos — ignorar
      }
    }

    initBootstrapComponents(0);
    cleanupBootstrapModals();
    document.documentElement.style.paddingRight = '';
  }, []);

  const initBootstrapComponents = (attempts) => {
    if (attempts >= 10) return;
    if (window.bootstrap?.Dropdown) {
      document.querySelectorAll('.dropdown-toggle').forEach(
        (el) => new window.bootstrap.Dropdown(el)
      );
    } else {
      setTimeout(() => initBootstrapComponents(attempts + 1), 100);
    }
  };

  const handleLogout = () => {
    cleanupBootstrapModals();
    logout();
    navigate('/');
  };

  const handleNavigation = (e, path) => {
    e.preventDefault();
    cleanupBootstrapModals();
    navigate(path);
  };

  const displayName = datosPersonales?.nombre_completo || currentUser?.username || 'Usuario';
  const isAdmin = currentUser?.rol === 'ROLE_ADMIN';

  const navbarStyle = {
    backgroundColor: '#6BB190',
    width: '100%',
    display: 'block',
    position: 'relative',
    zIndex: 1000,
    marginBottom: '0',
    padding: '10px 0',
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
            <img src={logo} alt="Logo" width="80" height="80" className="d-inline-block align-text-top" />
            <p className="nombre-campo-conecta" style={{ margin: '0 0 0 10px', fontSize: '28px', fontWeight: '700' }}>
              Campo Conecta
            </p>
          </a>

          <div className="d-flex align-items-center" style={{ flexWrap: 'nowrap' }}>
            <div className="me-3">
              <a href="/" className="nav-link" onClick={(e) => handleNavigation(e, '/')}>Inicio</a>
            </div>
            <div className="me-3">
              <a href="/marketplace" className="nav-link" onClick={(e) => handleNavigation(e, '/marketplace')}>Marketplace</a>
            </div>
            <div className="me-3">
              <a href="/perfil" className="nav-link" onClick={(e) => handleNavigation(e, '/perfil')}>Mi Perfil</a>
            </div>
            <div className="me-3">
              <a href="/estadisticas-energia" className="nav-link" onClick={(e) => handleNavigation(e, '/estadisticas-energia')}>Estadísticas</a>
            </div>

            {isAdmin && (
              <div className="me-3">
                <a href="/admin" className="nav-link" onClick={(e) => handleNavigation(e, '/admin')}>Administración</a>
              </div>
            )}

            <div className="me-3">
              <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                Cerrar Sesión
              </button>
            </div>

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
                  style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', justifyContent: 'center' }}
                >
                  <p className="nombre-usuario-campo-conecta" style={{ margin: '5px 0 0 0', textAlign: 'center' }}>
                    Bienvenido {displayName}
                  </p>
                  <img
                    src={
                      datosPersonales?.imagen
                        ? (typeof datosPersonales.imagen === 'string'
                            ? `data:image/jpeg;base64,${datosPersonales.imagen}`
                            : URL.createObjectURL(new Blob([datosPersonales.imagen], { type: 'image/jpeg' })))
                        : logoUsuario
                    }
                    alt="Foto Usuario"
                    width="40"
                    height="40"
                    className="d-inline-block align-text-top imagen-usuario-cc"
                    onError={(e) => { e.target.src = logoUsuario; }}
                  />
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                <li>
                  <button className="dropdown-item" data-bs-toggle="modal" data-bs-target="#informacionUsuario">
                    Ver perfil
                  </button>
                </li>
                {isAdmin && (
                  <li>
                    <button className="dropdown-item" onClick={(e) => handleNavigation(e, '/admin')}>
                      Panel de administración
                    </button>
                  </li>
                )}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
      <UsuarioInfoModal userId={currentUser?.idUsuario || null} />
    </>
  );
}
