// tests/orderService.test.js
const OrderService = require('../src/services/orderService');
const Warehouse = require('../src/models/Warehouse');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const OrderItem = require('../src/models/OrderItem');
const OrderStatusHistory = require('../src/models/OrderStatusHistory');
const StockService = require('../src/services/stockService');

describe('OrderService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createOrder бросает ошибку, если нет склада или позиций', async () => {
    await expect(
      OrderService.createOrder({}, 1)
    ).rejects.toThrow('Склад и позиции заказа обязательны');

    await expect(
      OrderService.createOrder({ warehouse_id: 1, items: [] }, 1)
    ).rejects.toThrow('Склад и позиции заказа обязательны');
  });

  test('createOrder бросает ошибку, если склад не найден', async () => {
    Warehouse.findByPk = jest.fn().mockResolvedValue(null);

    const payload = {
      warehouse_id: 999,
      items: [{ product_id: 1, quantity: 5 }]
    };

    await expect(
      OrderService.createOrder(payload, 1)
    ).rejects.toThrow('Склад не найден');
  });

  test('createOrder бросает ошибку, если товар не найден', async () => {
    Warehouse.findByPk = jest.fn().mockResolvedValue({ id: 1 });
    Product.findByPk = jest.fn().mockResolvedValue(null);

    const payload = {
      warehouse_id: 1,
      items: [{ product_id: 123, quantity: 5 }]
    };

    await expect(
      OrderService.createOrder(payload, 1)
    ).rejects.toThrow('Товар id=123 не найден');
  });

  test('changeStatus бросает ошибку при недопустимом статусе', async () => {
    await expect(
      OrderService.changeStatus(1, 'unknown', 1)
    ).rejects.toThrow('Недопустимый статус заказа');
  });

  test('changeStatus бросает ошибку, если заказ не найден', async () => {
    Order.findByPk = jest.fn().mockResolvedValue(null);

    await expect(
      OrderService.changeStatus(999, 'cancelled', 1)
    ).rejects.toThrow('Заказ не найден');
  });

  test('changeStatus из reserved в cancelled вызывает releaseReservation', async () => {
    const fakeOrder = {
      id: 1,
      warehouse_id: 1,
      status: 'reserved',
      items: [{ product_id: 1, quantity: 5 }],
      save: jest.fn()
    };

    Order.findByPk = jest.fn().mockResolvedValue(fakeOrder);
    OrderStatusHistory.create = jest.fn().mockResolvedValue({});
    StockService.releaseReservation = jest.fn().mockResolvedValue({});
    StockService.writeOffGoods = jest.fn().mockResolvedValue({});

    const result = await OrderService.changeStatus(1, 'cancelled', 10);

    expect(StockService.releaseReservation).toHaveBeenCalledTimes(1);
    expect(StockService.writeOffGoods).not.toHaveBeenCalled();
    expect(result.status).toBe('cancelled');
  });
});
