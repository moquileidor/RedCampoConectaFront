import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';
import Footer from '../components/footer/Footer';
import { Container, Grid, Paper, Typography, Box, Button, CircularProgress, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import axios from 'axios';
import authService from '../services/authService';
import HomeIcon from '@mui/icons-material/Home';

// Registrar componentes necesarios de Chart.js
Chart.register(...registerables);

export default function GraficasDatosEnergia() {
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [backendDisponible, setBackendDisponible] = useState(false);
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState('');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('ultimo-mes');
  
  // Obtener filtros de localStorage (si existen)
  const storedFilters = JSON.parse(localStorage.getItem('energyFilters')) || {};
  
  // Estados para los filtros
  const [filters, setFilters] = useState({
    emprendimientoId: storedFilters.emprendimientoId || '',
    startDate: storedFilters.startDate || '',
    endDate: storedFilters.endDate || '',
    dataType: storedFilters.dataType || 'both' // 'production', 'consumption', or 'both'
  });

  // Verificar si el usuario es administrador
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    const userObj = authService.getCurrentUser();
    if (userObj && userObj.rol) {
      setEsAdmin(userObj.rol === 'ROLE_ADMIN');
      console.log('Usuario con rol:', userObj.rol, 'Es admin:', userObj.rol === 'ROLE_ADMIN');
    }
  }, []);

  // Verificamos una sola vez si el backend está disponible
  useEffect(() => {
    const verificarBackend = async () => {
      try {
        // Intentamos hacer una petición al backend
        await axios.get('http://localhost:8080/api/health-check', { timeout: 2000 });
        setBackendDisponible(true);
      } catch (error) {
        console.log("Backend no disponible, usando datos de ejemplo");
        setBackendDisponible(false);
        // Cargar datos de ejemplo inmediatamente
        const exampleData = generateExampleData();
        procesarDatos(exampleData);
        setDataLoaded(true);
        setLoading(false);
      }
    };
    
    verificarBackend();
  }, []);

  useEffect(() => {
    const obtenerEmprendimientos = async () => {
      try {
        const response = await axios.get('http://localhost:8080/emprendimientos');
        setEmprendimientos(response.data);
      } catch (error) {
        console.error('Error al obtener emprendimientos:', error);
        setError('No se pudieron cargar los emprendimientos. Por favor, inténtelo más tarde.');
      }
    };

    obtenerEmprendimientos();
  }, []);

  useEffect(() => {
    obtenerDatosEnergia();
  }, [emprendimientoSeleccionado, periodoSeleccionado]);

  const obtenerDatosEnergia = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Calcular fechas según el periodo seleccionado
      const fechaHasta = new Date();
      let fechaDesde = new Date();
      
      switch (periodoSeleccionado) {
        case 'ultima-semana':
          fechaDesde.setDate(fechaDesde.getDate() - 7);
          break;
        case 'ultimo-mes':
          fechaDesde.setMonth(fechaDesde.getMonth() - 1);
          break;
        case 'ultimo-año':
          fechaDesde.setFullYear(fechaDesde.getFullYear() - 1);
          break;
        default:
          fechaDesde.setMonth(fechaDesde.getMonth() - 1);
      }
      
      const fechaInicioStr = fechaDesde.toISOString().split('T')[0];
      const fechaFinStr = fechaHasta.toISOString().split('T')[0];
      
      console.log("Consultando datos de energía para el periodo:", {
        fechaInicio: fechaInicioStr,
        fechaFin: fechaFinStr,
        emprendimiento: emprendimientoSeleccionado || 'todos'
      });
      
      // Intentar cargar los datos existentes
      try {
        // Usar método POST en lugar de GET
        const response = await axios.post(`http://localhost:8080/produccionconsumoenergia/consultar`, {
          fechaInicio: fechaInicioStr,
          fechaFin: fechaFinStr,
          emprendimientoId: emprendimientoSeleccionado || null
        }, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': authService.isAuthenticated() ? `Bearer ${authService.getToken()}` : ''
          }
        });
        
        console.log("Datos recibidos del servidor:", response.data);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Filtrar los datos según los criterios seleccionados
          let datosFiltrados = response.data;
          
          if (emprendimientoSeleccionado) {
            datosFiltrados = datosFiltrados.filter(item => 
              item.idemprendimiento == emprendimientoSeleccionado ||
              item.emprendimientoId == emprendimientoSeleccionado
            );
          }
          
          // Filtrar por fecha
          datosFiltrados = datosFiltrados.filter(item => {
            const fecha = new Date(item.fecha);
            return fecha >= fechaDesde && fecha <= fechaHasta;
          });
          
          console.log("Datos filtrados por periodo y emprendimiento:", datosFiltrados);
          
          if (datosFiltrados.length > 0) {
            procesarDatos(datosFiltrados);
          } else {
            console.log("No hay datos para los filtros seleccionados, usando datos de ejemplo");
            procesarDatos(generateExampleData());
          }
        } else {
          console.log("No se recibieron datos válidos del servidor, usando datos de ejemplo");
          procesarDatos(generateExampleData());
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
        console.log("Usando datos de ejemplo debido al error");
        procesarDatos(generateExampleData());
      }
    } catch (error) {
      console.error('Error general al obtener datos:', error);
      setError('No se pudieron cargar los datos de energía. Se muestran datos de ejemplo.');
      procesarDatos(generateExampleData());
    } finally {
      setLoading(false);
    }
  };

  const procesarDatos = (datos) => {
    if (!datos || datos.length === 0) {
      setFilteredData([]);
      setChartData(null);
      return;
    }

    console.log("Procesando datos:", datos);

    // Ordenar los datos por fecha
    datos.sort((a, b) => {
      // Manejar diferentes formatos de fecha
      const fechaA = a.fecha || a.fecha_registro;
      const fechaB = b.fecha || b.fecha_registro;
      return new Date(fechaA) - new Date(fechaB);
    });

    // Mapear los campos según los nombres reales en la base de datos
    const datosFormateados = datos.map(item => {
      return {
        fecha: item.fecha || '',
        produccion: ('produccion_energia' in item) ? Number(item.produccion_energia) : 
                   ('produccion' in item) ? Number(item.produccion) : 0,
        consumo: ('consumo_energia' in item) ? Number(item.consumo_energia) : 
                ('consumo' in item) ? Number(item.consumo) : 0,
        emprendimientoId: item.idemprendimiento || item.emprendimientoId || 0,
        fuente: item.fuente_energia || '',
        observaciones: item.observaciones || ''
      };
    });

    console.log("Datos formateados:", datosFormateados);

    // Extraer fechas y valores
    const labels = datosFormateados.map(item => {
      const fecha = new Date(item.fecha);
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    });

    const produccionData = datosFormateados.map(item => item.produccion);
    const consumoData = datosFormateados.map(item => item.consumo);

    // Preparar datasets para Chart.js
    const datasets = [
      {
        label: 'Producción (kWh)',
        data: produccionData,
        borderColor: '#28A745',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Consumo (kWh)',
        data: consumoData,
        borderColor: '#6BB190',
        backgroundColor: 'rgba(107, 177, 144, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }
    ];

    setFilteredData(datosFormateados);
    setChartData({
      labels,
      datasets
    });
  };

  // Función para generar datos de ejemplo si no hay datos reales
  const generateExampleData = () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');
    const exampleData = [];
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Simular producción y consumo con fluctuaciones estacionales
      const month = currentDate.getMonth();
      // Más producción en meses de verano, menos en invierno
      const productionBase = month >= 4 && month <= 8 ? 85 : 45; 
      // Más consumo en invierno, menos en verano
      const consumptionBase = month >= 10 || month <= 2 ? 75 : 40;
      
      // Añadir algo de aleatoriedad
      const production = productionBase + Math.random() * 20;
      const consumption = consumptionBase + Math.random() * 15;
      
      exampleData.push({
        fecha: new Date(currentDate).toISOString().split('T')[0],
        produccion: production,
        consumo: consumption
      });
      
      // Avanzar una semana
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return exampleData;
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Navegar a la página de registro
  const handleNavigateToRegister = () => {
    navigate('/registro-produccion-consumo');
  };

  // Calcular estadísticas básicas
  const calculateStats = () => {
    if (!filteredData || filteredData.length === 0) {
      return {
        avgProduction: 0,
        avgConsumption: 0,
        totalProduction: 0,
        totalConsumption: 0,
        balance: 0
      };
    }
    
    const totalProduction = filteredData.reduce((sum, item) => sum + (item.produccion || 0), 0);
    const totalConsumption = filteredData.reduce((sum, item) => sum + (item.consumo || 0), 0);
    const avgProduction = totalProduction / filteredData.length;
    const avgConsumption = totalConsumption / filteredData.length;
    const balance = totalProduction - totalConsumption;
    
    return {
      avgProduction: avgProduction.toFixed(2),
      avgConsumption: avgConsumption.toFixed(2),
      totalProduction: totalProduction.toFixed(2),
      totalConsumption: totalConsumption.toFixed(2),
      balance: balance.toFixed(2)
    };
  };
  
  const stats = calculateStats();

  const handleChangePeriodo = (event) => {
    setPeriodoSeleccionado(event.target.value);
  };

  const handleChangeEmprendimiento = (event) => {
    setEmprendimientoSeleccionado(event.target.value);
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Producción y Consumo de Energía',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Energía (kWh)',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Fecha',
        }
      }
    },
    maintainAspectRatio: false,
  };

  const handleVolverInicio = () => {
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NavBarUsuario />
      
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: '0.5rem', backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Estadísticas de Energía
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<HomeIcon />} 
                onClick={handleVolverInicio}
                sx={{ 
                  borderColor: '#6BB190',
                  color: '#6BB190',
                  '&:hover': { borderColor: '#5A9A7F', color: '#5A9A7F' } 
                }}
              >
                Volver a inicio
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/registro-produccion-consumo')}
                sx={{ 
                  bgcolor: '#6BB190', 
                  '&:hover': { bgcolor: '#5A9A7F' } 
                }}
              >
                Registrar nuevos datos
              </Button>
            </Box>
          </Box>
          
          <Typography variant="body1" paragraph textAlign="center" mb={4}>
            Analiza la producción y consumo de energía para tomar decisiones más sostenibles.
          </Typography>
          
          {/* Filtros */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2">ID Emprendimiento</Typography>
              <FormControl fullWidth>
                <InputLabel>Emprendimiento</InputLabel>
                <Select
                  value={emprendimientoSeleccionado}
                  label="Emprendimiento"
                  onChange={handleChangeEmprendimiento}
                >
                  <MenuItem value="">Todos los emprendimientos</MenuItem>
                  {emprendimientos.map((emp) => (
                    <MenuItem key={emp.idemprendimiento} value={emp.idemprendimiento}>
                      {emp.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2">Periodo</Typography>
              <FormControl fullWidth>
                <InputLabel>Periodo</InputLabel>
                <Select
                  value={periodoSeleccionado}
                  label="Periodo"
                  onChange={handleChangePeriodo}
                >
                  <MenuItem value="ultima-semana">Última semana</MenuItem>
                  <MenuItem value="ultimo-mes">Último mes</MenuItem>
                  <MenuItem value="ultimo-año">Último año</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2">Tipo de Datos</Typography>
              <select
                name="dataType"
                value={filters.dataType}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="both">Producción y Consumo</option>
                <option value="production">Solo Producción</option>
                <option value="consumption">Solo Consumo</option>
              </select>
            </Grid>
          </Grid>
          
          {/* Estadísticas */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ height: '100%', backgroundColor: 'var(--color-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2">Producción Total</Typography>
                  <Typography variant="h6" color="success.main">{stats.totalProduction} kWh</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ height: '100%', backgroundColor: 'var(--color-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2">Consumo Total</Typography>
                  <Typography variant="h6" color="primary.main">{stats.totalConsumption} kWh</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ height: '100%', backgroundColor: 'var(--color-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2">Balance</Typography>
                  <Typography 
                    variant="h6" 
                    color={parseFloat(stats.balance) >= 0 ? 'success.main' : 'error.main'}
                  >
                    {stats.balance} kWh
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ height: '100%', backgroundColor: 'var(--color-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2">Prod. Promedio</Typography>
                  <Typography variant="h6" color="success.main">{stats.avgProduction} kWh</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ height: '100%', backgroundColor: 'var(--color-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2">Cons. Promedio</Typography>
                  <Typography variant="h6" color="primary.main">{stats.avgConsumption} kWh</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ height: '100%', backgroundColor: 'var(--color-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleNavigateToRegister}
                    sx={{ 
                      textTransform: 'none',
                      backgroundColor: '#6BB190',
                      '&:hover': {
                        backgroundColor: '#4A9074',
                      }
                    }}
                  >
                    Registrar Datos
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Gráfico */}
          <Box sx={{ position: 'relative', height: 400, mb: 4, p: 2, border: '1px solid #E9ECEF', borderRadius: '0.5rem' }}>
            {loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1
              }}>
                <CircularProgress />
              </Box>
            )}
            
            {error && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                color: '#DC3545',
                zIndex: 1
              }}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}
            
            {chartData && (
              <Line
                data={chartData}
                options={options}
              />
            )}
          </Box>
          
          {/* Información adicional */}
          <Box sx={{ bgcolor: '#F8F9FA', p: 2, borderRadius: '0.5rem' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              ¿Cómo interpretar estos datos?
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>Producción:</strong> Cantidad de energía generada por fuentes renovables (solar, eólica, etc.)
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>Consumo:</strong> Cantidad de energía utilizada por el emprendimiento
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>Balance positivo:</strong> Indica que se produce más energía de la que se consume (sostenible)
            </Typography>
            <Typography variant="body2">
              • <strong>Balance negativo:</strong> Indica que se consume más energía de la que se produce
            </Typography>
          </Box>
        </Paper>
      </Container>
      
      <Footer />
    </div>
  );
} 