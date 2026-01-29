'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Поставщик (для приемки)
    await queryInterface.addColumn('stock_movements', 'supplier_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'suppliers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Причина (для списаний/инвентаризации и т.п.)
    await queryInterface.addColumn('stock_movements', 'reason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('stock_movements', 'supplier_id');
    await queryInterface.removeColumn('stock_movements', 'reason');
  }
};
