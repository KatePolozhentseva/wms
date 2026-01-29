/**
 * @swagger
 * tags:
 *   name: Warehouse
 *   description: Складские операции
 */

/**
 * @swagger
 * /api/warehouse/receive:
 *   post:
 *     summary: Приёмка товара на склад
 *     tags: [Warehouse]
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
 *               - supplier_id
 *               - lines
 *             properties:
 *               warehouse_id:
 *                 type: integer
 *               supplier_id:
 *                 type: integer
 *               lines:
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
 *                     unit_price:
 *                       type: number
 *                     expiration_date:
 *                       type: string
 *                       format: date
 *     responses:
 *       200:
 *         description: Приёмка успешно проведена
 */

/**
 * @swagger
 * /api/warehouse/write-off:
 *   post:
 *     summary: Списание товара со склада
 *     tags: [Warehouse]
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
 *               - reason
 *               - lines
 *             properties:
 *               warehouse_id:
 *                 type: integer
 *               reason:
 *                 type: string
 *                 example: "Срок годности истёк"
 *               method:
 *                 type: string
 *                 enum: [FIFO, LIFO]
 *                 example: "FIFO"
 *               lines:
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
 *       200:
 *         description: Списание проведено
 */

/**
 * @swagger
 * /api/warehouse/inventory:
 *   post:
 *     summary: Проведение инвентаризации (корректировка остатков)
 *     tags: [Warehouse]
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
 *               - lines
 *             properties:
 *               warehouse_id:
 *                 type: integer
 *               lines:
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
 *       200:
 *         description: Инвентаризация проведена
 */

/**
 * @swagger
 * /api/warehouse/stock:
 *   get:
 *     summary: Получить текущие остатки по складу
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: warehouse_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Остатки (физический, резерв, доступно)
 */
const { Router } = require('express');
const warehouseController = require('../controllers/warehouseController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = Router();

router.get(
  '/stock',
  authenticateToken,
  warehouseController.getStock
);

router.post(
  '/receive',
  authenticateToken,
  authorizeRoles('admin', 'manager', 'storekeeper'),
  warehouseController.receive
);

router.post(
  '/write-off',
  authenticateToken,
  authorizeRoles('admin', 'manager', 'storekeeper'),
  warehouseController.writeOff
);

router.post(
  '/reserve',
  authenticateToken,
  authorizeRoles('admin', 'manager', 'storekeeper'),
  warehouseController.reserve
);

router.post(
  '/release',
  authenticateToken,
  authorizeRoles('admin', 'manager', 'storekeeper'),
  warehouseController.releaseReservation
);

router.post(
  '/inventory',
  authenticateToken,
  authorizeRoles('admin', 'manager', 'storekeeper'),
  warehouseController.inventory
);

module.exports = router;
