
const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const Role = require('../models/Role');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Требуется токен доступа'
      });
    }

    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }],
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({
      success: false,
      message: 'Недействительный или просроченный токен'
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется аутентификация'
      });
    }

    if (!req.user.role) {
      const userWithRole = await User.findByPk(req.user.id, {
        include: [{ model: Role, as: 'role' }]
      });
      req.user.role = userWithRole.role;
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для выполнения операции'
      });
    }

    next();
  };
};

const requirePermission = (requiredPermission) => {
  const rolePermissions = {
    admin: ['read', 'write', 'delete', 'manage_users', 'manage_inventory'],
    manager: ['read', 'write', 'manage_inventory'],
    storekeeper: ['read', 'manage_inventory'] 
  };

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Требуется аутентификация'
      });
    }

    const userRole = req.user.role.name;
    const permissions = rolePermissions[userRole] || [];

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  requirePermission
};
