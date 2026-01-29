// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const initRoles = require('./src/scripts/initRoles');

// важно: инициализация моделей и ассоциаций
require('./src/models');

const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const warehouseRoutes = require('./src/routes/warehouseRoutes');
const warehouseCrudRoutes = require('./src/routes/warehouseCrudRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const orderRoutes = require('./src/routes/orderRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Проверка доступности сервера
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Сервер работает
 */

// health-check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// роуты аутентификации
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseCrudRoutes);   // справочник складов (CRUD)
app.use('/api/suppliers', supplierRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// обработка 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден'
  });
});

// старт сервера
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({alter: true}); 

    await initRoles();

app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
