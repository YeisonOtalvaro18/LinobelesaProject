const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');
const connectDB = require('../db');
const { ObjectId } = require('mongodb');

// Dashboard principal con métricas
router.get('/metrics', 
  verificarToken, 
  verificarAdmin,
  async (req, res) => {
    try {
      const db = await connectDB();
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Métricas de usuarios
      const totalUsers = await db.collection('users').countDocuments();
      const activeUsers = await db.collection('users').countDocuments({ status: 'active' });
      const newUsersThisMonth = await db.collection('users').countDocuments({
        createdAt: { $gte: startOfMonth }
      });

      // Métricas de pedidos
      const totalOrders = await db.collection('pedidos').countDocuments();
      const ordersToday = await db.collection('pedidos').countDocuments({
        fechaPedido: { $gte: startOfDay }
      });
      const ordersThisWeek = await db.collection('pedidos').countDocuments({
        fechaPedido: { $gte: startOfWeek }
      });
      const ordersThisMonth = await db.collection('pedidos').countDocuments({
        fechaPedido: { $gte: startOfMonth }
      });

      // Métricas de productos
      const totalProducts = await db.collection('productos').countDocuments();
      const lowStockProducts = await db.collection('productos').countDocuments({
        stock: { $lte: 10, $gt: 0 }
      });
      const outOfStockProducts = await db.collection('productos').countDocuments({
        stock: 0
      });

      // Ingresos (aproximado basado en pedidos)
      const revenueToday = await db.collection('pedidos').aggregate([
        { $match: { fechaPedido: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]).toArray();

      const revenueThisMonth = await db.collection('pedidos').aggregate([
        { $match: { fechaPedido: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]).toArray();

      // Actividad reciente de administradores (simplificado)
      const recentAdminActivity = [];

      // Top productos por ventas
      const topProducts = await db.collection('pedidos').aggregate([
        { $unwind: "$productos" },
        { 
          $group: { 
            _id: "$productos.nombre", 
            totalSold: { $sum: "$productos.cantidad" },
            revenue: { $sum: { $multiply: ["$productos.cantidad", "$productos.precio"] } }
          } 
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
      ]).toArray();

      const metrics = {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          growthRate: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1) : 0
        },
        orders: {
          total: totalOrders,
          today: ordersToday,
          thisWeek: ordersThisWeek,
          thisMonth: ordersThisMonth
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
          stockHealth: totalProducts > 0 ? (((totalProducts - outOfStockProducts) / totalProducts) * 100).toFixed(1) : 0
        },
        revenue: {
          today: revenueToday[0]?.total || 0,
          thisMonth: revenueThisMonth[0]?.total || 0
        },
        recentActivity: recentAdminActivity,
        topProducts
      };

      res.json({
        success: true,
        data: metrics
      });

    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

// Gráficos y analíticas
router.get('/analytics/:period', 
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const { period } = req.params; // 'week', 'month', 'year'
      const db = await connectDB();
      
      let dateRange;
      let groupBy;
      
      switch (period) {
        case 'week':
          dateRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$fechaPedido" } };
          break;
        case 'month':
          dateRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$fechaPedido" } };
          break;
        case 'year':
          dateRange = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          groupBy = { $dateToString: { format: "%Y-%m", date: "$fechaPedido" } };
          break;
        default:
          return res.status(400).json({ success: false, message: 'Período inválido' });
      }

      // Datos de pedidos por período
      const ordersAnalytics = await db.collection('pedidos').aggregate([
        { $match: { fechaPedido: { $gte: dateRange } } },
        {
          $group: {
            _id: groupBy,
            orderCount: { $sum: 1 },
            revenue: { $sum: "$total" },
            averageOrder: { $avg: "$total" }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      // Datos de usuarios registrados por período
      const usersAnalytics = await db.collection('users').aggregate([
        { $match: { createdAt: { $gte: dateRange } } },
        {
          $group: {
            _id: groupBy,
            newUsers: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      res.json({
        success: true,
        data: {
          orders: ordersAnalytics,
          users: usersAnalytics,
          period
        }
      });

    } catch (error) {
      console.error('Error obteniendo analíticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

// Ruta de audit-logs eliminada

// Estadísticas del sistema
router.get('/system/stats',
  verificarToken,
  verificarAdmin,
  async (req, res) => {
    try {
      const db = await connectDB();

      // Datos simulados por ahora
      const hourlyActivity = [];
      const topActions = [];
      const activeUsers = [];

      res.json({
        success: true,
        data: {
          hourlyActivity,
          topActions,
          activeUsers
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

module.exports = router;