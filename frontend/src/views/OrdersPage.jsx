import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

const OrdersPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({
    warehouse_id: '',
    customer_name: '',
    product_id: '',
    quantity: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadWarehouses = async () => {
    try {
      const res = await apiClient.get('/api/warehouses?page=1&limit=100');
      setWarehouses(res.data?.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await apiClient.get('/api/products?page=1&limit=100');
      setProducts(res.data?.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const params = new URLSearchParams({ page: 1, limit: 50 });
      if (statusFilter) params.set('status', statusFilter);
      const res = await apiClient.get(`/api/orders?${params.toString()}`);
      setOrders(res.data?.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadWarehouses();
    loadProducts();
    loadOrders();
  }, []);

  useEffect(() => {
    loadOrders();

  }, [statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { warehouse_id, customer_name, product_id, quantity } = form;

    if (!warehouse_id || !product_id || !quantity) {
      setError('Заполните склад, товар и количество');
      return;
    }

    try {
      await apiClient.post('/api/orders', {
        warehouse_id: Number(warehouse_id),
        customer_name: customer_name || null,
        items: [
          {
            product_id: Number(product_id),
            quantity: Number(quantity)
          }
        ]
      });

      setForm({
        warehouse_id: '',
        customer_name: '',
        product_id: '',
        quantity: ''
      });
      setSuccess('Заказ создан и товары зарезервированы');
      await loadOrders();
    } catch (err) {
      setError(err.message || 'Ошибка при создании заказа');
    }
  };

  const changeStatus = async (orderId, status) => {
    try {
      const body = { status };
      if (status === 'completed') {
        body.method = 'FIFO';
      }
      await apiClient.patch(`/api/orders/${orderId}/status`, body);
      await loadOrders();
    } catch (err) {
      alert(err.message || 'Ошибка при смене статуса заказа');
    }
  };

  return (
    <section>
      <h2>Заказы</h2>

      <div className="panel">
        <h3>Создание заказа</h3>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Склад</label>
            <select
              value={form.warehouse_id}
              onChange={(e) =>
                setForm({ ...form, warehouse_id: e.target.value })
              }
            >
              <option value="">Выберите склад</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Клиент</label>
            <input
              placeholder="Наименование клиента"
              value={form.customer_name}
              onChange={(e) =>
                setForm({ ...form, customer_name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Позиция заказа</label>
            <div className="form-inline">
              <select
                value={form.product_id}
                onChange={(e) =>
                  setForm({ ...form, product_id: e.target.value })
                }
              >
                <option value="">Выберите товар</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0.001"
                step="0.001"
                placeholder="Кол-во"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Создать заказ
          </button>
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
        </form>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Список заказов</h3>
          <select
            className="input-small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Все статусы</option>
            <option value="pending">pending</option>
            <option value="reserved">reserved</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>№ заказа</th>
                <th>Статус</th>
                <th>Клиент</th>
                <th>Склад</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{o.status}</td>
                  <td>{o.customer_name || '—'}</td>
                  <td>{o.warehouse ? o.warehouse.name : '—'}</td>
                  <td>
                    {o.status === 'reserved' ? (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => changeStatus(o.id, 'completed')}
                        >
                          Завершить
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => changeStatus(o.id, 'cancelled')}
                        >
                          Отменить
                        </button>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
              {!orders.length && (
                <tr>
                  <td colSpan="5">Заказов нет</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default OrdersPage;
