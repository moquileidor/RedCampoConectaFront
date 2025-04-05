import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Rating,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";
import { Link } from "react-router-dom";
import Navbar from "../components/navBar/Navbar";
import NavBarUsuario from "../components/navBarUsuario/NavBarUsuario";
import Footer from "../components/footer/Footer";
import authService from "../services/authService";
import axios from 'axios';

function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [idusuarios, setIdusuarios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentError, setCommentError] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    // Verificar autenticación usando el servicio
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsLoggedIn(authenticated);
      
      // Obtener usuario actual
      if (authenticated) {
        const user = authService.getCurrentUser();
        if (user && user.idUsuario) {
          setIdusuarios(user.idUsuario);
        }
      }
    };
    
    checkAuth();
    
    // Volver a verificar cuando el localStorage cambie
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    
    // Obtener token de autenticación si el usuario está logueado
    const token = isLoggedIn ? localStorage.getItem("token") : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    fetch("http://localhost:8080/emprendimientos", {
      headers
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Emprendimientos cargados:", data);
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener los emprendimientos:", error);
        setError("No se pudieron cargar los emprendimientos. Por favor intente más tarde.");
        // En caso de error, cargar datos de prueba
        setProducts(getDefaultEmprendimientos());
        setLoading(false);
      });
  }, [isLoggedIn]);

  const handleOpen = (product) => {
    // Verificar si el usuario está autenticado antes de permitir comentar
    if (!isLoggedIn) {
      alert("Debes iniciar sesión para comentar.");
      return;
    }
    
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setComment("");
    setRating(0);
  };

  const handleCommentSubmit = () => {
    if (!comment.trim() || !rating || !idusuarios) {
      console.error("Faltan datos para enviar el comentario", { comment, rating, idusuarios });
      setCommentError("Por favor, escribe un comentario y selecciona una calificación");
      return;
    }

    setSubmittingComment(true);
    setCommentError("");
    const currentDate = new Date().toISOString();

    const newComment = {
      idemprendimiento: selectedProduct?.idemprendimiento,
      comentario: comment,
      calificacion: rating,
      fecha_comentario: currentDate,
      fecha_registro: currentDate,
      idusuarios: idusuarios
    };

    console.log("Enviando comentario:", newComment);

    // Obtener el token de manera correcta usando authService
    const token = authService.getToken();
    
    if (!token) {
      setCommentError("No se pudo obtener el token de autenticación. Por favor, inicia sesión nuevamente.");
      setSubmittingComment(false);
      return;
    }

    // Mostrar el token para verificar su formato (solo con fines de depuración)
    console.log("Token usado:", token);

    // Corregir URL del endpoint y la estructura del header
    fetch("http://localhost:8080/comentariosYCalificaciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token.startsWith("Bearer ") ? token : `Bearer ${token}`
      },
      body: JSON.stringify(newComment),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Error al enviar el comentario (${response.status}): ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Comentario guardado:", data);
        handleClose();
        alert("¡Comentario enviado con éxito!");
      })
      .catch((error) => {
        console.error("Error al guardar el comentario:", error);
        setCommentError(`Error al enviar el comentario: ${error.message}`);
      })
      .finally(() => {
        setSubmittingComment(false);
      });
  };

  const getDefaultEmprendimientos = () => {
    return [
      {
        idemprendimiento: 1,
        nombre: "Café Orgánico de Antioquia",
        descripcion: "Café cultivado en las montañas de Antioquia por familias campesinas locales. Cultivo sostenible y comercio justo.",
        tipo: "Alimentos",
        fecha_creacion: "2023-01-15",
        idregiones: 5
      },
      {
        idemprendimiento: 2,
        nombre: "Artesanías Wayuu",
        descripcion: "Mochilas y artesanías tradicionales elaboradas por la comunidad Wayuu. Cada pieza cuenta una historia única.",
        tipo: "Artesanía",
        fecha_creacion: "2023-02-20",
        idregiones: 2
      },
      {
        idemprendimiento: 3,
        nombre: "Miel Pura del Amazonas",
        descripcion: "Miel recolectada de forma sostenible en el Amazonas colombiano. 100% natural y sin aditivos.",
        tipo: "Alimentos",
        fecha_creacion: "2023-03-10",
        idregiones: 8
      }
    ];
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Mostramos la barra correspondiente */}
      {isLoggedIn ? <NavBarUsuario /> : <Navbar />}
      
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        {/* Cabecera del marketplace */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4 
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontFamily="var(--font-title)"
            color="primary"
          >
            Mercado Virtual Campesino
          </Typography>
          
          {isLoggedIn && (
            <Link to="/registro-emprendimiento" style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                sx={{ 
                  backgroundColor: 'var(--color-primary)',
                  '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
                  mb: { xs: 2, md: 0 }
                }}
              >
                Registrar mi Emprendimiento
              </Button>
            </Link>
          )}
        </Box>
        
        {/* Estado de carga o error */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: 'var(--color-primary)' }} />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        {/* Lista de emprendimientos */}
        {!loading && !error && (
          <>
            {products.length > 0 ? (
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.idemprendimiento}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        boxShadow: 'var(--shadow-sm)',
                        borderRadius: 'var(--border-radius-md)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 'var(--shadow-md)'
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.imagen_emprendimiento 
                          ? (product.imagen_emprendimiento.startsWith('data:') 
                              ? product.imagen_emprendimiento 
                              : `data:image/jpeg;base64,${product.imagen_emprendimiento}`)
                          : `https://source.unsplash.com/random/300x200?${product.tipo.toLowerCase()}`}
                        alt={product.nombre}
                        onError={(e) => {
                          // Si hay un error cargando la imagen, usar una imagen de respaldo
                          e.target.onerror = null;
                          e.target.src = `https://source.unsplash.com/random/300x200?${product.tipo.toLowerCase()}`;
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip 
                            label={product.tipo} 
                            size="small"
                            sx={{ 
                              backgroundColor: '#8EC3A7', 
                              color: '#4A6B59',
                              fontWeight: 'bold'
                            }} 
                          />
                        </Box>
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
                          <Button 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              borderColor: '#6BB190',
                              color: '#6BB190',
                              '&:hover': {
                                borderColor: '#4A9074',
                                backgroundColor: 'rgba(107, 177, 144, 0.1)'
                              }
                            }}
                          >
                            Contactar
                          </Button>
                          <Button 
                            size="small"
                            onClick={() => handleOpen(product)}
                            sx={{ 
                              color: '#4A6B59',
                              '&:hover': {
                                backgroundColor: 'rgba(74, 107, 89, 0.1)'
                              }
                            }}
                          >
                            Comentar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 5,
                  px: 2,
                  backgroundColor: '#F8F9FA',
                  borderRadius: '0.5rem'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No hay emprendimientos registrados aún
                </Typography>
                {isLoggedIn ? (
                  <Typography variant="body1">
                    ¡Sé el primero en registrar tu emprendimiento!
                    <Link to="/registro-emprendimiento" style={{ textDecoration: 'none', marginLeft: '8px' }}>
                      <Button 
                        variant="contained" 
                        size="small"
                        sx={{ 
                          backgroundColor: '#6BB190',
                          '&:hover': { backgroundColor: '#4A9074' }
                        }}
                      >
                        Registrar Emprendimiento
                      </Button>
                    </Link>
                  </Typography>
                ) : (
                  <Typography variant="body1">
                    Inicia sesión para registrar tu emprendimiento
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
        
        {/* Botón para volver al inicio */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button 
              variant="outlined"
              sx={{ 
                borderColor: '#6BB190',
                color: '#6BB190',
                '&:hover': {
                  borderColor: '#4A9074',
                  backgroundColor: 'rgba(107, 177, 144, 0.1)'
                }
              }}
            >
              Volver al Inicio
            </Button>
          </Link>
        </Box>
      
        {/* Modal para comentarios */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>Añadir Comentario</DialogTitle>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              {selectedProduct?.nombre}
            </Typography>
            
            {commentError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {commentError}
              </Alert>
            )}
            
            <Box sx={{ mb: 2, mt: 2 }}>
              <Typography component="legend">Calificación</Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => {
                  setRating(newValue);
                }}
                precision={1}
                size="large"
              />
            </Box>
            <TextField
              autoFocus
              margin="dense"
              id="comment"
              label="Tu comentario"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancelar
            </Button>
            <Button 
              onClick={handleCommentSubmit} 
              color="primary" 
              variant="contained"
              disabled={submittingComment || !comment.trim() || !rating}
            >
              {submittingComment ? "Enviando..." : "Enviar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      
      <Footer />
    </div>
  );
}

export default MarketplacePage;