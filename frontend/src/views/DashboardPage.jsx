import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    products: '—',
    suppliers: '—',
    orders: '—'
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [prod, supp, ord] = await Promise.all([
          apiClient.get('/api/products?page=1&limit=1'),
          apiClient.get('/api/suppliers?page=1&limit=1'),
          apiClient.get('/api/orders?page=1&limit=1&status=reserved')
        ]);

        setStats({
          products: prod.data?.pagination?.total ?? '—',
          suppliers: supp.data?.pagination?.total ?? '—',
          orders: ord.data?.pagination?.total ?? '—'
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <section>
      <h2>Обзор</h2>
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Товаров</div>
          <div className="stat-value">{stats.products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Поставщиков</div>
          <div className="stat-value">{stats.suppliers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Заказов (reserved)</div>
          <div className="stat-value">{stats.orders}</div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
