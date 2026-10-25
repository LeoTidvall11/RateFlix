import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as api from 'services/api';

const AuthContext = createContext();
const TOKEN_KEY = 'user_auth_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = async () => {
    api.setAuthToken(null);
    setUser(null);
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Kunde inte ta bort token:', error);
    }
  };

  useEffect(() => {
    api.setUnauthorizedHandler(clearSession);
    return () => api.setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!storedToken) return;

        api.setAuthToken(storedToken);
        const me = await api.getCurrentUser();
        setUser({ ...me, token: storedToken });
      } catch (error) {
        console.error('Kunde inte hämta inloggad användare:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  const startSession = async ({ token, user: userData }) => {
    api.setAuthToken(token);
    setUser({ ...userData, token });
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Kunde inte spara token:', error);
    }
  };

  const login = async (email, password) => {
    await startSession(await api.login(email.trim(), password));
  };

  const register = async (name, email, password) => {
    await startSession(await api.register(name.trim(), email.trim(), password));
  };

  const logout = clearSession;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
