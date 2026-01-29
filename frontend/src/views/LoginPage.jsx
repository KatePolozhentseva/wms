// src/views/LoginPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@warehouse.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  // ПРАВИЛЬНЫЙ редирект после логина
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password); 
     
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Ошибка авторизации');
    }
  };

  return (
    <section className="centered-card">
      <div className="card">
        <h1 className="app-title">Warehouse Management</h1>
        <p className="app-subtitle">Вход в систему</p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@warehouse.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="login-password">Пароль</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Войти
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>
      </div>
    </section>
  );
};

export default LoginPage;
