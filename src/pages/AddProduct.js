
// aqui va codigo para agregar prductos, esta sujeto a la implemtacion del back end
// se puede usar para agregar productos a la base de datos
// se utiliza estos datos para simular la vista del mercado
// src/data/products.js
// src/pages/AddProduct.jsx
import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";

function AddProduct() {
    const [name, setName] = useState("");
    const [region, setRegion] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [offer, setOffer] = useState("");
    const [image, setImage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        // PLACEHOLDER: Petición POST a tu backend
        // Reemplaza la URL con la de tu backend cuando esté listo
        axios
            .post("http://localhost:4000/api/products", {
                name,
                region,
                description,
                price,
                offer,
                image,
            })
            .then((response) => {
                alert("Producto agregado con éxito");
                // Puedes limpiar el formulario o redirigir al Marketplace
            })
            .catch((error) => {
                console.error("Error al agregar producto:", error);
            });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Publicar Nuevo Producto
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Nombre del Producto"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Región"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    fullWidth
                    multiline
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Precio"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Oferta (opcional)"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="URL de la Imagen"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    fullWidth
                    sx={{ mb: 2 }}
                />

                <Button type="submit" variant="contained">
                    Agregar
                </Button>
            </form>
        </Box>
    );
}

export default AddProduct;
// src/pages/HomePage.jsx