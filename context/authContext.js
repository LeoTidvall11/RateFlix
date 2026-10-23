import { useContext, createContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    setUser({
      name: email.split('@')[0] || 'rateflix',
      email: email || 'user@rateflix.com',
    });
  };
  const register = (name, email, password) => {
    setUser({
      name: name || 'new user ',
      email: email || 'user@rateflix.com',
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
