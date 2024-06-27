import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Logic to check if the user is authenticated (e.g., using tokens, session storage)
    const authenticatedUser = JSON.parse(localStorage.getItem('user'));
    if (authenticatedUser) {
      setUser(authenticatedUser);
    }
  }, []);

  const login = (userData) => {
    // Example login logic
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Example logout logic
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
