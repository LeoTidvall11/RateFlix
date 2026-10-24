import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();
const TOKEN_KEY = 'user_auth_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

        if (storedToken) {
          setUser({
            name: 'Användare',
            email: 'user@rateflix.com',
            token: storedToken,
          });
        }
      } catch (error) {
        console.error('Fel vid läsning av token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  const login = async (email, password) => {
    const mockToken = `mock-jwt-token-${Date.now()}`;
    const userData = {
      name: email.split('@')[0] || 'user',
      email: email || 'user@rateflix.com',
      token: mockToken,
    };

    try {
      await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
      setUser(userData);
    } catch (error) {
      console.error('Kunde inte spara token:', error);
    }
  };

  const register = async (name, email, password) => {
    const mockToken = `mock-jwt-token-${Date.now()}`;
    const userData = {
      name: name || 'Ny Användare',
      email: email || 'user@rateflix.com',
      token: mockToken,
    };

    try {
      await SecureStore.setItemAsync(TOKEN_KEY, mockToken);
      setUser(userData);
    } catch (error) {
      console.error('Kunde inte spara token:', error);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setUser(null);
    } catch (error) {
      console.error('Kunde inte ta bort token:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
