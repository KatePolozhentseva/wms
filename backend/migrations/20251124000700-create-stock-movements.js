'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stock_movements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      warehouse_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'warehouses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      type: {
        type: Sequelize.ENUM('IN', 'OUT', 'RESERVATION', 'RELEASE', 'ADJUSTMENT'),
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(18, 3),
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: true
      },
      expiration_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      document_type: {
        type: Sequelize.STRING(50), 
        allowNull: true
      },
      document_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      occurred_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      created_by_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'SET NULL',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('stock_movements', ['product_id', 'warehouse_id']);
    await queryInterface.addIndex('stock_movements', ['type']);
    await queryInterface.addIndex('stock_movements', ['occurred_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stock_movements');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_stock_movements_type";');
  }
};
