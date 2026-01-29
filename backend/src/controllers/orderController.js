// src/controllers/orderController.js
const { Op } = require('sequelize');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const OrderService = require('../services/orderService');

const orderController = {
  // GET /api/orders?page=&limit=&status=&warehouse_id=&search=
  list: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const { status, warehouse_id, search } = req.query;

      const where = {};
      if (status) {
        where.status = status;
      }
      if (warehouse_id) {
        where.warehouse_id = warehouse_id;
      }
      if (search) {
        where[Op.or] = [
          { order_number: { [Op.iLike]: `%${search}%` } },
          { customer_name: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { rows, count } = await Order.findAndCountAll({
        where,
        offset,
        limit,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Warehouse,
            as: 'warehouse',
            attributes: ['id', 'name']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          items: rows,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit) || 1
          }
        }
      });
    } catch (error) {
      console.error('Orders list error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении списка заказов'
      });
    }
  },

  // GET /api/orders/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const order = await Order.findByPk(id, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }]
          },
          {
            model: Warehouse,
            as: 'warehouse'
          },
          {
            model: OrderStatusHistory,
            as: 'status_history',
            order: [['changed_at', 'ASC']]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Order getById error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении заказа'
      });
    }
  },

  // POST /api/orders
  create: async (req, res) => {
    try {
      const userId = req.user.id;
      const order = await OrderService.createOrder(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Заказ успешно создан и товары зарезервированы',
        data: order
      });
    } catch (error) {
      console.error('Order create error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Ошибка при создании заказа'
      });
    }
  },

  // PUT /api/orders/:id 
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { customer_name } = req.body;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Заказ не найден'
        });
      }

      if (order.status === 'completed' || order.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message:
            'Нельзя менять заказ в статусе "completed" или "cancelled"'
        });
      }

      await order.update({
        customer_name: customer_name ?? order.customer_name
      });

      res.json({
        success: true,
        message: 'Заказ обновлён',
        data: order
      });
    } catch (error) {
      console.error('Order update error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении заказа'
      });
    }
  },

  // PATCH /api/orders/:id/status
  changeStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, method } = req.body; 
      const userId = req.user.id;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Статус обязателен'
        });
      }

      const order = await OrderService.changeStatus(
        id,
        status,
        userId,
        { method }
      );

      res.json({
        success: true,
        message: 'Статус заказа изменён',
        data: order
      });
    } catch (error) {
      console.error('Order changeStatus error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Ошибка при смене статуса заказа'
      });
    }
  }
};

module.exports = orderController;
