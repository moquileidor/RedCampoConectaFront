import React, { useState, useEffect, useCallback } from 'react';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';
import FooterPage from '../components/footer/Footer';
import logoUsuario from '../assets/usuarioLogo.png';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import ActualizarMiInformacion from '../components/modalActualizarUsuario/ModalActualizarUsuario';
import CompletarPerfil from '../components/modalCompletarPerfil/CompletarPerfil';

// Estilos constantes — fuera del componente para no recrear en cada render
const cardStyle = {
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  marginBottom: '20px',
  border: 'none',
};

const containerStyle = {
  paddingTop: '40px',
  paddingBottom: '60px',
  minHeight: 'calc(100vh - 200px)',
};

const profileImageStyle = {
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '5px solid #6BB190',
  margin: '0 auto 20px',
};

const headerStyle = {
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e0e0e0',
  padding: '20px 0',
  marginBottom: '30px',
};

const procesarDatosPersonales = (datos) => {
  if (!datos) return null;
  if (datos.iddatospersonales && datos.nombre_completo && datos.cedula) return datos;

  const datosFormateados = { ...datos };

  if (Array.isArray(datos.imagen)) {
    try {
      const byteArray = new Uint8Array(datos.imagen);
      const binaryString = byteArray.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
      datosFormateados.imagen = btoa(binaryString);
    } catch {
      // imagen no convertible — dejar como está
    }
  }

  return datosFormateados;
};

const PerfilUsuarioPage = () => {
  const { currentUser } = useAuth();
  const [datosPersonales, setDatosPersonales]     = useState(null);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [actualizando, setActualizando]           = useState(false);
  const [showCompletarPerfil, setShowCompletarPerfil] = useState(false);

  const userId = currentUser?.idUsuario || currentUser?.idusuarios || currentUser?.id;

  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setError('No se pudo determinar el ID del usuario.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/datosPersonales/usuario/${userId}`);

      if (response.data && Object.keys(response.data).length > 0) {
        const datosProcesados = procesarDatosPersonales(response.data);
        setDatosPersonales(datosProcesados);
        setUsuarioSeleccionado(datosProcesados);
        localStorage.setItem('datosPersonales', JSON.stringify(datosProcesados));
        return;
      }
    } catch {
      // no hay datos aún — crear placeholders para permitir edición
    }

    const datosPredeterminados = {
      iddatospersonales: null,
      nombre_completo: currentUser?.nombre || '',
      cedula: '',
      direccion: '',
      telefono: '',
      email: currentUser?.emailUser || currentUser?.email || '',
      idusuarios: userId,
    };

    setDatosPersonales(datosPredeterminados);
    setUsuarioSeleccionado(datosPredeterminados);
    setError('No se encontraron datos personales completos. Por favor, actualiza tu información.');
  }, [userId, currentUser]);

  useEffect(() => {
    // Mostrar datos del localStorage mientras carga del servidor
    const storedDatos = localStorage.getItem('datosPersonales');
    if (storedDatos && storedDatos !== 'null') {
      try {
        const parsed = JSON.parse(storedDatos);
        setDatosPersonales(parsed);
        setUsuarioSeleccionado(parsed);
      } catch {
        // datos corruptos — ignorar
      }
    }

    fetchUserData();
  }, [fetchUserData]);

  const verificarTodasFuentes = async () => {
    setActualizando(true);
    await fetchUserData();
    setActualizando(false);
  };

  const handleShowModal = () => {
    const perfilIncompleto = !datosPersonales?.iddatospersonales;
    if (perfilIncompleto) {
      setShowCompletarPerfil(true);
    } else {
      const modal = document.getElementById('actualizar-info-usuario');
      if (modal && window.bootstrap?.Modal) {
        new window.bootstrap.Modal(modal).show();
      }
    }
  };

  const perfilIncompleto =
    !datosPersonales?.iddatospersonales ||
    datosPersonales?.cedula === 'Sin especificar' ||
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
              <Button variant="primary" onClick={fetchUserData} disabled={actualizando}>
                Reintentar
              </Button>
              <Button variant="outline-primary" onClick={verificarTodasFuentes} disabled={actualizando}>
                {actualizando ? 'Verificando...' : 'Verificar todas las fuentes'}
              </Button>
            </div>
          </div>
        ) : (
          <Row>
            <Col md={4}>
              <Card style={cardStyle}>
                <Card.Body className="text-center">
                  <img
                    src={
                      datosPersonales?.imagen
                        ? (typeof datosPersonales.imagen === 'string'
                            ? `data:image/jpeg;base64,${datosPersonales.imagen}`
                            : URL.createObjectURL(new Blob([datosPersonales.imagen], { type: 'image/jpeg' })))
                        : logoUsuario
                    }
                    alt="Foto de perfil"
                    style={profileImageStyle}
                    onError={(e) => { e.target.src = logoUsuario; }}
                  />
                  <Card.Title className="mb-3">
                    {datosPersonales?.nombre_completo || currentUser?.username || 'Usuario'}
                  </Card.Title>
                  <Card.Subtitle className="mb-3 text-muted">
                    {currentUser?.rol === 'ROLE_ADMIN' ? 'Administrador' : 'Usuario'}
                  </Card.Subtitle>
                  <Button variant="success" size="sm" onClick={handleShowModal}>
                    Actualizar información
                  </Button>
                </Card.Body>
              </Card>

              {perfilIncompleto && (
                <div className="alert alert-info mt-3 text-center">
                  <i className="bi bi-info-circle me-2"></i>
                  Tu perfil está incompleto. Por favor, completa tu información personal.
                </div>
              )}
            </Col>

            <Col md={8}>
              <Card style={cardStyle}>
                <Card.Header as="h5">Información Personal</Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col sm={4}><strong>Nombre completo:</strong></Col>
                    <Col sm={8}>{datosPersonales?.nombre_completo || 'No disponible'}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}><strong>Email:</strong></Col>
                    <Col sm={8}>{currentUser?.emailUser || 'No disponible'}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}><strong>Teléfono:</strong></Col>
                    <Col sm={8} className={datosPersonales?.telefono === 'Sin especificar' ? 'text-muted fst-italic' : ''}>
                      {datosPersonales?.telefono || 'No disponible'}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}><strong>Cédula:</strong></Col>
                    <Col sm={8} className={datosPersonales?.cedula === 'Sin especificar' ? 'text-muted fst-italic' : ''}>
                      {datosPersonales?.cedula || 'No disponible'}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}><strong>Dirección:</strong></Col>
                    <Col sm={8} className={datosPersonales?.direccion === 'Sin especificar' ? 'text-muted fst-italic' : ''}>
                      {datosPersonales?.direccion || 'No disponible'}
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={4}><strong>Fecha de registro:</strong></Col>
                    <Col sm={8}>
                      {currentUser?.fechaCreacion
                        ? new Date(currentUser.fechaCreacion).toLocaleDateString('es-ES')
                        : 'No disponible'}
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
                        {currentUser?.loginTime
                          ? new Date(currentUser.loginTime).toLocaleString('es-ES')
                          : 'No disponible'}
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

      <ActualizarMiInformacion usuarioSeleccionado={usuarioSeleccionado} onUpdate={fetchUserData} />

      <CompletarPerfil
        show={showCompletarPerfil}
        onHide={() => setShowCompletarPerfil(false)}
        onUpdate={fetchUserData}
      />
    </div>
  );
};

export default PerfilUsuarioPage;
