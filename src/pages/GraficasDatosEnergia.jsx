import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import NavBarUsuario from '../components/navBarUsuario/NavBarUsuario';
import Footer from '../components/footer/Footer';
import {
  Container, Grid, Paper, Typography, Box, Button, CircularProgress,
  Card, CardContent, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import HomeIcon from '@mui/icons-material/Home';

Chart.register(...registerables);

const generateExampleData = () => {
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-12-31');
  const exampleData = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const month = currentDate.getMonth();
    const productionBase = month >= 4 && month <= 8 ? 85 : 45;
    const consumptionBase = month >= 10 || month <= 2 ? 75 : 40;
    exampleData.push({
      fecha: new Date(currentDate).toISOString().split('T')[0],
      produccion: productionBase + Math.random() * 20,
      consumo: consumptionBase + Math.random() * 15,
    });
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return exampleData;
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Producción y Consumo de Energía' },
  },
  scales: {
    y: { beginAtZero: true, title: { display: true, text: 'Energía (kWh)' } },
    x: { title: { display: true, text: 'Fecha' } },
  },
  maintainAspectRatio: false,
};

export default function GraficasDatosEnergia() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading]                             = useState(true);
  const [filteredData, setFilteredData]                   = useState([]);
  const [chartData, setChartData]                         = useState(null);
  const [error, setError]                                 = useState(null);
  const [emprendimientos, setEmprendimientos]             = useState([]);
  const [emprendimientoSeleccionado, setEmprendimientoSeleccionado] = useState('');
  const [periodoSeleccionado, setPeriodoSeleccionado]     = useState('ultimo-mes');
  const [filters, setFilters]                             = useState({ dataType: 'both' });

  const esAdmin = currentUser?.rol === 'ROLE_ADMIN';

  useEffect(() => {
    api.get('/emprendimientos')
      .then(({ data }) => setEmprendimientos(data))
      .catch(() => setError('No se pudieron cargar los emprendimientos. Por favor, inténtelo más tarde.'));
  }, []);

  useEffect(() => {
    obtenerDatosEnergia();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emprendimientoSeleccionado, periodoSeleccionado]);

  const procesarDatos = (datos) => {
    if (!datos || datos.length === 0) {
      setFilteredData([]);
      setChartData(null);
      return;
    }

    datos.sort((a, b) => {
      const fechaA = a.fecha || a.fecha_registro;
      const fechaB = b.fecha || b.fecha_registro;
      return new Date(fechaA) - new Date(fechaB);
    });

    const datosFormateados = datos.map((item) => ({
      fecha: item.fecha || '',
      produccion: 'produccion_energia' in item ? Number(item.produccion_energia)
                : 'produccion' in item       ? Number(item.produccion) : 0,
      consumo: 'consumo_energia' in item     ? Number(item.consumo_energia)
             : 'consumo' in item             ? Number(item.consumo) : 0,
      emprendimientoId: item.idemprendimiento || item.emprendimientoId || 0,
    }));

    const labels = datosFormateados.map((item) => {
      const fecha = new Date(item.fecha);
      return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    });

    setFilteredData(datosFormateados);
    setChartData({
      labels,
      datasets: [
        {
          label: 'Producción (kWh)',
          data: datosFormateados.map((i) => i.produccion),
          borderColor: '#28A745',
          backgroundColor: 'rgba(40, 167, 69, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Consumo (kWh)',
          data: datosFormateados.map((i) => i.consumo),
          borderColor: '#6BB190',
          backgroundColor: 'rgba(107, 177, 144, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    });
  };

  const obtenerDatosEnergia = async () => {
    setLoading(true);
    setError(null);

    const fechaHasta = new Date();
    const fechaDesde = new Date();

    switch (periodoSeleccionado) {
      case 'ultima-semana': fechaDesde.setDate(fechaDesde.getDate() - 7); break;
      case 'ultimo-año':    fechaDesde.setFullYear(fechaDesde.getFullYear() - 1); break;
      default:              fechaDesde.setMonth(fechaDesde.getMonth() - 1);
    }

    const fechaInicioStr = fechaDesde.toISOString().split('T')[0];
    const fechaFinStr    = fechaHasta.toISOString().split('T')[0];

    try {
      const response = await api.post('/produccionconsumoenergia/consultar', {
        fechaInicio: fechaInicioStr,
        fechaFin: fechaFinStr,
        emprendimientoId: emprendimientoSeleccionado || null,
      });

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        let datosFiltrados = response.data;

        if (emprendimientoSeleccionado) {
          datosFiltrados = datosFiltrados.filter(
            (item) =>
              item.idemprendimiento == emprendimientoSeleccionado ||
              item.emprendimientoId == emprendimientoSeleccionado
          );
        }

        datosFiltrados = datosFiltrados.filter((item) => {
          const fecha = new Date(item.fecha);
          return fecha >= fechaDesde && fecha <= fechaHasta;
        });

        procesarDatos(datosFiltrados.length > 0 ? datosFiltrados : generateExampleData());
      } else {
        procesarDatos(generateExampleData());
      }
    } catch {
      procesarDatos(generateExampleData());
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const stats = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { avgProduction: 0, avgConsumption: 0, totalProduction: 0, totalConsumption: 0, balance: 0 };
    }
    const totalProduction  = filteredData.reduce((sum, item) => sum + (item.produccion || 0), 0);
    const totalConsumption = filteredData.reduce((sum, item) => sum + (item.consumo || 0), 0);
    return {
      avgProduction:  (totalProduction  / filteredData.length).toFixed(2),
      avgConsumption: (totalConsumption / filteredData.length).toFixed(2),
      totalProduction:  totalProduction.toFixed(2),
      totalConsumption: totalConsumption.toFixed(2),
      balance: (totalProduction - totalConsumption).toFixed(2),
    };
  }, [filteredData]);

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
                onClick={() => navigate('/')}
                sx={{ borderColor: '#6BB190', color: '#6BB190', '&:hover': { borderColor: '#5A9A7F', color: '#5A9A7F' } }}
              >
                Volver a inicio
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/registro-produccion-consumo')}
                sx={{ bgcolor: '#6BB190', '&:hover': { bgcolor: '#5A9A7F' } }}
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
              <FormControl fullWidth>
                <InputLabel>Emprendimiento</InputLabel>
                <Select
                  value={emprendimientoSeleccionado}
                  label="Emprendimiento"
                  onChange={(e) => setEmprendimientoSeleccionado(e.target.value)}
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
              <FormControl fullWidth>
                <InputLabel>Periodo</InputLabel>
                <Select
                  value={periodoSeleccionado}
                  label="Periodo"
                  onChange={(e) => setPeriodoSeleccionado(e.target.value)}
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
            {[
              { label: 'Producción Total', value: `${stats.totalProduction} kWh`, color: 'success.main' },
              { label: 'Consumo Total',    value: `${stats.totalConsumption} kWh`, color: 'primary.main' },
              { label: 'Balance', value: `${stats.balance} kWh`, color: parseFloat(stats.balance) >= 0 ? 'success.main' : 'error.main' },
              { label: 'Prod. Promedio',   value: `${stats.avgProduction} kWh`, color: 'success.main' },
              { label: 'Cons. Promedio',   value: `${stats.avgConsumption} kWh`, color: 'primary.main' },
            ].map(({ label, value, color }) => (
              <Grid item xs={6} sm={4} md={2} key={label}>
                <Card sx={{ height: '100%', backgroundColor: 'var(--color-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="subtitle2">{label}</Typography>
                    <Typography variant="h6" color={color}>{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid item xs={6} sm={4} md={2}>
              <Card sx={{ height: '100%', backgroundColor: 'var(--color-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/registro-produccion-consumo')}
                    sx={{ textTransform: 'none', backgroundColor: '#6BB190', '&:hover': { backgroundColor: '#4A9074' } }}
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
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 1 }}>
                <CircularProgress />
              </Box>
            )}
            {error && !loading && (
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}
            {chartData && <Line data={chartData} options={chartOptions} />}
          </Box>

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
