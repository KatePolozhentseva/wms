const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockMovement = sequelize.define('StockMovement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('IN', 'OUT', 'RESERVATION', 'RELEASE', 'ADJUSTMENT'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(18, 3),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true
  },
  expiration_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  document_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  document_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  occurred_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  created_by_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'stock_movements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

StockMovement.associate = (models) => {
  StockMovement.belongsTo(models.Product, {
    foreignKey: 'product_id',
    as: 'product'
  });

  StockMovement.belongsTo(models.Warehouse, {
    foreignKey: 'warehouse_id',
    as: 'warehouse'
  });

  StockMovement.belongsTo(models.User, {
    foreignKey: 'created_by_id',
    as: 'created_by'
  });

  StockMovement.belongsTo(models.Supplier, {
    foreignKey: 'supplier_id',
    as: 'supplier'
  });
};

module.exports = StockMovement;
