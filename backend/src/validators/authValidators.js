
const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .isEmail().withMessage('Некорректный email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов')
];

const registerValidator = [
  body('email')
    .isEmail().withMessage('Некорректный email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Слишком длинное имя'),
  body('role_id')
    .isInt({ min: 1 }).withMessage('role_id должен быть числом')
];

module.exports = {
  loginValidator,
  registerValidator
};
