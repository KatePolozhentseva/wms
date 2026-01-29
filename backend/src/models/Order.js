const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'reserved', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft'
  },
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_by_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Order.associate = (models) => {
  Order.belongsTo(models.Warehouse, {
    foreignKey: 'warehouse_id',
    as: 'warehouse'
  });

  Order.belongsTo(models.User, {
    foreignKey: 'created_by_id',
    as: 'created_by'
  });

  Order.hasMany(models.OrderItem, {
    foreignKey: 'order_id',
    as: 'items'
  });

    Order.hasMany(models.OrderStatusHistory, {
    foreignKey: 'order_id',
    as: 'status_history'
  });
};

module.exports = Order;
