const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Product.associate = (models) => {
  Product.belongsTo(models.Category, {
    foreignKey: 'category_id',
    as: 'category'
  });

  Product.hasMany(models.OrderItem, {
    foreignKey: 'product_id',
    as: 'order_items'
  });

  Product.hasMany(models.StockMovement, {
    foreignKey: 'product_id',
    as: 'stock_movements'
  });
};

module.exports = Product;
