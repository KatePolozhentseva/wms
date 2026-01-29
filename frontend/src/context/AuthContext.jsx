// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

function getInitialToken() {
  const raw = localStorage.getItem('token');
  if (!raw || raw === 'undefined' || raw === 'null') return null;
  return raw;
}

function getInitialUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getInitialToken);
  const [user, setUser] = useState(getInitialUser);

  const login = async (email, password) => {
    const res = await apiClient.post('/api/auth/login', { email, password });

    const token = res?.data?.token;
    const user = res?.data?.user;

    if (!token || !user) {
      throw new Error('Некорректный ответ сервера при входе');
    }

    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    apiClient.setToken(token);
  }, [token]);

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => useContext(AuthContext);
