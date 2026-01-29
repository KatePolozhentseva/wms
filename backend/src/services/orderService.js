
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const StockService = require('./stockService');

const ALLOWED_STATUSES = ['draft', 'pending', 'reserved', 'completed', 'cancelled'];

const OrderService = {

  generateOrderNumber: async () => {
    const year = new Date().getFullYear();
    const count = await Order.count(); 
    const seq = String(count + 1).padStart(6, '0');
    return `ORD-${year}-${seq}`;
  },

  createOrder: async (payload, userId) => {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Тело запроса не передано или имеет неверный формат');
    }

    const { warehouse_id, customer_name, items } = payload;

    if (!warehouse_id || !Array.isArray(items) || items.length === 0) {
      throw new Error('Склад и позиции заказа обязательны');
    }

    const warehouse = await Warehouse.findByPk(warehouse_id);
    if (!warehouse) {
      throw new Error('Склад не найден');
    }

    for (const item of items) {
      const { product_id, quantity } = item;

      if (!product_id || !quantity || Number(quantity) <= 0) {
        throw new Error('Неверные данные позиции заказа');
      }

      const product = await Product.findByPk(product_id);
      if (!product) {
        throw new Error(`Товар id=${product_id} не найден`);
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
    }

    const orderNumber = await OrderService.generateOrderNumber();

    let order;
    try {
      order = await Order.create({
        order_number: orderNumber,
        warehouse_id,
        customer_name: customer_name || null,
        status: 'pending',
        created_by_id: userId
      });

      const itemsToCreate = items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price || null,
        reserved_quantity: 0
      }));

      await OrderItem.bulkCreate(itemsToCreate);

      await StockService.reserveGoods(
        {
          warehouse_id,
          order_id: order.id,
          lines: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity
          }))
        },
        userId
      );

      const oldStatus = order.status;
      order.status = 'reserved';
      await order.save();

      await OrderStatusHistory.create({
        order_id: order.id,
        old_status: oldStatus,
        new_status: order.status,
        changed_by_id: userId,
        changed_at: new Date()
      });

      const fullOrder = await Order.findByPk(order.id, {
        include: [{ model: OrderItem, as: 'items' }]
      });

      return fullOrder;
    } catch (error) {

      if (order && order.id) {
        await OrderItem.destroy({ where: { order_id: order.id } });
        await Order.destroy({ where: { id: order.id } });
      }
      throw error;
    }
  },


  changeStatus: async (orderId, newStatus, userId, options = {}) => {
    if (!ALLOWED_STATUSES.includes(newStatus)) {
      throw new Error('Недопустимый статус заказа');
    }

    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      throw new Error('Заказ не найден');
    }

    const oldStatus = order.status;
    if (oldStatus === newStatus) {
      return order; // ничего не меняем
    }

    const lines = order.items.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity
    }));

    if (oldStatus === 'reserved' && newStatus === 'cancelled') {
      // снимаем резерв
      await StockService.releaseReservation(
        {
          warehouse_id: order.warehouse_id,
          order_id: order.id,
          lines
        },
        userId
      );
    }

    if (oldStatus === 'reserved' && newStatus === 'completed') {
      const method = options.method || 'FIFO';

      await StockService.releaseReservation(
        {
          warehouse_id: order.warehouse_id,
          order_id: order.id,
          lines
        },
        userId
      );

      await StockService.writeOffGoods(
        {
          warehouse_id: order.warehouse_id,
          method,
          reason: `Отгрузка по заказу ${order.order_number}`,
          lines
        },
        userId
      );
    }

    order.status = newStatus;
    await order.save();

    await OrderStatusHistory.create({
      order_id: order.id,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by_id: userId,
      changed_at: new Date()
    });

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: OrderStatusHistory, as: 'status_history' }
      ]
    });

    return fullOrder;
  }
};

module.exports = OrderService;
