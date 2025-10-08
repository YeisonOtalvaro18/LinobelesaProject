import React, { useState, useEffect } from 'react';
import { 
  FaChartLine, FaChartBar, FaUsers, FaShoppingCart, 
  FaArrowUp, FaArrowDown, FaCalendarAlt, FaDownload,
  FaArrowLeft
} from 'react-icons/fa';
import '../../styles/Analytics.css';

const Analytics = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('orders');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Usar datos simulados por ahora
      const mockAnalytics = {
        period: timeRange,
        orders: generateMockData(timeRange, 'orders'),
        users: generateMockData(timeRange, 'users'),
        revenue: generateMockData(timeRange, 'revenue'),
        summary: {
          totalOrders: 156,
          totalRevenue: 45600,
          newUsers: 23,
          conversionRate: 3.2,
          averageOrderValue: 292.31,
          topSellingCategory: 'Cuidado Capilar'
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (period, type) => {
    const points = period === 'week' ? 7 : period === 'month' ? 30 : 12;
    const data = [];
    
    for (let i = 0; i < points; i++) {
      let value;
      switch (type) {
        case 'orders':
          value = Math.floor(Math.random() * 20) + 5;
          break;
        case 'users':
          value = Math.floor(Math.random() * 10) + 2;
          break;
        case 'revenue':
          value = Math.floor(Math.random() * 3000) + 500;
          break;
        default:
          value = Math.floor(Math.random() * 100);
      }

      let label;
      if (period === 'week') {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        label = date.toLocaleDateString('es-ES', { weekday: 'short' });
      } else if (period === 'month') {
        label = `Día ${i + 1}`;
      } else {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        label = months[i];
      }

      data.push({ label, value, date: new Date() });
    }

    return data;
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'orders': return <FaShoppingCart />;
      case 'users': return <FaUsers />;
      case 'revenue': return <FaChartLine />;
      default: return <FaChartBar />;
    }
  };

  const getGrowthIndicator = (value) => {
    const isPositive = value > 0;
    return (
      <span className={`growth ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <FaArrowUp /> : <FaArrowDown />}
        {Math.abs(value)}%
      </span>
    );
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + analytics[selectedMetric].map(row => 
          `${row.label},${row.value}`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${selectedMetric}_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="analytics loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => onNavigate('admin-dashboard')}
          >
            <FaArrowLeft />
            Volver al Dashboard
          </button>
          <h1>Analíticas y Reportes</h1>
        </div>
        <div className="header-controls">
          <div className="time-selector">
            <FaCalendarAlt />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mes</option>
              <option value="year">Último Año</option>
            </select>
          </div>
          <button className="export-btn" onClick={exportData}>
            <FaDownload />
            Exportar
          </button>
        </div>
      </div>

      {analytics && (
        <>
          {/* Resumen de Métricas */}
          <div className="metrics-summary">
            <div className="metric-card">
              <div className="metric-icon orders">
                <FaShoppingCart />
              </div>
              <div className="metric-data">
                <h3>{analytics.summary.totalOrders}</h3>
                <p>Pedidos Totales</p>
                {getGrowthIndicator(12.5)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon revenue">
                <FaChartLine />
              </div>
              <div className="metric-data">
                <h3>${analytics.summary.totalRevenue.toLocaleString()}</h3>
                <p>Ingresos</p>
                {getGrowthIndicator(8.3)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon users">
                <FaUsers />
              </div>
              <div className="metric-data">
                <h3>{analytics.summary.newUsers}</h3>
                <p>Nuevos Usuarios</p>
                {getGrowthIndicator(15.7)}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon conversion">
                <FaChartBar />
              </div>
              <div className="metric-data">
                <h3>{analytics.summary.conversionRate}%</h3>
                <p>Tasa de Conversión</p>
                {getGrowthIndicator(-2.1)}
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="charts-section">
            <div className="chart-selector">
              <button 
                className={selectedMetric === 'orders' ? 'active' : ''}
                onClick={() => setSelectedMetric('orders')}
              >
                <FaShoppingCart />
                Pedidos
              </button>
              <button 
                className={selectedMetric === 'users' ? 'active' : ''}
                onClick={() => setSelectedMetric('users')}
              >
                <FaUsers />
                Usuarios
              </button>
              <button 
                className={selectedMetric === 'revenue' ? 'active' : ''}
                onClick={() => setSelectedMetric('revenue')}
              >
                <FaChartLine />
                Ingresos
              </button>
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3>
                  {getMetricIcon(selectedMetric)}
                  {selectedMetric === 'orders' && 'Pedidos'}
                  {selectedMetric === 'users' && 'Usuarios Nuevos'}  
                  {selectedMetric === 'revenue' && 'Ingresos'}
                  - {timeRange === 'week' ? 'Última Semana' : timeRange === 'month' ? 'Último Mes' : 'Último Año'}
                </h3>
              </div>
              
              <div className="simple-chart">
                <div className="chart-bars">
                  {analytics[selectedMetric].map((point, index) => {
                    const maxValue = Math.max(...analytics[selectedMetric].map(p => p.value));
                    const height = (point.value / maxValue) * 100;
                    
                    return (
                      <div key={index} className="chart-bar-container">
                        <div 
                          className={`chart-bar ${selectedMetric}`}
                          style={{ height: `${height}%` }}
                          title={`${point.label}: ${point.value}`}
                        ></div>
                        <span className="bar-label">{point.label}</span>
                        <span className="bar-value">{point.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="insights-section">
            <h2>Insights y Tendencias</h2>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>Mejor Día de Ventas</h4>
                <p>Viernes con un promedio de {Math.max(...analytics.orders.map(o => o.value))} pedidos</p>
              </div>
              <div className="insight-card">
                <h4>Categoría Top</h4>
                <p>{analytics.summary.topSellingCategory} representa el 35% de las ventas</p>
              </div>
              <div className="insight-card">
                <h4>Ticket Promedio</h4>
                <p>${analytics.summary.averageOrderValue} por pedido</p>
              </div>
              <div className="insight-card">
                <h4>Crecimiento</h4>
                <p>+12.5% en pedidos comparado con el período anterior</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;