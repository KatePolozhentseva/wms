
const StockService = require('../services/stockService');

const warehouseController = {

  getStock: async (req, res) => {
    try {
      const { warehouse_id, product_id } = req.query;

      const balances = await StockService.getCurrentBalances({
        warehouse_id,
        product_id
      });

      res.json({
        success: true,
        data: balances
      });
    } catch (error) {
      console.error('getStock error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении остатков'
      });
    }
  },

  receive: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await StockService.receiveGoods(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Приемка успешно выполнена',
        data: result
      });
    } catch (error) {
      console.error('receive error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Ошибка при приемке товара'
      });
    }
  },

  writeOff: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await StockService.writeOffGoods(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Списание успешно выполнено',
        data: result
      });
    } catch (error) {
      console.error('writeOff error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Ошибка при списании товара'
      });
    }
  },

  reserve: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await StockService.reserveGoods(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Резервирование успешно выполнено',
        data: result
      });
    } catch (error) {
      console.error('reserve error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Ошибка при резервировании товара'
      });
    }
  },

  releaseReservation: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await StockService.releaseReservation(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Резерв успешно снят',
        data: result
      });
    } catch (error) {
      console.error('releaseReservation error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Ошибка при снятии резерва'
      });
    }
  },

  inventory: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await StockService.inventory(req.body, userId);

      res.status(201).json({
        success: true,
        message:
          result.length === 0
            ? 'Инвентаризация: корректировки не требуются'
            : 'Инвентаризация выполнена, созданы корректировки',
        data: result
      });
    } catch (error) {
      console.error('inventory error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Ошибка при инвентаризации'
      });
    }
  }
};

module.exports = warehouseController;
