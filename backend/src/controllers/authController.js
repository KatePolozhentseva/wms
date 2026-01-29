
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Role = require('../models/Role');
const { generateToken } = require('../utils/jwtUtils');

const authController = {
  // Регистрация пользователя (только для админа)
  register: async (req, res) => {
    try {
      const { email, password, name, role_id } = req.body;

      if (!email || !password || !role_id) {
        return res.status(400).json({
          success: false,
          message: 'Email, пароль и роль обязательны'
        });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким email уже существует'
        });
      }

      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Указанная роль не существует'
        });
      }

      const password_hash = await bcrypt.hash(password, 12);

      const user = await User.create({
        email,
        password_hash,
        name,
        role_id
      });

      const userWithRole = await User.findByPk(user.id, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password_hash'] }
      });

      const token = generateToken(userWithRole);

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: {
          user: userWithRole.toSafeObject
            ? userWithRole.toSafeObject()
            : userWithRole,
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера при регистрации'
      });
    }
  },

  // Логин
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email и пароль обязательны'
        });
      }

      const user = await User.findOne({
        where: { email },
        include: [{ model: Role, as: 'role' }]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Неверные учетные данные'
        });
      }

      const isPasswordValid = await user.checkPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Неверные учетные данные'
        });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        message: 'Вход выполнен успешно',
        data: {
          user: user.toSafeObject ? user.toSafeObject() : {
            id: user.id,
            email: user.email,
            name: user.name,
            role_id: user.role_id,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера при входе'
      });
    }
  },

  // Текущий пользователь
  getMe: async (req, res) => {
    try {
      const userWithRole = await User.findByPk(req.user.id, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password_hash'] }
      });

      if (!userWithRole) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      res.json({
        success: true,
        data: {
          user: userWithRole.toSafeObject
            ? userWithRole.toSafeObject()
            : userWithRole
        }
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера'
      });
    }
  },

  // Обновление профиля
  updateProfile: async (req, res) => {
    try {
      const { name, email } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Пользователь с таким email уже существует'
          });
        }
      }

      await user.update({ name, email });

      const updatedUser = await User.findByPk(userId, {
        include: [{ model: Role, as: 'role' }],
        attributes: { exclude: ['password_hash'] }
      });

      res.json({
        success: true,
        message: 'Профиль успешно обновлен',
        data: {
          user: updatedUser.toSafeObject
            ? updatedUser.toSafeObject()
            : updatedUser
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера при обновлении профиля'
      });
    }
  },

  // Смена пароля
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Текущий и новый пароль обязательны'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      const isCurrentPasswordValid = await user.checkPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Текущий пароль неверен'
        });
      }

      const password_hash = await bcrypt.hash(newPassword, 12);
      user.password_hash = password_hash;
      await user.save();

      res.json({
        success: true,
        message: 'Пароль успешно изменен'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка сервера при смене пароля'
      });
    }
  }
};

module.exports = authController;
