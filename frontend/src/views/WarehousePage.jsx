import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [receiveForm, setReceiveForm] = useState({
    warehouse_id: '',
    supplier_id: '',
    product_id: '',
    quantity: '',
    unit_price: ''
  });
  const [receiveError, setReceiveError] = useState('');
  const [receiveSuccess, setReceiveSuccess] = useState('');

  const [stockWarehouseId, setStockWarehouseId] = useState('');
  const [stockRows, setStockRows] = useState([]);

  const loadWarehouses = async () => {
    try {
      const res = await apiClient.get('/api/warehouses?page=1&limit=100');
      setWarehouses(res.data?.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await apiClient.get('/api/suppliers?page=1&limit=100');
      setSuppliers(res.data?.items || []);
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

  useEffect(() => {
    loadWarehouses();
    loadSuppliers();
    loadProducts();
  }, []);

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    setReceiveError('');
    setReceiveSuccess('');

    const { warehouse_id, supplier_id, product_id, quantity, unit_price } =
      receiveForm;

    if (!warehouse_id || !supplier_id || !product_id || !quantity) {
      setReceiveError(
        'Заполните склад, поставщика, товар и количество'
      );
      return;
    }

    try {
      await apiClient.post('/api/warehouse/receive', {
        warehouse_id: Number(warehouse_id),
        supplier_id: Number(supplier_id),
        lines: [
          {
            product_id: Number(product_id),
            quantity: Number(quantity),
            unit_price: unit_price ? Number(unit_price) : null
          }
        ]
      });

      setReceiveForm({
        warehouse_id: '',
        supplier_id: '',
        product_id: '',
        quantity: '',
        unit_price: ''
      });
      setReceiveSuccess('Приёмка успешно проведена');
    } catch (err) {
      setReceiveError(err.message || 'Ошибка при приёмке');
    }
  };

  const handleStockLoad = async (e) => {
    e.preventDefault();
    if (!stockWarehouseId) return;
    try {
      const res = await apiClient.get(
        `/api/warehouse/stock?warehouse_id=${stockWarehouseId}`
      );
      const balances = res.data || [];
      setStockRows(Array.isArray(balances) ? balances : []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section>
      <h2>Складские операции</h2>
      <div className="grid-2">
        <div className="panel">
          <h3>Приёмка товара</h3>
          <form className="form" onSubmit={handleReceiveSubmit}>
            <div className="form-group">
              <label>Склад</label>
              <select
                value={receiveForm.warehouse_id}
                onChange={(e) =>
                  setReceiveForm({
                    ...receiveForm,
                    warehouse_id: e.target.value
                  })
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
              <label>Поставщик</label>
              <select
                value={receiveForm.supplier_id}
                onChange={(e) =>
                  setReceiveForm({
                    ...receiveForm,
                    supplier_id: e.target.value
                  })
                }
              >
                <option value="">Выберите поставщика</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Товар</label>
              <select
                value={receiveForm.product_id}
                onChange={(e) =>
                  setReceiveForm({
                    ...receiveForm,
                    product_id: e.target.value
                  })
                }
              >
                <option value="">Выберите товар</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Количество</label>
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={receiveForm.quantity}
                onChange={(e) =>
                  setReceiveForm({
                    ...receiveForm,
                    quantity: e.target.value
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Цена</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={receiveForm.unit_price}
                onChange={(e) =>
                  setReceiveForm({
                    ...receiveForm,
                    unit_price: e.target.value
                  })
                }
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full">
              Провести приёмку
            </button>
            {receiveError && <p className="form-error">{receiveError}</p>}
            {receiveSuccess && (
              <p className="form-success">{receiveSuccess}</p>
            )}
          </form>
        </div>

        <div className="panel">
          <h3>Остатки по складу</h3>
          <form className="form-inline" onSubmit={handleStockLoad}>
            <select
              value={stockWarehouseId}
              onChange={(e) => setStockWarehouseId(e.target.value)}
            >
              <option value="">Выберите склад</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary">
              Показать
            </button>
          </form>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Товар ID</th>
                  <th>Физический</th>
                  <th>Резерв</th>
                  <th>Доступно</th>
                </tr>
              </thead>
              <tbody>
                {stockRows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.product_id}</td>
                    <td>{r.physical}</td>
                    <td>{r.reserved}</td>
                    <td>{r.available}</td>
                  </tr>
                ))}
                {!stockRows.length && (
                  <tr>
                    <td colSpan="4">Нет данных по остаткам</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WarehousePage;
