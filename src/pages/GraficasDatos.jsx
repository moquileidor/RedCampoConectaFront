import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Registrar componentes necesarios de Chart.js
Chart.register(...registerables);

export default function GraficasDatos() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datosTipos, setDatosTipos] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        console.log("Intentando conectar a: http://localhost:8080/api/dashboard/emprendimientos-datos");
        
        const token = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null;
        if (!token) {
          console.error('No hay token de autenticación');
          // Usar datos de prueba en caso de error
          cargarDatosPrueba();
          return;
        }
        
        // Configurar el token en las cabeceras
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        const response = await axios.get('http://localhost:8080/api/dashboard/emprendimientos-datos', config);
        console.log("Datos recibidos:", response.data);
        
        // Procesar datos para los gráficos
        procesarDatos(response.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        // Usar datos de prueba en caso de error
        cargarDatosPrueba();
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Emprendimientos por Tipo',
        font: {
          size: 18
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  const cargarDatosPrueba = () => {
    // Datos de ejemplo para mostrar cuando no hay datos reales
    const datosEjemplo = {
      labels: ['Tecnología', 'Agricultura', 'Servicios', 'Manufactura', 'Otro'],
      datasets: [
        {
          label: 'Emprendimientos por Tipo (Ejemplo)',
          data: [3, 5, 2, 1, 4],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    setDatosTipos(datosEjemplo);
    setError("Se están mostrando datos de ejemplo. No se pudieron cargar datos reales.");
  };

  const procesarDatos = (datos) => {
    // Procesar los datos recibidos del backend
    if (!datos || !datos.labels || !datos.datos) {
      cargarDatosPrueba();
      return;
    }
    
    // Crear objeto de datos para Chart.js
    const datosChart = {
      labels: datos.labels,
      datasets: [
        {
          label: 'Emprendimientos por Tipo',
          data: datos.datos,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    setDatosTipos(datosChart);
  };

  return (
    <>
      <NavBarUsuario />
      <div className="container mt-4">
        <h1 className="text-center mb-4">Análisis de Emprendimientos</h1>
        
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando datos...</p>
          </div>
        ) : (
          <div className="row">
            <div className="col-md-10 mx-auto">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">Distribución de Emprendimientos por Tipo</h5>
                </div>
                <div className="card-body">
                  {error && (
                    <div className="alert alert-warning">
                      <p><strong>Nota:</strong> {error}</p>
                      <p>Mostrando datos de ejemplo para visualización.</p>
                    </div>
                  )}
                  
                  <div className="text-center" style={{ height: '400px' }}>
                    {datosTipos && <Pie data={datosTipos} options={options} />}
                  </div>
                  
                  <div className="mt-4">
                    <h6>Análisis:</h6>
                    <p>
                      Esta gráfica muestra la distribución de emprendimientos por tipo, 
                      permitiendo identificar qué sectores tienen mayor representación 
                      en nuestra plataforma.
                    </p>
                    
                    <div className="d-flex justify-content-between mt-4">
                      <Link to="/estadisticas-energia" className="btn btn-info text-white">
                        Ver Estadísticas de Energía
                      </Link>
                      <Link to="/registro-produccion-consumo" className="btn btn-primary">
                        Registrar Producción/Consumo de Energía
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 