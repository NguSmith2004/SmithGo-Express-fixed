import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "sg_token";
const USER_KEY = "smithgo_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to load stored user:", error);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const login = async ({ email, password }) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    setUser(data.user);
    setToken(data.token);

    return data;
  };

  const register = async ({
    name,
    email,
    phone,
    password,
    termsAccepted,
  }) => {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        termsAccepted,
      }),
    });

    setUser(data.user);
    setToken(data.token);

    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};

export default AuthContext;