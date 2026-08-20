import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardMedia, CardContent, Typography,
  CardActions, Button, Box, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Rating, Chip, CircularProgress, Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import Navbar from '../components/navBar/Navbar';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';
import Footer from '../components/footer/Footer';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import api from '../services/api';

function MarketplacePage() {
  const { isAuthenticated, currentUser } = useAuth();

  const [products, setProducts]               = useState([]);
  const [open, setOpen]                       = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [comment, setComment]                 = useState('');
  const [rating, setRating]                   = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [commentError, setCommentError]       = useState('');
  const [successMessage, setSuccessMessage]   = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Carga de emprendimientos — solo al montar, no depende de la sesión
  useEffect(() => {
    setLoading(true);
    setError('');

    api.get('/emprendimientos')
      .then(({ data }) => setProducts(data))
      .catch(() => {
        setError('No se pudieron cargar los emprendimientos. Por favor intente más tarde.');
        setProducts(getDefaultEmprendimientos());
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = (product) => {
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para comentar.');
      return;
    }
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setComment('');
    setRating(0);
    setCommentError('');
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim() || !rating) {
      setCommentError('Por favor, escribe un comentario y selecciona una calificación.');
      return;
    }

    const token = authService.getToken();
    if (!token) {
      setCommentError('No se pudo obtener el token. Por favor, inicia sesión nuevamente.');
      return;
    }

    setSubmittingComment(true);
    setCommentError('');

    const currentDate = new Date().toISOString();
    const newComment = {
      idemprendimiento: selectedProduct?.idemprendimiento,
      comentario: comment,
      calificacion: rating,
      fecha_comentario: currentDate,
      fecha_registro: currentDate,
      idusuarios: currentUser?.idUsuario || currentUser?.idusuarios,
    };

    try {
      await api.post('/comentariosYCalificaciones', newComment);
      handleClose();
      setSuccessMessage('¡Comentario enviado con éxito!');
    } catch (err) {
      setCommentError(`Error al enviar el comentario: ${err.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getDefaultEmprendimientos = () => [
    {
      idemprendimiento: 1,
      nombre: 'Café Orgánico de Antioquia',
      descripcion: 'Café cultivado en las montañas de Antioquia por familias campesinas locales.',
      tipo: 'Alimentos',
      fecha_creacion: '2023-01-15',
      idregiones: 5,
    },
    {
      idemprendimiento: 2,
      nombre: 'Artesanías Wayuu',
      descripcion: 'Mochilas y artesanías tradicionales elaboradas por la comunidad Wayuu.',
      tipo: 'Artesanía',
      fecha_creacion: '2023-02-20',
      idregiones: 2,
    },
    {
      idemprendimiento: 3,
      nombre: 'Miel Pura del Amazonas',
      descripcion: 'Miel recolectada de forma sostenible en el Amazonas colombiano.',
      tipo: 'Alimentos',
      fecha_creacion: '2023-03-10',
      idregiones: 8,
    },
  ];

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated ? <NavBarUsuario /> : <Navbar />}

      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontFamily="var(--font-title)" color="primary">
            Mercado Virtual Campesino
          </Typography>

          {isAuthenticated && (
            <Link to="/registro-emprendimiento" style={{ textDecoration: 'none' }}>
              <Button variant="contained" color="primary" sx={{ mb: { xs: 2, md: 0 } }}>
                Registrar mi Emprendimiento
              </Button>
            </Link>
          )}
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            {products.length > 0 ? (
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.idemprendimiento}>
                    <Card sx={{
                      height: '100%', display: 'flex', flexDirection: 'column',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
                    }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={
                          product.imagen_emprendimiento
                            ? (product.imagen_emprendimiento.startsWith('data:')
                                ? product.imagen_emprendimiento
                                : `data:image/jpeg;base64,${product.imagen_emprendimiento}`)
                            : `https://source.unsplash.com/random/300x200?${product.tipo?.toLowerCase()}`
                        }
                        alt={product.nombre}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://source.unsplash.com/random/300x200?farm`;
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Chip label={product.tipo} size="small" sx={{ backgroundColor: '#8EC3A7', color: '#4A6B59', fontWeight: 'bold', mb: 1 }} />
                        <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                          {product.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {product.descripcion}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                          Creado el {formatDate(product.fecha_creacion)}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                          <Button size="small" variant="outlined" color="primary">Contactar</Button>
                          <Button size="small" onClick={() => handleOpen(product)} sx={{ color: 'secondary.main' }}>
                            Comentar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5, px: 2, backgroundColor: '#F8F9FA', borderRadius: '0.5rem' }}>
                <Typography variant="h6" gutterBottom>No hay emprendimientos registrados aún</Typography>
                {isAuthenticated ? (
                  <Link to="/registro-emprendimiento" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary" size="small">Registrar Emprendimiento</Button>
                  </Link>
                ) : (
                  <Typography variant="body1">Inicia sesión para registrar tu emprendimiento</Typography>
                )}
              </Box>
            )}
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" color="primary">Volver al Inicio</Button>
          </Link>
        </Box>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Añadir Comentario</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>{selectedProduct?.nombre}</Typography>

            {commentError && (
              <Alert severity="error" sx={{ mb: 2 }}>{commentError}</Alert>
            )}

            <Box sx={{ mb: 2, mt: 2 }}>
              <Typography component="legend">Calificación</Typography>
              <Rating name="rating" value={rating} onChange={(_, v) => setRating(v)} precision={1} size="large" />
            </Box>
            <TextField
              autoFocus margin="dense" label="Tu comentario" type="text"
              fullWidth multiline rows={4} variant="outlined"
              value={comment} onChange={(e) => setComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">Cancelar</Button>
            <Button
              onClick={handleCommentSubmit} color="primary" variant="contained"
              disabled={submittingComment || !comment.trim() || !rating}
            >
              {submittingComment ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Footer />
    </div>
  );
}

export default MarketplacePage;
