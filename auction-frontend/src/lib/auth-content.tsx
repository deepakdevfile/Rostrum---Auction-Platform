"use client";

import type { User } from "../types/models";
import { useState, useContext, createContext, type ReactNode, useEffect, } from "react";

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    setSession: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "auction_platform_session";

export function AuthProvider({ children }: { children: ReactNode }){
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if(raw) {
            try{
                const parsed = JSON.parse(raw);
                setToken(parsed.token);
                setUser(parsed.user);
            } catch {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        }
        setLoading(false);
    }, []);

    const setSession = (newToken: string, newUser: User) => {
      setToken(newToken);
      setUser(newUser);
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: newToken, user: newUser }),
      );
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        window.localStorage.removeItems(STORAGE_KEY);
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, setSession, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}