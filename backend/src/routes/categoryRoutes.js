/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Категории товаров
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Получить список категорий
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список категорий
 *
 *   post:
 *     summary: Создать категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Овощи"
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Категория создана
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Обновить категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Категория обновлена
 *       404:
 *         description: Категория не найдена
 *
 *   delete:
 *     summary: Удалить категорию
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Категория удалена
 *       400:
 *         description: Нельзя удалить категорию (есть дочерние или товары)
 */

const { Router } = require('express');
const categoryController = require('../controllers/categoryController');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/authMiddleware');

const router = Router();

router.get(
  '/',
  authenticateToken,
  categoryController.list
);

router.get(
  '/:id',
  authenticateToken,
  categoryController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  categoryController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  categoryController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  categoryController.delete
);

module.exports = router;
