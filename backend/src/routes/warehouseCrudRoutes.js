/**
 * @swagger
 * tags:
 *   name: Warehouses
 *   description: Справочник складов
 */

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Получить список складов
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список складов
 *
 *   post:
 *     summary: Создать склад
 *     tags: [Warehouses]
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
 *                 example: "Главный склад"
 *               location:
 *                 type: string
 *                 example: "Москва"
 *     responses:
 *       201:
 *         description: Склад создан
 */

/**
 * @swagger
 * /api/warehouses/{id}:
 *   put:
 *     summary: Обновить склад
 *     tags: [Warehouses]
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
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Склад обновлён
 *       404:
 *         description: Склад не найден
 *
 *   delete:
 *     summary: Удалить склад
 *     tags: [Warehouses]
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
 *         description: Склад удалён
 *       400:
 *         description: Нельзя удалить (есть движения/заказы)
 */

const { Router } = require('express');
const warehouseCrudController = require('../controllers/warehouseCrudController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = Router();


router.get(
  '/',
  authenticateToken,
  warehouseCrudController.list
);

router.get(
  '/:id',
  authenticateToken,
  warehouseCrudController.getById
);


router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  warehouseCrudController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  warehouseCrudController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  warehouseCrudController.delete
);

module.exports = router;
