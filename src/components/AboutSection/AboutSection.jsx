// src/components/mainSections/AboutSection.jsx
import React from "react";
import { Container, Typography, Grid, Card, CardContent, Box } from "@mui/material";
import { FaLeaf } from "react-icons/fa";
import { GiFarmTractor } from "react-icons/gi";
import { MdOutlinePeople } from "react-icons/md";
import '../../css/AboutSection.css';

function AboutSection() {
    return (
        <section className="section-about">

            <div className="contenedor">
                <Box sx={{ py: 6 }}>
                    <Container>
                        {/* Título de la sección */}
                        <Typography variant="h3" align="center" gutterBottom>
                            Sobre Campo Conecta
                        </Typography>
                        <Typography variant="subtitle1" align="center" sx={{ mb: 4 }}>
                            Conectando a productores y consumidores para un desarrollo sostenible en el campo
                        </Typography>

                        <Grid container spacing={4}>
                            {/* Misión */}
                            <Grid item xs={12} md={4}>
                                <Card sx={{ boxShadow: 3 }}>
                                    <CardContent>
                                        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                                            <FaLeaf size={40} color="#4CAF50" />
                                        </Box>
                                        <Typography variant="h5" align="center" gutterBottom>
                                            Nuestra Misión
                                        </Typography>
                                        <Typography variant="body1" align="center">
                                            Fomentar el desarrollo rural conectando a productores con consumidores de productos locales, promoviendo la sostenibilidad y la economía solidaria.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Historia */}
                            <Grid item xs={12} md={4}>
                                <Card sx={{ boxShadow: 3 }}>
                                    <CardContent>
                                        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                                            <GiFarmTractor size={40} color="#4CAF50" />
                                        </Box>
                                        <Typography variant="h5" align="center" gutterBottom>
                                            Nuestra Historia
                                        </Typography>
                                        <Typography variant="body1" align="center">
                                            Iniciamos este proyecto para acercar la tradición agrícola y la modernidad digital, dando voz a las comunidades rurales.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Impacto */}
                            <Grid item xs={12} md={4}>
                                <Card sx={{ boxShadow: 3 }}>
                                    <CardContent>
                                        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                                            <MdOutlinePeople size={40} color="#4CAF50" />
                                        </Box>
                                        <Typography variant="h5" align="center" gutterBottom>
                                            Nuestro Impacto
                                        </Typography>
                                        <Typography variant="body1" align="center">
                                            Más de 500 productores y 10,000 usuarios ya forman parte de esta red, impulsando el crecimiento de la economía rural.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>
            </div>
        </section>
    );
}

export default AboutSection;
