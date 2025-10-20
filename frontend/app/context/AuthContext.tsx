"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import { getSocket } from "../lib/socket";
import { api } from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}
const socket = getSocket();

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on first render
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data as User))
      .catch(() => setUser(null))
      .then(() => setLoading(false)); //work as finally
  }, []);

  //   Call this after login
  const login = async (token: string) => {
    
    localStorage.setItem("token", token);
    try {
      const res = await api.get("/auth/me");
      setUser(res.data as User);
    } catch {
      setUser(null);
    }
  };

  const logout = () => {
    if (socket && user?.id) {
      socket.emit("user_offline", user.id); // 👈 tell server I'm offline
    }
    // console.log("its a user",user);
    
    localStorage.removeItem("token");
    setUser(null);
  };
console.log("auth user is ",user);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
//
