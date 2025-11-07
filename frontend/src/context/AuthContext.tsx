// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type User = {
  name: string;
  email: string;
  role: "admin" | "student";
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
const [user, setUser] = useState<User | null>(null);

/*
  const [user, setUser] = useState<User | null>({
    name: "Test Admin",
    email: "admin@ucf.edu",
    role: "student",
  });
*/

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}