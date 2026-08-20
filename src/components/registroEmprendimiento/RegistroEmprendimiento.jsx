import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Alert,
  Snackbar,
  FormControlLabel,
  Switch 
} from "@mui/material";
import authService from "../../services/authService";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import NavBarUsuario from "../navBarUsuario/NavBarUsuario";
import Footer from "../footer/Footer";
import "./RegistroEmprendimiento.css";

function RegistroEmprendimiento() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "",
    fecha_creacion: new Date().toISOString().split('T')[0],
    estado_emprendimiento: true,
    idregiones: "",
  });
  
  const [imagen, setImagen] = useState(null);
  const [regiones, setRegiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Verificar autenticación
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/');
      return;
    }

    const userId = authService.getUserId();
    if (!userId) {
      setError('No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.');
      setTimeout(() => { authService.logout(); navigate('/'); }, 3000);
      return;
    }
    
    setUserId(userId);
    
    // Cargar regiones
    fetchRegiones();
  }, [navigate]);
  
  const fetchRegiones = async () => {
    try {
      const { data } = await api.get('/regiones');
      setRegiones(data);
    } catch {
      setError('No se pudieron cargar las regiones. Por favor intente más tarde.');
    }
  };
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Manejar cambio en el switch de estado
  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      estado_emprendimiento: e.target.checked,
    });
  };
  
  // Manejar carga de imagen
  const handleImageChange = (e) => {
    setImagen(e.target.files[0]);
  };
  
  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Verificar que el usuario está autenticado
    if (!userId) {
      setError("Debe iniciar sesión para registrar un emprendimiento");
      setLoading(false);
      return;
    }
    
    try {
      const requestFormData = new FormData();
      requestFormData.append('nombre', formData.nombre);
      requestFormData.append('descripcion', formData.descripcion);
      requestFormData.append('tipo', formData.tipo);
      requestFormData.append('fecha_creacion', formData.fecha_creacion);
      requestFormData.append('estado_emprendimiento', formData.estado_emprendimiento);
      requestFormData.append('idregiones', formData.idregiones);
      requestFormData.append('idusuarios', userId);

      if (imagen) {
        requestFormData.append('imagen', imagen);
      }
      
      await api.post('/emprendimientos', requestFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Mostrar mensaje de éxito
      setSuccess(true);
      
      // Limpiar formulario
      setFormData({
        nombre: "",
        descripcion: "",
        tipo: "",
        fecha_creacion: new Date().toISOString().split('T')[0],
        estado_emprendimiento: true,
        idregiones: "",
      });
      setImagen(null);
      
      // Redirigir al marketplace después de 2 segundos
      setTimeout(() => {
        navigate("/marketplace");
      }, 2000);
      
    } catch (error) {
      let errorMessage = error.response?.data?.message || error.message || 'Error al registrar el emprendimiento.';
      if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
        errorMessage += ' Por favor, intente iniciar sesión nuevamente.';
        setTimeout(() => { authService.logout(); navigate('/'); }, 3000);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar cierre de alerta de éxito
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };
  
  return (
    <>
      <NavBarUsuario />
      <Container maxWidth="md" className="registro-emprendimiento-container">
        <Paper elevation={3} sx={{ p: 4, mt: 4, mb: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Registra tu Emprendimiento
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
            Completa el formulario para mostrar tu emprendimiento en el marketplace
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Nombre del Emprendimiento"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Descripción"
                  name="descripcion"
                  multiline
                  rows={4}
                  value={formData.descripcion}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Tipo de Emprendimiento"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  helperText="Ej: Agrícola, Artesanía, Tecnología..."
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Fecha de Creación"
                  name="fecha_creacion"
                  type="date"
                  value={formData.fecha_creacion}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Región</InputLabel>
                  <Select
                    name="idregiones"
                    value={formData.idregiones}
                    onChange={handleChange}
                    label="Región"
                  >
                    {regiones.map((region) => (
                      <MenuItem key={region.idregiones} value={region.idregiones}>
                        {region.nombre_region}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.estado_emprendimiento}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Emprendimiento Activo"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Imagen del Emprendimiento
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  id="imagen-input"
                  onChange={handleImageChange}
                  style={{ marginBottom: '16px', width: '100%' }}
                />
                <Typography variant="caption" display="block">
                  Sube una imagen representativa de tu emprendimiento
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                    sx={{ minWidth: '200px' }}
                  >
                    {loading ? "Registrando..." : "Registrar Emprendimiento"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            ¡Emprendimiento registrado exitosamente! Redirigiendo al marketplace...
          </Alert>
        </Snackbar>
      </Container>
      <Footer />
    </>
  );
}

export default RegistroEmprendimiento; 