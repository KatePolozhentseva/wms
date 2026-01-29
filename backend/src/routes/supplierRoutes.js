
const { Router } = require('express');
const supplierController = require('../controllers/supplierController');
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

const router = Router();

router.get(
  '/',
  authenticateToken,
  supplierController.list
);

router.get(
  '/:id',
  authenticateToken,
  supplierController.getById
);

router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  supplierController.create
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  supplierController.update
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  supplierController.delete
);

module.exports = router;
