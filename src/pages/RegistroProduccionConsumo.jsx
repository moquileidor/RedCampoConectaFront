import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, Alert, CircularProgress, Grid,
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';
import Footer from '../components/footer/Footer';

const FUENTES_ENERGIA = ['Solar', 'Eólica', 'Hidroeléctrica', 'Biomasa', 'Geotérmica', 'Otra'];

export default function RegistroProduccionConsumo() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [emprendimientos, setEmprendimientos] = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [success, setSuccess]                 = useState(false);
  const [formData, setFormData]               = useState({
    emprendimientoId: '',
    fecha: new Date().toISOString().split('T')[0],
    energiaProducida: '',
    energiaConsumida: '',
    fuenteEnergia: '',
    observaciones: '',
  });

  const userId = currentUser?.idUsuario || currentUser?.idusuarios || currentUser?.id;

  useEffect(() => {
    if (!userId) {
      setError('No se ha iniciado sesión.');
      return;
    }

    api.get(`/emprendimientos/usuario/${userId}`)
      .then(({ data }) => {
        setEmprendimientos(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, emprendimientoId: data[0].idemprendimiento }));
        } else {
          setError('No tiene emprendimientos registrados. Debe registrar uno antes de poder registrar datos de energía.');
        }
      })
      .catch(() =>
        setError('No se pudieron cargar los emprendimientos. Verifique su conexión o inténtelo más tarde.')
      );
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!formData.emprendimientoId) {
      setError('Debe seleccionar un emprendimiento.');
      setLoading(false);
      return;
    }

    if (!formData.energiaProducida || !formData.energiaConsumida) {
      setError('Los valores de energía producida y consumida son obligatorios.');
      setLoading(false);
      return;
    }

    const emprendimientoSeleccionado = emprendimientos.find(
      (emp) => emp.idemprendimiento === parseInt(formData.emprendimientoId)
    );

    if (!emprendimientoSeleccionado) {
      setError('El emprendimiento seleccionado no es válido o ya no existe.');
      setLoading(false);
      return;
    }

    if (emprendimientoSeleccionado.idusuarios !== userId) {
      setError('Solo el dueño del emprendimiento puede registrar datos de energía.');
      setLoading(false);
      return;
    }

    const dataToSend = {
      idemprendimiento: parseInt(formData.emprendimientoId),
      fecha: formData.fecha,
      produccion_energia: parseFloat(formData.energiaProducida),
      consumo_energia: parseFloat(formData.energiaConsumida),
      fuente_energia: formData.fuenteEnergia || 'Solar',
      observaciones: formData.observaciones || '',
      usuario_registro: currentUser?.username || 'usuario',
    };

    try {
      await api.post('/produccionconsumoenergia', dataToSend);

      setSuccess(true);
      setFormData((prev) => ({
        emprendimientoId: prev.emprendimientoId,
        fecha: new Date().toISOString().split('T')[0],
        energiaProducida: '',
        energiaConsumida: '',
        fuenteEnergia: '',
        observaciones: '',
      }));
    } catch (err) {
      let mensajeError = 'No se pudieron guardar los datos. ';
      if (err.response?.data?.message) {
        mensajeError += err.response.data.message;
      } else if (err.response?.data?.error) {
        mensajeError += err.response.data.error;
      } else if (err.response) {
        mensajeError += `Error del servidor: ${err.response.status}.`;
      } else {
        mensajeError += 'No se recibió respuesta del servidor. Verifique su conexión.';
      }
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBarUsuario />
      <Box sx={{ py: 4, maxWidth: '800px', mx: 'auto', px: 2 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: '0.5rem' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: '#6BB190', mb: 4 }}>
            Registro de Producción y Consumo de Energía
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>Datos registrados correctamente</Alert>}

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
                      <MenuItem disabled value="">No hay emprendimientos disponibles</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Fecha" name="fecha" type="date"
                  value={formData.fecha} onChange={handleInputChange} required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: new Date().toISOString().split('T')[0] }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Fuente de Energía</InputLabel>
                  <Select
                    name="fuenteEnergia" value={formData.fuenteEnergia}
                    onChange={handleInputChange} label="Fuente de Energía"
                  >
                    {FUENTES_ENERGIA.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Energía Producida (kWh)" name="energiaProducida" type="number"
                  value={formData.energiaProducida} onChange={handleInputChange} required
                  inputProps={{ min: '0', step: '0.01' }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Energía Consumida (kWh)" name="energiaConsumida" type="number"
                  value={formData.energiaConsumida} onChange={handleInputChange} required
                  inputProps={{ min: '0', step: '0.01' }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth label="Observaciones" name="observaciones"
                  value={formData.observaciones} onChange={handleInputChange}
                  multiline rows={4}
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/estadisticas-energia')} sx={{ px: 3 }}>
                  Volver a Estadísticas
                </Button>
                <Button
                  type="submit" variant="contained"
                  disabled={loading || !formData.emprendimientoId}
                  sx={{ px: 4, bgcolor: '#6BB190', '&:hover': { bgcolor: '#5A9A7F' } }}
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
