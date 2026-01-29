const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  old_status: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  new_status: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  changed_by_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  changed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'order_status_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

OrderStatusHistory.associate = (models) => {
  OrderStatusHistory.belongsTo(models.Order, {
    foreignKey: 'order_id',
    as: 'order'
  });

  OrderStatusHistory.belongsTo(models.User, {
    foreignKey: 'changed_by_id',
    as: 'changed_by'
  });
};

module.exports = OrderStatusHistory;
