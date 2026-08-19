import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000"}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("session_token");

const response = await axios.get(`${API}/auth/me`, {
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const login = (userData, token) => {
    const sessionToken = token || userData?.session_token;
    if (sessionToken) {
      localStorage.setItem("session_token", sessionToken);
    }
    setUser({
      ...userData,
      session_token: sessionToken,
    });
  };
  const logout = async () => {
    try {
      const token = localStorage.getItem("session_token");

await axios.post(
  `${API}/auth/logout`,
  {},
  {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

localStorage.removeItem("session_token");
setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
