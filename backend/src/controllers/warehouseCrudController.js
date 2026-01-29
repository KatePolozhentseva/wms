
const { Op } = require('sequelize');
const Warehouse = require('../models/Warehouse');
const StockMovement = require('../models/StockMovement');
const Order = require('../models/Order');

const warehouseCrudController = {

  list: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;
      const { search } = req.query;

      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { location: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { rows, count } = await Warehouse.findAndCountAll({
        where,
        limit,
        offset,
        order: [['name', 'ASC']]
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
      console.error('Warehouses list error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении списка складов'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const warehouse = await Warehouse.findByPk(id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Склад не найден'
        });
      }

      res.json({
        success: true,
        data: warehouse
      });
    } catch (error) {
      console.error('Warehouse getById error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении склада'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, location } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Название склада обязательно'
        });
      }

      const existing = await Warehouse.findOne({ where: { name } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Склад с таким названием уже существует'
        });
      }

      const warehouse = await Warehouse.create({
        name,
        location: location || null
      });

      res.status(201).json({
        success: true,
        message: 'Склад успешно создан',
        data: warehouse
      });
    } catch (error) {
      console.error('Warehouse create error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании склада'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, location } = req.body;

      const warehouse = await Warehouse.findByPk(id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Склад не найден'
        });
      }

      if (name && name !== warehouse.name) {
        const existing = await Warehouse.findOne({ where: { name } });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Склад с таким названием уже существует'
          });
        }
      }

      await warehouse.update({
        name: name ?? warehouse.name,
        location: location ?? warehouse.location
      });

      res.json({
        success: true,
        message: 'Склад успешно обновлён',
        data: warehouse
      });
    } catch (error) {
      console.error('Warehouse update error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении склада'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const warehouse = await Warehouse.findByPk(id);
      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: 'Склад не найден'
        });
      }

      const movementCount = await StockMovement.count({
        where: { warehouse_id: id }
      });

      if (movementCount > 0) {
        return res.status(400).json({
          success: false,
          message:
            'Нельзя удалить склад, по которому уже есть складские операции'
        });
      }

      const orderCount = await Order.count({
        where: { warehouse_id: id }
      });

      if (orderCount > 0) {
        return res.status(400).json({
          success: false,
          message:
            'Нельзя удалить склад, к которому привязаны заказы'
        });
      }

      await warehouse.destroy();

      res.json({
        success: true,
        message: 'Склад успешно удалён'
      });
    } catch (error) {
      console.error('Warehouse delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении склада'
      });
    }
  }
};

module.exports = warehouseCrudController;
