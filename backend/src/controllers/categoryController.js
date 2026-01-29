// src/controllers/categoryController.js
const { Op } = require('sequelize');
const Category = require('../models/Category');
const Product = require('../models/Product');

const categoryController = {
  // GET /api/categories
  list: async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const { search, parentId } = req.query;

      const where = {};

      if (search) {
        where.name = { [Op.iLike]: `%${search}%` };
      }

      if (parentId) {
        where.parent_id = parentId;
      }

      const { rows, count } = await Category.findAndCountAll({
        where,
        limit,
        offset,
        order: [['name', 'ASC']],
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
      console.error('Category list error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении списка категорий',
      });
    }
  },

  // GET /api/categories/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'children',
          },
        ],
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Категория не найдена',
        });
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('Category getById error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении категории',
      });
    }
  },

  // POST /api/categories
  create: async (req, res) => {
    try {
      const { name, description, parent_id } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Название категории обязательно',
        });
      }

      const existing = await Category.findOne({ where: { name } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Категория с таким названием уже существует',
        });
      }

      let parentCategory = null;
      if (parent_id) {
        parentCategory = await Category.findByPk(parent_id);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Родительская категория не найдена',
          });
        }
      }

      const category = await Category.create({
        name,
        description,
        parent_id: parent_id || null,
      });

      res.status(201).json({
        success: true,
        message: 'Категория успешно создана',
        data: category,
      });
    } catch (error) {
      console.error('Category create error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании категории',
      });
    }
  },

  // PUT /api/categories/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, parent_id } = req.body;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Категория не найдена',
        });
      }

      if (name && name !== category.name) {
        const existing = await Category.findOne({ where: { name } });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Категория с таким названием уже существует',
          });
        }
      }

      if (parent_id) {
        if (parseInt(parent_id, 10) === category.id) {
          return res.status(400).json({
            success: false,
            message: 'Категория не может быть родителем самой себя',
          });
        }

        const parentCategory = await Category.findByPk(parent_id);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Родительская категория не найдена',
          });
        }
      }

      await category.update({
        name: name ?? category.name,
        description: description ?? category.description,
        parent_id: parent_id ?? category.parent_id,
      });

      res.json({
        success: true,
        message: 'Категория успешно обновлена',
        data: category,
      });
    } catch (error) {
      console.error('Category update error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении категории',
      });
    }
  },

  // DELETE /api/categories/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Категория не найдена',
        });
      }

      // Проверим, нет ли дочерних категорий
      const childCount = await Category.count({ where: { parent_id: id } });
      if (childCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Нельзя удалить категорию, у которой есть дочерние категории',
        });
      }

      // Проверим, нет ли товаров в этой категории
      const productCount = await Product.count({ where: { category_id: id } });
      if (productCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Нельзя удалить категорию, к которой привязаны товары',
        });
      }

      await category.destroy();

      res.json({
        success: true,
        message: 'Категория успешно удалена',
      });
    } catch (error) {
      console.error('Category delete error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении категории',
      });
    }
  },
};

module.exports = categoryController;
