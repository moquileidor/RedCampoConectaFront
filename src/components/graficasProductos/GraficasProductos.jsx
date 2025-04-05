import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import './GraficasProductos.css'; // Importa tus estilos aquí

export default function GraficasProductos() {
  const [productos, setProductos] = useState([]);

  // Simula la carga de datos desde el archivo JSON
  useEffect(() => {
    const data = {
      productos: [
        { nombre: "Maíz", categoria: "Cereales", cantidad_vendida: 5000, precio_unitario: 15 },
        { nombre: "Frijol", categoria: "Legumbres", cantidad_vendida: 3000, precio_unitario: 20 },
        { nombre: "Papa", categoria: "Tubérculos", cantidad_vendida: 4500, precio_unitario: 10 },
        { nombre: "Tomate", categoria: "Verduras", cantidad_vendida: 6000, precio_unitario: 8 },
        { nombre: "Lechuga", categoria: "Verduras", cantidad_vendida: 3500, precio_unitario: 5 },
        { nombre: "Plátano", categoria: "Frutas", cantidad_vendida: 4000, precio_unitario: 12 }
      ]
    };
    setProductos(data.productos);
  }, []);

  // Verificamos los datos de productos
  useEffect(() => {
    console.log(productos);  // Verificamos los datos cargados
  }, [productos]);

  // Colores personalizados para las barras
  const colores = [
    "#A8D9C7", "#6BB190", "#204B3A", "#8C5B2D", "#D3A266", "#A8D9C7"
  ];

  // Crear los datos para la gráfica
  const chartData = {
    labels: productos.map(producto => producto.nombre),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: productos.map(producto => producto.cantidad_vendida),
        backgroundColor: colores,
        borderColor: colores,
        borderWidth: 1
      }
    ]
  };

  return (
    <section className='seccion-informacion-grafica'>
      <div className="contenedor">
        <div className='contenedor-info-graf'>
          <h2>Gráfico de Productos Más Vendidos</h2>
          <div className="grafica-container">
            {productos.length > 0 ? (
              <Bar data={chartData} options={{ responsive: true }} />
            ) : (
              <p>Cargando datos...</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
