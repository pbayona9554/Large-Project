// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "student";
  clubsjoined?: string[];
  rsvps?: string[]; 
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  const setUser = (user: User | null, token?: string | null) => {
    setUserState(user);
    if (token) {
      setToken(token);
      localStorage.setItem("token", token);
    } else {
      setToken(null);
      localStorage.removeItem("token");
    }

    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  };

  const logout = () => {
    setUserState(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
