
const { Op } = require('sequelize');
const Supplier = require('../models/Supplier');
const StockMovement = require('../models/StockMovement');

const supplierController = {
  // GET /api/suppliers?page=&limit=&search=
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
          { contact_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { phone: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { rows, count } = await Supplier.findAndCountAll({
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
      console.error('Suppliers list error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении списка поставщиков'
      });
    }
  },


  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Поставщик не найден'
        });
      }

      res.json({
        success: true,
        data: supplier
      });
    } catch (error) {
      console.error('Supplier getById error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении поставщика'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, contact_name, email, phone, address } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Название поставщика обязательно'
        });
      }

      const supplier = await Supplier.create({
        name,
        contact_name: contact_name || null,
        email: email || null,
        phone: phone || null,
        address: address || null
      });

      res.status(201).json({
        success: true,
        message: 'Поставщик успешно создан',
        data: supplier
      });
    } catch (error) {
      console.error('Supplier create error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании поставщика'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, contact_name, email, phone, address } = req.body;

      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Поставщик не найден'
        });
      }

      await supplier.update({
        name: name ?? supplier.name,
        contact_name: contact_name ?? supplier.contact_name,
        email: email ?? supplier.email,
        phone: phone ?? supplier.phone,
        address: address ?? supplier.address
      });

      res.json({
        success: true,
        message: 'Поставщик успешно обновлён',
        data: supplier
      });
    } catch (error) {
      console.error('Supplier update error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении поставщика'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Поставщик не найден'
        });
      }

      const movementCount = await StockMovement.count({
        where: { supplier_id: id }
      });

      if (movementCount > 0) {
        return res.status(400).json({
          success: false,
          message:
            'Нельзя удалить поставщика, по которому уже есть операции приемки'
        });
      }

      await supplier.destroy();

      res.json({
        success: true,
        message: 'Поставщик успешно удалён'
      });
    } catch (error) {
      console.error('Supplier delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении поставщика'
      });
    }
  }
};

module.exports = supplierController;
