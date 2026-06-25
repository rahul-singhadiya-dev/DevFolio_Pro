// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { setClientToken, registerAuthCallbacks } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    setClientToken(null);
    localStorage.removeItem('devfolio_token');
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('devfolio_token');
      if (savedToken) {
        setClientToken(savedToken);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        try {
          const response = await axios.get(`${apiUrl}/auth/verify`, {
            headers: {
              Authorization: `Bearer ${savedToken}`
            }
          });
          if (response.data && response.data.success) {
            setToken(savedToken);
            setUser({ email: response.data.data.email });
          } else {
            localStorage.removeItem('devfolio_token');
            setClientToken(null);
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('devfolio_token');
          setClientToken(null);
        }
      }
      setLoading(false);
    };

    // Register the unauthorized (401) callback to clear authentication details
    registerAuthCallbacks({
      onUnauthorized: () => {
        logout();
      },
    });

    initAuth();
  }, []);

  const login = async (email, password) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const response = await axios.post(`${apiUrl}/auth/login`, { email, password });
      if (response.data && response.data.success) {
        const jwtToken = response.data.data.token;
        setToken(jwtToken);
        setUser({ email });
        setClientToken(jwtToken);
        localStorage.setItem('devfolio_token', jwtToken);
        return { success: true };
      } else {
        return { success: false, message: response.data.message || 'Login failed.' };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
