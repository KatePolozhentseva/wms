/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Аутентификация и авторизация
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя (только для администратора или для первоначальной инициализации)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: manager@warehouse.com
 *               password:
 *                 type: string
 *                 example: manager123
 *               name:
 *                 type: string
 *                 example: "Менеджер Иванов"
 *               role:
 *                 type: string
 *                 description: Роль пользователя (admin/manager/storekeeper)
 *                 example: "manager"
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@warehouse.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверный email или пароль
 */




const { Router } = require('express');
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { loginValidator, registerValidator } = require('../validators/authValidators');
const { handleValidation } = require('../middleware/validationMiddleware');

const router = Router();

router.post("/login", loginValidator, handleValidation, authController.login);

router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/password', authenticateToken, authController.changePassword);

router.post(
  "/register",
  authenticateToken,
  authorizeRoles('admin'),
  registerValidator,
  handleValidation,
  authController.register
);

router.get('/', (req, res) => {
  res.json({
    message: 'Auth API is working',
    endpoints: {
      'POST /login': 'User login',
      'GET /me': 'Get current user (requires auth)',
      'PUT /profile': 'Update profile (requires auth)',
      'PUT /password': 'Change password (requires auth)',
      'POST /register': 'Register new user (requires admin role)'
    }
  });
});

module.exports = router;
