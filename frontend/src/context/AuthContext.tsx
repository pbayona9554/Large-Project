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
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
const [user, setUser] = useState<User | null>(null);

    const logout = () => {
    // clear user state
    setUser(null);
    // remove token or session from localStorage/sessionStorage
    localStorage.removeItem("token");
    };

    return (
    <AuthContext.Provider value={{ user, setUser }}>
        {children}
    </AuthContext.Provider>
    );
}

export function useAuth() {
  return useContext(AuthContext);
}