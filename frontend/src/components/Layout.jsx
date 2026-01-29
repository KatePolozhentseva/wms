import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleName =
    (user && (user.role?.name || user.role)) || 'user';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div>
          <div className="app-logo">WMS</div>
          <div className="app-header-title">Складской учёт</div>
        </div>
        <div className="app-header-right">
          <span className="badge">{roleName}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            'nav-btn' + (isActive ? ' active' : '')
          }
        >
          Дашборд
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            'nav-btn' + (isActive ? ' active' : '')
          }
        >
          Товары
        </NavLink>
        <NavLink
          to="/warehouse"
          className={({ isActive }) =>
            'nav-btn' + (isActive ? ' active' : '')
          }
        >
          Склад
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            'nav-btn' + (isActive ? ' active' : '')
          }
        >
          Заказы
        </NavLink>
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};
