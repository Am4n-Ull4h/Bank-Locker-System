'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

const roleToHome = {
  SUPER_ADMIN: '/admin/dashboard',
  BRANCH_MANAGER: '/manager/dashboard',
  LOCKER_OFFICER: '/officer/dashboard',
  CUSTOMER: '/customer/dashboard',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('blms_user');
      const token = localStorage.getItem('blms_token');
      if (rawUser && token) {
        setUser(JSON.parse(rawUser));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const payload = response.data?.data;
    localStorage.setItem('blms_token', payload.token);
    localStorage.setItem('blms_user', JSON.stringify(payload.user));
    setUser(payload.user);
    return payload.user;
  };

  const refreshMe = async () => {
    const response = await api.get('/auth/me');
    const currentUser = response.data?.data;
    if (currentUser) {
      localStorage.setItem('blms_user', JSON.stringify(currentUser));
      setUser(currentUser);
    }
    return currentUser;
  };

  const updateProfile = async (payload) => {
    const response = await api.put('/auth/me', payload);
    const updatedUser = response.data?.data;
    if (updatedUser) {
      localStorage.setItem('blms_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    return updatedUser;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    const payload = response.data?.data;
    if (payload?.token) localStorage.setItem('blms_token', payload.token);
    if (payload?.user) {
      localStorage.setItem('blms_user', JSON.stringify(payload.user));
      setUser(payload.user);
    }
    return payload;
  };

  const getSettings = async () => {
    const response = await api.get('/auth/settings');
    return response.data?.data || {};
  };

  const updateSettings = async (settings) => {
    const response = await api.put('/auth/settings', settings);
    return response.data?.data || {};
  };

  const logout = () => {
    localStorage.removeItem('blms_token');
    localStorage.removeItem('blms_user');
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    refreshMe,
    updateProfile,
    changePassword,
    getSettings,
    updateSettings,
    roleToHome,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
