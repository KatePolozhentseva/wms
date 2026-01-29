const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Warehouse = sequelize.define('Warehouse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'warehouses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Warehouse.associate = (models) => {
  Warehouse.hasMany(models.Order, {
    foreignKey: 'warehouse_id',
    as: 'orders'
  });

  Warehouse.hasMany(models.StockMovement, {
    foreignKey: 'warehouse_id',
    as: 'stock_movements'
  });
};

module.exports = Warehouse;
