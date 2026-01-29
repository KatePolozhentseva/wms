// tests/stockService.test.js
const StockService = require('../src/services/stockService');
const StockMovement = require('../src/models/StockMovement');
const Warehouse = require('../src/models/Warehouse');
const Product = require('../src/models/Product');

describe('StockService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getStockForProductWarehouse возвращает нули, если движений нет', async () => {
    StockMovement.findAll = jest.fn().mockResolvedValue([]);

    const result = await StockService.getStockForProductWarehouse(1, 1);

    expect(StockMovement.findAll).toHaveBeenCalledWith({
      where: { product_id: 1, warehouse_id: 1 }
    });
    expect(result).toEqual({
      physical: 0,
      reserved: 0,
      available: 0
    });
  });

  test('getStockForProductWarehouse корректно считает physical / reserved / available', async () => {
    StockMovement.findAll = jest.fn().mockResolvedValue([
      { type: 'IN', quantity: 100 },
      { type: 'OUT', quantity: 20 },
      { type: 'RESERVATION', quantity: 30 },
      { type: 'RELEASE', quantity: 10 },
      { type: 'ADJUSTMENT', quantity: -5 }
    ]);

    const result = await StockService.getStockForProductWarehouse(1, 1);

    // physical: 100 - 20 - 5 = 75
    // reserved: 30 - 10 = 20
    // available: 75 - 20 = 55
    expect(result.physical).toBe(75);
    expect(result.reserved).toBe(20);
    expect(result.available).toBe(55);
  });

  test('receiveGoods бросает ошибку, если склад не найден', async () => {
    Warehouse.findByPk = jest.fn().mockResolvedValue(null);

    const payload = {
      warehouse_id: 999,
      supplier_id: 1,
      lines: [{ product_id: 1, quantity: 10 }]
    };

    await expect(
      StockService.receiveGoods(payload, 1)
    ).rejects.toThrow('Склад не найден');
  });

  test('receiveGoods бросает ошибку, если товар не найден', async () => {
    Warehouse.findByPk = jest.fn().mockResolvedValue({ id: 1, name: 'Склад' });
    Product.findByPk = jest.fn().mockResolvedValue(null);

    const payload = {
      warehouse_id: 1,
      supplier_id: 1,
      lines: [{ product_id: 777, quantity: 10 }]
    };

    await expect(
      StockService.receiveGoods(payload, 1)
    ).rejects.toThrow('Товар с id=777 не найден');
  });
});
