import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';
import FooterPage from '../components/footer/Footer';
import logoUsuario from '../assets/usuarioLogo.png';
import authService from '../services/authService';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import ActualizarMiInformacion from '../components/modalActualizarUsuario/ModalActualizarUsuario';
import CompletarPerfil from '../components/modalCompletarPerfil/CompletarPerfil';

const PerfilUsuarioPage = () => {
  const [userData, setUserData] = useState(null);
  const [datosPersonales, setDatosPersonales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [actualizando, setActualizando] = useState(false);
  const [showCompletarPerfil, setShowCompletarPerfil] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    try {
      // Obtener el usuario directamente del localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        navigate('/');
        return;
      }
      
      const user = JSON.parse(userStr);
      setUserData(user);
      
      // Obtener el ID del usuario de varias propiedades posibles
      const userId = user.idUsuario || user.idusuarios || user.id;
      
      if (!userId) {
        console.error("No se pudo determinar el ID del usuario:", user);
        setError("No se pudo determinar el ID del usuario");
        setLoading(false);
        return;
      }
      
      console.log("ID de usuario encontrado para perfil:", userId);
      
      // Intentamos obtener datos personales del localStorage para mostrar rápidamente
      const storedDatosPersonales = localStorage.getItem('datosPersonales');
      if (storedDatosPersonales && storedDatosPersonales !== 'null') {
        try {
          const parsedData = JSON.parse(storedDatosPersonales);
          setDatosPersonales(parsedData);
          setUsuarioSeleccionado(parsedData);
        } catch (error) {
          console.error("Error al parsear datos personales:", error);
        }
      }
      
      // Siempre intentamos obtener datos actualizados del servidor
      fetchUserData(userId);
      
      // Limpiar cualquier modal backdrop al cargar
      const cleanupModals = () => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.removeAttribute('style');
      };
      
      cleanupModals();
    } catch (error) {
      console.error("Error al inicializar perfil:", error);
      setError("Error al cargar datos de usuario");
      setLoading(false);
    }
  }, [navigate]);
  
  // Función para procesar los datos personales recibidos
  const procesarDatosPersonales = (datos) => {
    if (!datos) return null;
    
    // Si los datos ya están en el formato correcto, devolverlos tal cual
    if (datos.iddatospersonales && datos.nombre_completo && datos.cedula) {
      return datos;
    }
    
    // Intentar extraer datos personales si vienen en otro formato
    const datosFormateados = {};
    
    // Copiar propiedades existentes
    Object.keys(datos).forEach(key => {
      datosFormateados[key] = datos[key];
    });
    
    // Si la imagen es un array de bytes, convertirla a Base64
    if (datos.imagen && Array.isArray(datos.imagen)) {
      try {
        const byteArray = new Uint8Array(datos.imagen);
        const binaryString = byteArray.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        datosFormateados.imagen = btoa(binaryString);
      } catch (error) {
        console.error("Error al convertir imagen:", error);
      }
    }
    
    console.log("Datos procesados:", datosFormateados);
    return datosFormateados;
  };

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Intentando obtener datos para el usuario ID:", userId);
      
      // Múltiples intentos para obtener datos personales en orden:
      // 1. Primero intenta obtenerlos del backend directamente
      try {
        const response = await axios.get(`http://localhost:8080/datosPersonales/usuario/${userId}`);
        
        if (response.data && Object.keys(response.data).length > 0) {
          console.log("Datos personales obtenidos correctamente:", response.data);
          const datosProcesados = procesarDatosPersonales(response.data);
          setDatosPersonales(datosProcesados);
          setUsuarioSeleccionado(datosProcesados);
          localStorage.setItem('datosPersonales', JSON.stringify(datosProcesados));
          setLoading(false);
          return;
        }
      } catch (directError) {
        console.error("Error al obtener datos del servidor:", directError);
      }
      
      // 2. Si no hay datos, crea datos predeterminados para permitir la edición
      const user = authService.getCurrentUser();
      if (user) {
        console.log("Creando datos predeterminados para permitir edición");
        const datosPredeterminados = {
          iddatospersonales: null,
          nombre_completo: user.nombre || '',
          cedula: '',
          direccion: '',
          telefono: '',
          email: user.emailUser || user.email || '',
          idusuarios: userId
        };
        
        setDatosPersonales(datosPredeterminados);
        setUsuarioSeleccionado(datosPredeterminados);
        
        // No guardar en localStorage datos predeterminados para forzar la carga desde el server la próxima vez
        
        // Mostrar alerta para que el usuario sepa que debe actualizar sus datos
        setError("No se encontraron datos personales completos. Por favor, actualiza tu información.");
      }
    } catch (error) {
      console.error("Error general al cargar datos personales:", error);
      setError("Error al cargar los datos personales. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };
  
  // Función para verificar todos los posibles orígenes de datos
  const verificarTodasFuentes = async () => {
    setActualizando(true);
    setError(null);
    
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        setError("No hay usuario autenticado");
        setActualizando(false);
        return;
      }
      
      const userId = user.idUsuario || user.idusuarios;
      if (!userId) {
        setError("No se pudo determinar el ID del usuario");
        setActualizando(false);
        return;
      }
      
      // Forzar la recarga de datos
      await fetchUserData(userId);
      
      setActualizando(false);
    } catch (error) {
      console.error("Error al verificar fuentes:", error);
      setError("Error al obtener datos. Por favor, intenta nuevamente.");
      setActualizando(false);
    }
  };

  const handleShowModal = () => {
    // Determinar si necesitamos completar el perfil o actualizarlo
    const perfilIncompleto = !datosPersonales?.iddatospersonales;
    
    if (perfilIncompleto) {
      setShowCompletarPerfil(true);
    } else {
      // Inicializar el modal de actualización manualmente
      const modal = document.getElementById('actualizar-info-usuario');
      if (modal && window.bootstrap && window.bootstrap.Modal) {
        const modalInstance = new window.bootstrap.Modal(modal);
        modalInstance.show();
      }
    }
  };

  // Estilo para las cards
  const cardStyle = {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    marginBottom: '20px',
    border: 'none'
  };

  // Estilo para el contenedor principal
  const containerStyle = {
    paddingTop: '40px',
    paddingBottom: '60px',
    minHeight: 'calc(100vh - 200px)'
  };

  // Estilo para la imagen de perfil
  const profileImageStyle = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '5px solid #6BB190',
    margin: '0 auto 20px'
  };

  // Estilo para la cabecera
  const headerStyle = {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
    padding: '20px 0',
    marginBottom: '30px'
  };

  // Función para refrescar los datos del usuario
  const refreshUserData = () => {
    const user = authService.getCurrentUser();
    if (user) {
      const userId = user.idUsuario || user.idusuarios;
      if (userId) {
        fetchUserData(userId);
      }
    }
  };

  // Determinar si el perfil está incompleto
  const perfilIncompleto = !datosPersonales?.iddatospersonales || 
                           datosPersonales?.cedula === "Sin especificar" || 
                           !datosPersonales?.cedula;

  return (
    <div className="PerfilUsuarioPage">
      <NavBarUsuario />
      
      <div style={headerStyle}>
        <Container>
          <h1 className="text-center">Mi Perfil</h1>
          <p className="text-center text-muted">Visualiza y gestiona tu información personal</p>
        </Container>
      </div>
      
      <Container style={containerStyle}>
        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-3">Cargando información del perfil...</p>
          </div>
        ) : error ? (
          <div className="alert alert-warning text-center" role="alert">
            {error}
            <div className="mt-3 d-flex justify-content-center gap-2">
              <Button 
                variant="primary" 
                onClick={refreshUserData}
                disabled={actualizando}
              >
                Reintentar
              </Button>
              <Button 
                variant="outline-primary" 
                onClick={verificarTodasFuentes}
                disabled={actualizando}
              >
                {actualizando ? 'Verificando fuentes...' : 'Verificar todas las fuentes'}
              </Button>
            </div>
          </div>
        ) : (
          <Row>
            <Col md={4}>
              <Card style={cardStyle}>
                <Card.Body className="text-center">
                  <img 
                    src={datosPersonales?.imagen ? 
                      (typeof datosPersonales.imagen === 'string' ? 
                        `data:image/jpeg;base64,${datosPersonales.imagen}` : 
                        URL.createObjectURL(new Blob([datosPersonales.imagen], {type: 'image/jpeg'}))
                      ) : logoUsuario} 
                    alt="Foto de perfil" 
                    style={profileImageStyle}
                    onError={(e) => {
                      e.target.src = logoUsuario;
                      console.log("Error al cargar la imagen, usando predeterminada");
                    }}
                  />
                  <Card.Title className="mb-3">{datosPersonales?.nombre_completo || userData?.username || 'Usuario'}</Card.Title>
                  <Card.Subtitle className="mb-3 text-muted">
                    {userData?.rol === "ROLE_ADMIN" ? "Administrador" : "Usuario"}
                  </Card.Subtitle>
                  <div className="d-grid gap-2">
                 
                  </div>
                </Card.Body>
              </Card>
              
              {perfilIncompleto && (
                <div className="alert alert-info mt-3 text-center">
                  <i className="bi bi-info-circle me-2"></i>
                  Tu perfil está incompleto. Por favor, completa tu información personal para acceder a todas las funcionalidades.
                </div>
              )}
            </Col>
            
            <Col md={8}>
              <Card style={cardStyle}>
                <Card.Header as="h5">Información Personal</Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Nombre completo:</strong>
                    </Col>
                    <Col sm={8}>
                      {datosPersonales?.nombre_completo || 'No disponible'}
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Email:</strong>
                    </Col>
                    <Col sm={8}>
                      {userData?.emailUser || 'No disponible'}
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Teléfono:</strong>
                    </Col>
                    <Col sm={8} className={datosPersonales?.telefono === "Sin especificar" ? "text-muted fst-italic" : ""}>
                      {datosPersonales?.telefono || 'No disponible'}
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Cédula:</strong>
                    </Col>
                    <Col sm={8} className={datosPersonales?.cedula === "Sin especificar" ? "text-muted fst-italic" : ""}>
                      {datosPersonales?.cedula || 'No disponible'}
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Dirección:</strong>
                    </Col>
                    <Col sm={8} className={datosPersonales?.direccion === "Sin especificar" ? "text-muted fst-italic" : ""}>
                      {datosPersonales?.direccion || 'No disponible'}
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col sm={4}>
                      <strong>Fecha de registro:</strong>
                    </Col>
                    <Col sm={8}>
                      {userData?.loginTime ? new Date(userData.loginTime).toLocaleDateString() : 'No disponible'}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              
              <Card style={cardStyle}>
                <Card.Header as="h5">Actividad</Card.Header>
                <Card.Body>
                  <p>Aquí podrás ver tu actividad reciente en la plataforma.</p>
                  <ul className="list-group">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Último inicio de sesión
                      <span className="badge bg-primary rounded-pill">
                        {userData?.loginTime ? new Date(userData.loginTime).toLocaleString() : 'No disponible'}
                      </span>
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
      
      <FooterPage />
      
      {/* Modal para actualizar información (para usuarios con perfil existente) */}
      <ActualizarMiInformacion 
        usuarioSeleccionado={usuarioSeleccionado} 
        onUpdate={refreshUserData}
      />

      {/* Modal para completar perfil (para usuarios sin perfil) */}
      <CompletarPerfil
        show={showCompletarPerfil}
        onHide={() => setShowCompletarPerfil(false)}
        onUpdate={refreshUserData}
      />
    </div>
  );
};

export default PerfilUsuarioPage; 