// src/components/mainSections/ContentSection.jsx
import '../../css/ContentSection.css'
import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";  // Para navegar a /marketplace
import { MdPeople, MdHelpOutline, MdShoppingCart } from "react-icons/md";

function ContentSection() {
  return (
    <section className="section-card-descubre">
      <div className="contenedor">
        <Box sx={{ py: 6, backgroundColor: "#f9f9f9" }}>
          <Container>
            {/* Título principal */}
            <Typography variant="h3" align="center" gutterBottom>
              Descubre Campo Conecta
            </Typography>
            {/* Subtítulo */}
            <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
              Conecta personas, productos y tradiciones del campo colombiano
            </Typography>

            <Grid container spacing={4}>
              {/* Tarjeta 1 */}
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                      <Avatar
                        sx={{ bgcolor: "primary.main", width: 56, height: 56 }}
                      >
                        <MdPeople size={32} />
                      </Avatar>
                    </Box>
                    <Typography variant="h5" align="center" gutterBottom>
                      ¿Qué es Campo Conecta?
                    </Typography>
                    <Typography variant="body1" align="center">
                      Una red social comunitaria que conecta personas, productos y
                      tradiciones del campo colombiano.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tarjeta 2 */}
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                      <Avatar
                        sx={{ bgcolor: "success.main", width: 56, height: 56 }}
                      >
                        <MdHelpOutline size={32} />
                      </Avatar>
                    </Box>
                    <Typography variant="h5" align="center" gutterBottom>
                      ¿Para quién es?
                    </Typography>
                    <Typography variant="body1" align="center">
                      Para campesinos, productores locales y personas que quieren
                      apoyar las comunidades rurales comprando directamente.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tarjeta 3 */}
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: 3 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                      <Avatar
                        sx={{ bgcolor: "success.main", width: 56, height: 56 }}
                      >
                        <MdShoppingCart size={32} />
                      </Avatar>
                    </Box>
                    <Typography variant="h5" align="center" gutterBottom>
                      Vende tus Productos
                    </Typography>
                    <Typography variant="body1" align="center">
                      Registra tu emprendimiento y muestra tus productos a toda Colombia. ¡Conecta con consumidores interesados en productos del campo!
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Botones para navegar */}
            <Box sx={{ textAlign: "center", mt: 4, display: "flex", justifyContent: "center", gap: 2 }}>
                <Link to="/Marketplace" style={{ textDecoration: "none" }}>
                    <Button variant="contained" color="primary" size="large">
                        Explorar Mercado
                    </Button>
                </Link>
                <Link to="/registro-emprendimiento" style={{ textDecoration: "none" }}>
                    <Button variant="contained" color="success" size="large">
                        Registrar mi Emprendimiento
                    </Button>
                </Link>
            </Box>
          </Container>
        </Box>
      </div>
    </section>
  );
}

export default ContentSection;
