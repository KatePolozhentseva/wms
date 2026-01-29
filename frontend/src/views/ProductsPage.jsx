import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

const ProductsPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    sku: '',
    name: '',
    unit: '',
    category_id: ''
  });
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      const res = await apiClient.get('/api/categories?page=1&limit=100');
      setCategories(res.data?.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams({ page: 1, limit: 100 });
      if (search) params.set('search', search);
      const res = await apiClient.get(`/api/products?${params.toString()}`);
      setProducts(res.data?.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.sku || !form.name || !form.unit) {
      setError('Заполните SKU, название и единицу измерения');
      return;
    }

    try {
      await apiClient.post('/api/products', {
        sku: form.sku,
        name: form.name,
        unit: form.unit,
        category_id: form.category_id || null
      });
      setForm({ sku: '', name: '', unit: '', category_id: '' });
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Ошибка при создании товара');
    }
  };

  return (
    <section>
      <div className="view-header">
        <h2>Товары</h2>
      </div>

      <div className="panel">
        <h3>Создание товара</h3>
        <form className="form form-inline" onSubmit={handleSubmit}>
          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
          <input
            placeholder="Название"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Ед. изм. (шт, кг...)"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
          <select
            value={form.category_id}
            onChange={(e) =>
              setForm({ ...form, category_id: e.target.value })
            }
          >
            <option value="">Без категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">
            Добавить
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Список товаров</h3>
          <input
            className="input-small"
            placeholder="Поиск по SKU/названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Название</th>
                <th>Ед.</th>
                <th>Категория</th>
                <th>Активен</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{p.unit}</td>
                  <td>{p.category ? p.category.name : '—'}</td>
                  <td>{p.is_active ? 'Да' : 'Нет'}</td>
                </tr>
              ))}
              {!products.length && (
                <tr>
                  <td colSpan="5">Нет товаров</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ProductsPage;
