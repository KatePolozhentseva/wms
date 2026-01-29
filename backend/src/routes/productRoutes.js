/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Управление товарами
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: Поиск по SKU или названию
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           description: Поле сортировки
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Список товаров с пагинацией
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - name
 *               - unit
 *             properties:
 *               sku:
 *                 type: string
 *                 example: "SKU-001"
 *               name:
 *                 type: string
 *                 example: "Яблоки свежие"
 *               description:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               unit:
 *                 type: string
 *                 example: "кг"
 *     responses:
 *       201:
 *         description: Товар успешно создан
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Товар найден
 *       404:
 *         description: Товар не найден
 *
 *   put:
 *     summary: Обновить товар
 *     tags: [Products]
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
 *               sku:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               unit:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Товар обновлён
 *       404:
 *         description: Товар не найден
 *
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
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
 *         description: Товар удалён
 *       404:
 *         description: Товар не найден
 */
const { Router } = require('express');
const productController = require('../controllers/productController');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validationMiddleware');
const {
  listProductsValidator,
  createProductValidator,
  updateProductValidator
} = require('../validators/productValidators');

const router = Router();

router.get(
  '/',
  authenticateToken,
  listProductsValidator,
  handleValidation,
  productController.list
);

router.get(
  '/:id',
  authenticateToken,
  productController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  createProductValidator,
  handleValidation,
  productController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  updateProductValidator,
  handleValidation,
  productController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  productController.delete
);

module.exports = router;
