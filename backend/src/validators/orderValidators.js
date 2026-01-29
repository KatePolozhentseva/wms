
const { body, query } = require('express-validator');

const listOrdersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit 1-100'),
  query('status').optional().isString().isLength({ max: 50 }),
  query('warehouse_id').optional().isInt({ min: 1 })
];

const createOrderValidator = [
  body('warehouse_id')
    .isInt({ min: 1 }).withMessage('warehouse_id обязателен и должен быть числом'),
  body('customer_name')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Имя клиента слишком длинное'),
  body('items')
    .isArray({ min: 1 }).withMessage('Должен быть массив позиций items'),
  body('items.*.product_id')
    .isInt({ min: 1 }).withMessage('product_id каждой позиции должен быть числом'),
  body('items.*.quantity')
    .isFloat({ gt: 0 }).withMessage('quantity каждой позиции должен быть > 0'),
  body('items.*.unit_price')
    .optional()
    .isFloat({ gt: 0 }).withMessage('unit_price должен быть > 0')
];

const changeStatusValidator = [
  body('status')
    .notEmpty().withMessage('Статус обязателен')
    .isString().isLength({ max: 50 }).withMessage('Слишком длинный статус'),
  body('method')
    .optional()
    .isIn(['FIFO', 'LIFO']).withMessage('method должен быть FIFO или LIFO')
];

module.exports = {
  listOrdersValidator,
  createOrderValidator,
  changeStatusValidator
};
