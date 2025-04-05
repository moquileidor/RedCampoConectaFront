import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';
import authService from '../services/authService';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';
import Footer from '../components/footer/Footer';

export default function RegistroProduccionConsumo() {
  const navigate = useNavigate();
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    emprendimientoId: '',
    fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD para input type="date"
    energiaProducida: '',
    energiaConsumida: '',
    fuenteEnergia: '',
    observaciones: ''
  });

  useEffect(() => {
    const cargarEmprendimientos = async () => {
      try {
        const user = authService.getCurrentUser();
        if (!user) {
          setError('No se ha iniciado sesión');
          return;
        }

        // Añadir logs para depuración
        console.log("Cargando emprendimientos para el usuario:", user);
        console.log("ID del usuario:", user.idUsuario);

        // Cargar los emprendimientos del usuario actual usando el endpoint correcto
        const response = await axios.get(`http://localhost:8080/emprendimientos/usuario/${user.idUsuario}`, {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        
        console.log("Emprendimientos obtenidos:", response.data);
        setEmprendimientos(response.data);
        
        // Si hay emprendimientos, seleccionar el primero por defecto
        if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            emprendimientoId: response.data[0].idemprendimiento
          }));
        } else {
          setError('No tiene emprendimientos registrados. Debe registrar un emprendimiento antes de poder registrar datos de energía.');
        }
      } catch (error) {
        console.error('Error al cargar emprendimientos:', error);
        setError('No se pudieron cargar los emprendimientos. Verifique su conexión o inténtelo más tarde.');
      }
    };

    cargarEmprendimientos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validar datos
      if (!formData.emprendimientoId) {
        setError('Debe seleccionar un emprendimiento');
        setLoading(false);
        return;
      }

      if (!formData.energiaProducida || !formData.energiaConsumida) {
        setError('Los valores de energía producida y consumida son obligatorios');
        setLoading(false);
        return;
      }

      // Verificar que el usuario actual es el dueño del emprendimiento seleccionado
      const emprendimientoSeleccionado = emprendimientos.find(
        emp => emp.idemprendimiento === parseInt(formData.emprendimientoId)
      );
      
      if (!emprendimientoSeleccionado) {
        setError('El emprendimiento seleccionado no es válido o ya no existe');
        setLoading(false);
        return;
      }
      
      const usuarioActual = authService.getCurrentUser();
      if (!usuarioActual || emprendimientoSeleccionado.idusuarios !== usuarioActual.idUsuario) {
        setError('Solo el dueño del emprendimiento puede registrar datos de energía');
        setLoading(false);
        return;
      }

      console.log("Preparando datos para enviar:", formData);

      // Preparar datos para enviar - adaptar al formato esperado por la API
      const dataToSend = {
        idemprendimiento: parseInt(formData.emprendimientoId),
        fecha: formData.fecha,
        produccion_energia: parseFloat(formData.energiaProducida),
        consumo_energia: parseFloat(formData.energiaConsumida),
        fuente_energia: formData.fuenteEnergia || "Solar",
        observaciones: formData.observaciones || "",
        usuario_registro: authService.getCurrentUser()?.username || "usuario"
      };

      console.log("Enviando datos al servidor:", dataToSend);

      // Enviar datos al servidor - usar formato JSON explícito
      const response = await axios.post('http://localhost:8080/produccionconsumoenergia', 
        dataToSend,  // Ya no necesitamos JSON.stringify
        {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Respuesta del servidor:", response.data);

      // Mostrar mensaje de éxito y limpiar formulario
      setSuccess(true);
      setFormData({
        emprendimientoId: formData.emprendimientoId, // Mantener el emprendimiento seleccionado
        fecha: new Date().toISOString().split('T')[0],
        energiaProducida: '',
        energiaConsumida: '',
        fuenteEnergia: '',
        observaciones: ''
      });
    } catch (error) {
      console.error('Error al registrar datos:', error);
      
      let mensajeError = 'No se pudieron guardar los datos. ';
      
      if (error.response) {
        // El servidor respondió con un código de error
        console.error("Respuesta de error del servidor:", error.response);
        mensajeError += `Error del servidor: ${error.response.status}. `;
        
        if (error.response.data && error.response.data.message) {
          mensajeError += error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
          mensajeError += error.response.data.error;
        }
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        console.error("No se recibió respuesta:", error.request);
        mensajeError += 'No se recibió respuesta del servidor. Verifique su conexión a internet.';
      } else {
        // Error en la configuración de la petición
        mensajeError += error.message || 'Error desconocido.';
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const handleVolverEstadisticas = () => {
    navigate('/estadisticas-energia');
  };

  const opcionesFuenteEnergia = [
    'Solar',
    'Eólica',
    'Hidroeléctrica',
    'Biomasa',
    'Geotérmica',
    'Otra'
  ];

  return (
    <>
      <NavBarUsuario />
      <Box sx={{ py: 4, maxWidth: '800px', mx: 'auto', px: 2 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: '0.5rem' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: '#6BB190', mb: 4 }}>
            Registro de Producción y Consumo de Energía
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Datos registrados correctamente
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Emprendimiento</InputLabel>
                  <Select
                    name="emprendimientoId"
                    value={formData.emprendimientoId}
                    onChange={handleInputChange}
                    required
                    label="Emprendimiento"
                  >
                    {emprendimientos.length > 0 ? (
                      emprendimientos.map((emp) => (
                        <MenuItem key={emp.idemprendimiento} value={emp.idemprendimiento}>
                          {emp.nombre}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        No hay emprendimientos disponibles
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    max: new Date().toISOString().split('T')[0]
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Fuente de Energía</InputLabel>
                  <Select
                    name="fuenteEnergia"
                    value={formData.fuenteEnergia}
                    onChange={handleInputChange}
                    label="Fuente de Energía"
                  >
                    {opcionesFuenteEnergia.map((opcion) => (
                      <MenuItem key={opcion} value={opcion}>
                        {opcion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Energía Producida (kWh)"
                  name="energiaProducida"
                  type="number"
                  value={formData.energiaProducida}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: "0", step: "0.01" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Energía Consumida (kWh)"
                  name="energiaConsumida"
                  type="number"
                  value={formData.energiaConsumida}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: "0", step: "0.01" }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleVolverEstadisticas}
                  sx={{ px: 3 }}
                >
                  Volver a Estadísticas
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !formData.emprendimientoId}
                  sx={{ 
                    px: 4,
                    bgcolor: '#6BB190',
                    '&:hover': { bgcolor: '#5A9A7F' }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Guardar Datos'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
      <Footer />
    </>
  );
} 