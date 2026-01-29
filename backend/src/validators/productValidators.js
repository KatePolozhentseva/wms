
const { body, query } = require('express-validator');

const listProductsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page должен быть >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit от 1 до 100')
];

const createProductValidator = [
  body('sku')
    .notEmpty().withMessage('SKU обязателен')
    .isLength({ max: 100 }).withMessage('SKU слишком длинный')
    .trim(),
  body('name')
    .notEmpty().withMessage('Название обязательно')
    .isLength({ max: 255 }).withMessage('Название слишком длинное')
    .trim(),
  body('unit')
    .notEmpty().withMessage('Единица измерения обязательна')
    .isLength({ max: 50 }).withMessage('unit слишком длинный')
    .trim(),
  body('description')
    .optional()
    .trim(),
  body('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('category_id должен быть числом')
];

const updateProductValidator = [
  body('sku').optional().isLength({ max: 100 }).withMessage('SKU слишком длинный').trim(),
  body('name').optional().isLength({ max: 255 }).withMessage('Название слишком длинное').trim(),
  body('unit').optional().isLength({ max: 50 }).withMessage('unit слишком длинный').trim(),
  body('description').optional().trim(),
  body('category_id').optional().isInt({ min: 1 }).withMessage('category_id должен быть числом'),
  body('is_active').optional().isBoolean().withMessage('is_active должен быть true/false')
];

module.exports = {
  listProductsValidator,
  createProductValidator,
  updateProductValidator
};
