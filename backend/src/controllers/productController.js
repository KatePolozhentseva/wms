// src/controllers/productController.js
const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');

const productController = {
  // GET /api/products
  list: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const {
        search,
        categoryId,
        isActive,
        sortBy = 'name',
        sortOrder = 'asc',
      } = req.query;

      const where = {};

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { sku: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (categoryId) {
        where.category_id = categoryId;
      }

      if (typeof isActive !== 'undefined') {
        if (isActive === 'true' || isActive === true) {
          where.is_active = true;
        } else if (isActive === 'false' || isActive === false) {
          where.is_active = false;
        }
      }

      const sortableFields = ['name', 'sku', 'created_at'];
      const orderField = sortableFields.includes(sortBy) ? sortBy : 'name';
      const orderDirection =
        sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

      const { rows, count } = await Product.findAndCountAll({
        where,
        offset,
        limit,
        order: [[orderField, orderDirection]],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name'],
          },
        ],
      });

      res.json({
        success: true,
        data: {
          items: rows,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit) || 1,
          },
        },
      });
    } catch (error) {
      console.error('Product list error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении списка товаров',
      });
    }
  },

  // GET /api/products/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Product getById error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении товара',
      });
    }
  },

  // POST /api/products
  create: async (req, res) => {
    try {
      const { sku, name, description, unit, category_id, is_active } = req.body;

      if (!sku || !name || !unit) {
        return res.status(400).json({
          success: false,
          message: 'Поля SKU, название и единица измерения обязательны',
        });
      }

      const existing = await Product.findOne({ where: { sku } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Товар с таким SKU уже существует',
        });
      }

      if (category_id) {
        const category = await Category.findByPk(category_id);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Указанная категория не найдена',
          });
        }
      }

      const product = await Product.create({
        sku,
        name,
        description: description || null,
        unit,
        category_id: category_id || null,
        is_active: typeof is_active === 'boolean' ? is_active : true,
      });

      res.status(201).json({
        success: true,
        message: 'Товар успешно создан',
        data: product,
      });
    } catch (error) {
      console.error('Product create error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании товара',
      });
    }
  },

  // PUT /api/products/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { sku, name, description, unit, category_id, is_active } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден',
        });
      }

      // Проверка SKU на уникальность
      if (sku && sku !== product.sku) {
        const existing = await Product.findOne({ where: { sku } });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Товар с таким SKU уже существует',
          });
        }
      }

      if (category_id) {
        const category = await Category.findByPk(category_id);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Указанная категория не найдена',
          });
        }
      }

      await product.update({
        sku: sku ?? product.sku,
        name: name ?? product.name,
        description: description ?? product.description,
        unit: unit ?? product.unit,
        category_id: category_id ?? product.category_id,
        is_active:
          typeof is_active === 'boolean' ? is_active : product.is_active,
      });

      res.json({
        success: true,
        message: 'Товар успешно обновлён',
        data: product,
      });
    } catch (error) {
      console.error('Product update error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении товара',
      });
    }
  },

  // DELETE /api/products/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Товар не найден',
        });
      }

      await product.destroy();

      res.json({
        success: true,
        message: 'Товар успешно удалён',
      });
    } catch (error) {
      console.error('Product delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении товара',
      });
    }
  },
};

module.exports = productController;
