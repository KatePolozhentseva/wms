// src/services/stockService.js
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

const StockService = {
  /**
   * Текущие остатки по конкретному товару и складу
   */
  getStockForProductWarehouse: async (productId, warehouseId) => {
    const movements = await StockMovement.findAll({
      where: {
        product_id: productId,
        warehouse_id: warehouseId
      }
    });

    let physical = 0; // фактический остаток
    let reserved = 0; // в резерве

    for (const m of movements) {
      const q = Number(m.quantity);
      switch (m.type) {
        case 'IN':
          physical += q;
          break;
        case 'OUT':
          physical -= q;
          break;
        case 'ADJUSTMENT':
          physical += q; // q может быть +/-
          break;
        case 'RESERVATION':
          reserved += q;
          break;
        case 'RELEASE':
          reserved -= q;
          break;
      }
    }

    const available = physical - reserved;

    return {
      physical,
      reserved,
      available
    };
  },

  /**
   * Приемка товаров на склад
   * payload:
   * {
   *   warehouse_id,
   *   supplier_id,
   *   occurred_at?,
   *   lines: [{ product_id, quantity, unit_price?, expiration_date? }]
   * }
   */
  receiveGoods: async (payload, userId) => {
    const { warehouse_id, supplier_id, occurred_at, lines } = payload;

    if (!warehouse_id || !Array.isArray(lines) || lines.length === 0) {
      throw new Error('Склад и позиции обязательны для приемки');
    }

    // Проверим склад и товары
    const warehouse = await Warehouse.findByPk(warehouse_id);
    if (!warehouse) {
      throw new Error('Склад не найден');
    }

    // TODO: при желании можно проверить supplier_id на существование
    const movementsToCreate = [];

    for (const line of lines) {
      const { product_id, quantity, unit_price, expiration_date } = line;

      if (!product_id || !quantity || Number(quantity) <= 0) {
        throw new Error('Неверные данные позиции при приемке');
      }

      const product = await Product.findByPk(product_id);
      if (!product) {
        throw new Error(`Товар с id=${product_id} не найден`);
      }

      movementsToCreate.push({
        product_id,
        warehouse_id,
        type: 'IN',
        quantity,
        unit_price: unit_price || null,
        expiration_date: expiration_date || null,
        supplier_id: supplier_id || null,
        occurred_at: occurred_at || new Date(),
        document_type: 'RECEIPT',
        document_id: null,
        created_by_id: userId,
        reason: null
      });
    }

    const created = await StockMovement.bulkCreate(movementsToCreate);
    return created;
  },

  /**
   * Списание товаров со склада (FIFO/LIFO логика здесь только как параметр, цена может считаться позже)
   * payload:
   * {
   *   warehouse_id,
   *   method: 'FIFO' | 'LIFO',
   *   reason,
   *   lines: [{ product_id, quantity }]
   * }
   */
  writeOffGoods: async (payload, userId) => {
    const { warehouse_id, method, reason, lines } = payload;

    if (!warehouse_id || !Array.isArray(lines) || lines.length === 0) {
      throw new Error('Склад и позиции обязательны для списания');
    }

    if (!['FIFO', 'LIFO'].includes(method)) {
      throw new Error('Неверный метод списания (ожидается FIFO или LIFO)');
    }

    const warehouse = await Warehouse.findByPk(warehouse_id);
    if (!warehouse) {
      throw new Error('Склад не найден');
    }

    const movementsToCreate = [];

    for (const line of lines) {
      const { product_id, quantity } = line;

      if (!product_id || !quantity || Number(quantity) <= 0) {
        throw new Error('Неверные данные позиции при списании');
      }

      const product = await Product.findByPk(product_id);
      if (!product) {
        throw new Error(`Товар с id=${product_id} не найден`);
      }

      const stock = await StockService.getStockForProductWarehouse(
        product_id,
        warehouse_id
      );

      if (stock.available < Number(quantity)) {
        throw new Error(
          `Недостаточно доступного остатка для товара id=${product_id}. Доступно: ${stock.available}, требуется: ${quantity}`
        );
      }

      // Здесь можно реализовать реальный расчёт себестоимости по FIFO/LIFO,
      // но для учебного проекта достаточно зафиксировать факт списания.
      movementsToCreate.push({
        product_id,
        warehouse_id,
        type: 'OUT',
        quantity,
        unit_price: null, // Можем добавить расчет позже
        expiration_date: null,
        supplier_id: null,
        occurred_at: new Date(),
        document_type: `WRITE_OFF_${method}`,
        document_id: null,
        created_by_id: userId,
        reason: reason || null
      });
    }

    const created = await StockMovement.bulkCreate(movementsToCreate);
    return created;
  },

  /**
   * Резервирование товара под заказ
   * payload:
   * {
   *   warehouse_id,
   *   order_id,
   *   lines: [{ product_id, quantity }]
   * }
   */
  reserveGoods: async (payload, userId) => {
    const { warehouse_id, order_id, lines } = payload;

    if (!warehouse_id || !Array.isArray(lines) || lines.length === 0) {
      throw new Error('Склад и позиции обязательны для резервирования');
    }

    const warehouse = await Warehouse.findByPk(warehouse_id);
    if (!warehouse) {
      throw new Error('Склад не найден');
    }

    const movementsToCreate = [];

    for (const line of lines) {
      const { product_id, quantity } = line;

      if (!product_id || !quantity || Number(quantity) <= 0) {
        throw new Error('Неверные данные позиции при резервировании');
      }

      const product = await Product.findByPk(product_id);
      if (!product) {
        throw new Error(`Товар с id=${product_id} не найден`);
      }

      const stock = await StockService.getStockForProductWarehouse(
        product_id,
        warehouse_id
      );

      if (stock.available < Number(quantity)) {
        throw new Error(
          `Недостаточно доступного остатка для резервирования товара id=${product_id}. Доступно: ${stock.available}, требуется: ${quantity}`
        );
      }

      movementsToCreate.push({
        product_id,
        warehouse_id,
        type: 'RESERVATION',
        quantity,
        unit_price: null,
        expiration_date: null,
        supplier_id: null,
        occurred_at: new Date(),
        document_type: 'ORDER',
        document_id: order_id || null,
        created_by_id: userId,
        reason: null
      });
    }

    const created = await StockMovement.bulkCreate(movementsToCreate);
    return created;
  },

  /**
   * Снятие резерва
   * payload:
   * {
   *   warehouse_id,
   *   order_id,
   *   lines: [{ product_id, quantity }]
   * }
   */
  releaseReservation: async (payload, userId) => {
    const { warehouse_id, order_id, lines } = payload;

    if (!warehouse_id || !Array.isArray(lines) || lines.length === 0) {
      throw new Error('Склад и позиции обязательны для снятия резерва');
    }

    const movementsToCreate = [];

    for (const line of lines) {
      const { product_id, quantity } = line;

      if (!product_id || !quantity || Number(quantity) <= 0) {
        throw new Error('Неверные данные позиции при снятии резерва');
      }

      // Проверять "сколько в резерве" можно по необходимости,
      // по аналогии с getStockForProductWarehouse (reserved)

      movementsToCreate.push({
        product_id,
        warehouse_id,
        type: 'RELEASE',
        quantity,
        unit_price: null,
        expiration_date: null,
        supplier_id: null,
        occurred_at: new Date(),
        document_type: 'ORDER',
        document_id: order_id || null,
        created_by_id: userId,
        reason: null
      });
    }

    const created = await StockMovement.bulkCreate(movementsToCreate);
    return created;
  },

  /**
   * Инвентаризация:
   * payload: {
   *   warehouse_id,
   *   lines: [{ product_id, counted_quantity }]
   * }
   * Создаём ADJUSTMENT движения для выравнивания.
   */
  inventory: async (payload, userId) => {
    const { warehouse_id, lines } = payload;

    if (!warehouse_id || !Array.isArray(lines) || lines.length === 0) {
      throw new Error('Склад и позиции обязательны для инвентаризации');
    }

    const adjustments = [];

    for (const line of lines) {
      const { product_id, counted_quantity } = line;

      if (product_id == null || counted_quantity == null) {
        throw new Error('Неверные данные позиции при инвентаризации');
      }

      const stock = await StockService.getStockForProductWarehouse(
        product_id,
        warehouse_id
      );

      const diff = Number(counted_quantity) - stock.physical;

      if (diff === 0) continue; // ничего не корректируем

      adjustments.push({
        product_id,
        warehouse_id,
        type: 'ADJUSTMENT',
        quantity: diff, // может быть + или -
        unit_price: null,
        expiration_date: null,
        supplier_id: null,
        occurred_at: new Date(),
        document_type: 'INVENTORY',
        document_id: null,
        created_by_id: userId,
        reason: 'Инвентаризация'
      });
    }

    if (adjustments.length === 0) {
      return [];
    }

    const created = await StockMovement.bulkCreate(adjustments);
    return created;
  },

  /**
   * Текущие остатки по всем (или по фильтрам)
   * params: { warehouse_id?, product_id? }
   */
  getCurrentBalances: async (params = {}) => {
    const { warehouse_id, product_id } = params;

    const where = {};
    if (warehouse_id) where.warehouse_id = warehouse_id;
    if (product_id) where.product_id = product_id;

    const rows = await StockMovement.findAll({
      where,
      attributes: ['product_id', 'warehouse_id', 'type', 'quantity']
    });

    // Группируем в JS (для простоты)
    const map = new Map();

    for (const row of rows) {
      const key = `${row.product_id}_${row.warehouse_id}`;
      if (!map.has(key)) {
        map.set(key, {
          product_id: row.product_id,
          warehouse_id: row.warehouse_id,
          physical: 0,
          reserved: 0
        });
      }

      const entry = map.get(key);
      const q = Number(row.quantity);

      switch (row.type) {
        case 'IN':
          entry.physical += q;
          break;
        case 'OUT':
          entry.physical -= q;
          break;
        case 'ADJUSTMENT':
          entry.physical += q;
          break;
        case 'RESERVATION':
          entry.reserved += q;
          break;
        case 'RELEASE':
          entry.reserved -= q;
          break;
      }
    }

    return Array.from(map.values()).map((e) => ({
      ...e,
      available: e.physical - e.reserved
    }));
  }
};

module.exports = StockService;
