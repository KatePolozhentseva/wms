/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Заказы
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Получить список заказов
 *     tags: [Orders]
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
 *         name: status
 *         schema:
 *           type: string
 *           description: Фильтр по статусу
 *     responses:
 *       200:
 *         description: Список заказов
 *
 *   post:
 *     summary: Создать новый заказ (с автозапуском резервирования)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - warehouse_id
 *               - items
 *             properties:
 *               warehouse_id:
 *                 type: integer
 *               customer_name:
 *                 type: string
 *                 example: "ООО Клиент"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Заказ создан
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Получить заказ по ID
 *     tags: [Orders]
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
 *         description: Заказ найден
 *       404:
 *         description: Заказ не найден
 */

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Изменить статус заказа
 *     tags: [Orders]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reserved, completed, cancelled]
 *               method:
 *                 type: string
 *                 enum: [FIFO, LIFO]
 *                 description: Метод списания при завершении заказа
 *                 example: FIFO
 *     responses:
 *       200:
 *         description: Статус обновлён
 *       400:
 *         description: Невозможно изменить статус
 *       404:
 *         description: Заказ не найден
 */
const { Router } = require('express');
const orderController = require('../controllers/orderController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validationMiddleware');
const {
  listOrdersValidator,
  createOrderValidator,
  changeStatusValidator
} = require('../validators/orderValidators');

const router = Router();


router.get(
  '/',
  authenticateToken,
  listOrdersValidator,
  handleValidation,
  orderController.list
);

router.get(
  '/:id',
  authenticateToken,
  orderController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'manager', 'storekeeper'),
  createOrderValidator,
  handleValidation,
  orderController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  orderController.update
);

router.patch(
  '/:id/status',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  changeStatusValidator,
  handleValidation,
  orderController.changeStatus
);

module.exports = router;
