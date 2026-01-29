
# Warehouse Management System

Учебный проект: полнофункциональное веб-приложение для автоматизации складского учёта с разделением прав доступа и REST API.

## 1. Цель 

**Цель:** показать на практике все ключевые навыки, полученные за время обучения: проектирование БД, серверная логика, безопасность, REST API и клиентский интерфейс.

---

## 2. Стек технологий

**Backend**

- Node.js, Express  
- PostgreSQL + Sequelize (миграции)  
- JWT-аутентификация, bcrypt (хэширование паролей)  
- express-validator (валидация входных данных)  
- Jest (unit-тесты)

**Frontend**

- React, React Router  
- Vite  
- CSS 

---

## 3. Функционал по ТЗ

### 3.1. Аутентификация и роли

- вход по email/паролю, выдача JWT-токена;
- роли: **admin**, **manager**, **storekeeper**;
- middleware: `authenticateToken`, `authorizeRoles(...)`.

### 3.2. Управление справочниками

- **Товары**: CRUD, уникальный SKU, категория, единица измерения, признак активности.
- **Категории**: древовидная структура, запрет удаления, если есть дочерние категории или привязанные товары.
- **Поставщики**: CRUD, запрет удаления при наличии операций приёмки.
- **Склады**: CRUD, запрет удаления при наличии движений или заказов.

### 3.3. Складские операции

- приёмка товара от поставщика с указанием количества, цены и срока годности;
- списание товара с выбором метода **FIFO/LIFO**;
- резервирование и снятие резерва под заказы;
- инвентаризация (корректировка остатков);
- получение текущих остатков: физический остаток, резерв, доступное количество.

### 3.4. Заказы

- создание заказов с автоматическим резервированием товара;
- статусы заказов: `pending`, `reserved`, `completed`, `cancelled`;
- бизнес-логика смены статусов:
  - `reserved → completed` — снятие резерва + списание со склада;
  - `reserved → cancelled` — только снятие резерва;
- история статусов хранится в отдельной таблице.

### 3.5. Формат API
**Swagger**

    http://localhost:5000/api-docs
        
**Успешный ответ**

    {
      "success": true,
      "data": { ... },
      "message": "опциональное описание операции"
    }

**Ответ с ошибкой**

    {
      "success": false,
      "message": "текст ошибки",
      "errors": [ ... ]
    }

---

## 4. Структура проекта

    warehouse-management-system/
      backend/
        src/
          controllers/     # контроллеры (HTTP-слой)
          middleware/      # JWT, роли, валидация
          models/          # модели Sequelize
          routes/          # маршруты Express
          services/        # бизнес-логика (склад, заказы и др.)
          utils/           # вспомогательные функции
        migrations/        # миграции базы данных
        tests/             # unit-тесты (Jest)
        server.js          # точка входа
        .env.example
      frontend/
        src/
          views/           # страницы (Login, Dashboard, Products, Warehouse, Orders)
          components/      # Layout, ProtectedRoute и др.
          api/             # apiClient
          context/         # AuthContext
          styles.css       # общие стили
        vite.config.js
        index.html

---

## 5. Установка и запуск
    git clone https://github.com/K4t3a/warehouse-management-system
    

### 5.1. Backend

    cd backend
    npm install

Создать базу данных в PostgreSQL (например, `wms`) и файл `.env` по образцу `.env.example`:

    PORT=5000
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=wms
    DB_USER=postgres
    DB_PASSWORD=пароль
    JWT_SECRET=секретная_строка
    JWT_EXPIRES_IN=1h

Применить миграции:

    npm run migrate

Запуск сервера:

    npm run dev

Проверка работоспособности:

    GET http://localhost:5000/health

Ожидаемый ответ:

    { "status": "ok" }

### 5.2. Frontend

    cd frontend
    npm install
    npm run dev

Фронтенд доступен по адресу: `http://localhost:5173`.

Во время разработки запросы к `"/api/..."` автоматически проксируются на backend `http://localhost:5000` (настроено в `vite.config.js`).

---

## 6. Роли и тестовые данные

При первом запуске backend инициализирует базовые роли:

- `admin`
- `manager`
- `storekeeper`

Учётная запись администратора может быть создана:

- отдельным сидером, или  
- вручную через pgAdmin / SQL.

Пример ручного добавления (пароль должен быть заранее захэширован через bcrypt):

    INSERT INTO users (email, password_hash, name, role_id)
    VALUES ('admin@warehouse.com', 'HASHED_PASSWORD', 'Администратор', 1);

В ходе разработки использовалась тестовые данные: `admin@warehouse.com / admin123`.

---

## 7. Тесты

Для backend реализованы unit-тесты на Jest для ключевых сервисов:

- расчёт складских остатков (physical / reserved / available);
- обработка приёмки;
- валидация и логика смены статусов заказов.

Запуск тестов:

    cd backend
    npm test

---

