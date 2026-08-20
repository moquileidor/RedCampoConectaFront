import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import authService from '../../services/authService';
import api from '../../services/api';

export default function CompletarPerfil({ show, onHide, onUpdate }) {
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    cedula: "",
    direccion: "",
    telefono: "",
    imagen: null,
    tipoDocumento: "1", // Valor por defecto
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Obtener y almacenar el ID de usuario cuando el componente se monta
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    if (show) {
      // Resetear estados cuando se abre el modal
      setError(null);
      setSuccess(false);

      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const uid = user.idUsuario || user.idusuarios || user.id;
          if (uid) {
            setUserId(uid);
            setFormData((prev) => ({ ...prev, nombreCompleto: user.nombre || '' }));
          } else {
            setError('No se pudo determinar el ID de usuario. Por favor, recargue la página.');
          }
        } else {
          setError('No se encontraron datos de usuario. Por favor, inicie sesión nuevamente.');
        }
      } catch {
        setError('Error al procesar los datos de usuario. Por favor, inicie sesión nuevamente.');
      }
    }
  }, [show]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        imagen: e.target.files[0]
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (!userId) {
        throw new Error('ID de usuario no válido. Por favor, inicia sesión nuevamente.');
      }
      
      const formDataToSend = new FormData();
      formDataToSend.append('nombre_completo', formData.nombreCompleto);
      formDataToSend.append('cedula', formData.cedula);
      formDataToSend.append('direccion', formData.direccion);
      formDataToSend.append('telefono', formData.telefono);
      formDataToSend.append('idtipodocumento', formData.tipoDocumento);
      formDataToSend.append('idusuarios', userId.toString());

      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      const { data: result } = await api.post('/datosPersonales', formDataToSend);
      localStorage.setItem('datosPersonales', JSON.stringify(result));
      
      setSuccess(true);
      
      // Llamar al callback de actualización si existe
      if (typeof onUpdate === 'function') {
        setTimeout(onUpdate, 1000); // Dar tiempo para que se actualice el estado
      }
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onHide();
        setSuccess(false);
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Ocurrió un error al guardar los datos.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Completar Perfil</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success">
            ¡Perfil completado exitosamente!
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="cp_nombreCompleto">Nombre Completo</Form.Label>
            <Form.Control
              type="text"
              id="cp_nombreCompleto"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="cp_cedula">Cédula</Form.Label>
            <Form.Control
              type="text"
              id="cp_cedula"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="cp_direccion">Dirección</Form.Label>
            <Form.Control
              type="text"
              id="cp_direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="cp_telefono">Teléfono</Form.Label>
            <Form.Control
              type="tel"
              id="cp_telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="cp_tipoDocumento">Tipo de Documento</Form.Label>
            <Form.Select
              id="cp_tipoDocumento"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              required
            >
              <option value="1">Cédula de Ciudadanía</option>
              <option value="2">Tarjeta de Identidad</option>
              <option value="3">Pasaporte</option>
              <option value="4">Cédula de Extranjería</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label htmlFor="cp_imagen">Imagen de Perfil</Form.Label>
            <Form.Control
              type="file"
              id="cp_imagen"
              name="imagen"
              onChange={handleImageChange}
              accept="image/*"
            />
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading || !userId}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Guardando...
                </>
              ) : "Guardar Perfil"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
} 