import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';

// Registrar componentes necesarios de Chart.js
Chart.register(...registerables);

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  
  // Estados para los diferentes tipos de datos
  const [emprendimientosPorRegion, setEmprendimientosPorRegion] = useState({});
  const [porcentajeEmprendimientos, setPorcentajeEmprendimientos] = useState({});
  const [topPaises, setTopPaises] = useState({});
  const [produccionEnergia, setProduccionEnergia] = useState({});

  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
    
    // Esperar un poco para simular carga de datos
    const timer = setTimeout(() => {
      // Cargar datos de demostración
      generateMockData();
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Función para generar datos de demostración
  const generateMockData = () => {
    // Datos de ejemplo para emprendimientos por región
    setEmprendimientosPorRegion({
      labels: ['Antioquia', 'Bogotá', 'Valle del Cauca', 'Atlántico', 'Santander'],
      datasets: [
        {
          label: 'Número de Emprendimientos',
          data: [65, 59, 80, 81, 56],
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    });
    
    // Datos de ejemplo para porcentaje de emprendimientos
    setPorcentajeEmprendimientos({
      labels: ['Antioquia', 'Bogotá', 'Valle del Cauca', 'Atlántico', 'Santander'],
      datasets: [
        {
          label: 'Porcentaje de Emprendimientos',
          data: [25, 35, 15, 10, 15],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    });
    
    // Datos de ejemplo para top países
    setTopPaises({
      labels: ['Estados Unidos', 'China', 'India', 'Reino Unido', 'Alemania', 'Colombia', 'Brasil', 'México', 'Canadá', 'Francia'],
      datasets: [
        {
          label: 'Cantidad de Emprendimientos',
          data: [120, 115, 95, 85, 80, 75, 70, 65, 60, 55],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    });
    
    // Datos de ejemplo para producción de energía
    setProduccionEnergia({
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
      datasets: [
        {
          label: 'Producción de Energía (kWh)',
          data: [1200, 1900, 3000, 5000, 2000, 3000],
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1
        },
        {
          label: 'Consumo de Energía (kWh)',
          data: [1000, 1500, 2000, 4000, 1000, 2000],
          fill: false,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          tension: 0.1
        }
      ]
    });
  };

  // Opciones generales para los gráficos
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Estadísticas de Emprendimientos',
      },
    },
  };

  return (
    <>
      <NavBarUsuario />
      <div className="container mt-4">
        <h1 className="text-center mb-4">Dashboard de Emprendimientos</h1>
        
        <div className="alert alert-info mb-4">
          <strong>Nota:</strong> Este dashboard muestra datos de demostración para visualizar las estadísticas de emprendimientos y energía. Los datos reales se integrarán en la próxima actualización.
        </div>
        
        {loading ? (
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="mt-2">Cargando datos...</p>
          </div>
        ) : (
          <>
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-dark text-white">
                    <h5 className="card-title mb-0">Información del Proyecto</h5>
                  </div>
                  <div className="card-body">
                    <p>Este sistema permite la visualización y gestión de datos sobre el emprendimiento y la innovación a nivel global y local. Utilizando principios de programación orientada a objetos con Java, bases de datos relacionales y tecnologías web modernas.</p>
                    <p>Los gráficos muestran información sobre:</p>
                    <ul>
                      <li>Distribución de emprendimientos por región</li>
                      <li>Porcentaje de emprendimientos por región</li>
                      <li>Top 10 países con mayor emprendimiento</li>
                      <li>Producción y consumo de energía</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row g-4">
              {/* Gráfico de Emprendimientos por Región */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="card-title mb-0">Emprendimientos por Región</h5>
                  </div>
                  <div className="card-body">
                    <Bar data={emprendimientosPorRegion} options={options} />
                  </div>
                </div>
              </div>
              
              {/* Gráfico de Porcentaje de Emprendimientos */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-success text-white">
                    <h5 className="card-title mb-0">Porcentaje de Emprendimientos por Región</h5>
                  </div>
                  <div className="card-body">
                    <Pie data={porcentajeEmprendimientos} options={options} />
                  </div>
                </div>
              </div>
              
              {/* Gráfico de Top 10 Países */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="card-title mb-0">Top 10 Países con Mayor Emprendimiento</h5>
                  </div>
                  <div className="card-body">
                    <Bar data={topPaises} options={options} />
                  </div>
                </div>
              </div>
              
              {/* Gráfico de Producción/Consumo de Energía */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-info text-white">
                    <h5 className="card-title mb-0">Producción y Consumo de Energía</h5>
                  </div>
                  <div className="card-body">
                    <Line data={produccionEnergia} options={options} />
                  </div>
                </div>
              </div>
              
              {/* Tabla de Datos */}
              <div className="col-12 mb-4">
                <div className="card">
                  <div className="card-header bg-secondary text-white">
                    <h5 className="card-title mb-0">Tabla de Datos - Emprendimientos por Región</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>Región</th>
                            <th>Cantidad</th>
                            <th>Porcentaje</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Antioquia</td>
                            <td>65</td>
                            <td>25%</td>
                          </tr>
                          <tr>
                            <td>Bogotá</td>
                            <td>59</td>
                            <td>35%</td>
                          </tr>
                          <tr>
                            <td>Valle del Cauca</td>
                            <td>80</td>
                            <td>15%</td>
                          </tr>
                          <tr>
                            <td>Atlántico</td>
                            <td>81</td>
                            <td>10%</td>
                          </tr>
                          <tr>
                            <td>Santander</td>
                            <td>56</td>
                            <td>15%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
} 