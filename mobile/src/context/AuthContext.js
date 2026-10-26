import React, { createContext, useState, useEffect } from 'react';
import safeStorage from '../utils/storage';
import API from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredSession();
    }, []);

    const loadStoredSession = async () => {
        const startTime = Date.now();
        try {
            const storedToken = await safeStorage.getItem('token');
            const storedUser = await safeStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Verify with backend
                try {
                    const res = await API.get('/api/auth/me');
                    setUser(res.data);
                    await safeStorage.setItem('user', JSON.stringify(res.data));
                } catch (verifyErr) {
                    console.log('Session verification failed, logging out');
                    await logout();
                }
            }
        } catch (err) {
            console.error('Error loading session from storage:', err);
        } finally {
            // Keep loader active for 5 seconds (5000ms) for demonstration
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 5000 - elapsed);
            setTimeout(() => {
                setLoading(false);
            }, remaining);
        }
    };

    const login = async (email, password, selectedRole) => {
        const startTime = Date.now();
        try {
            const res = await API.post('/api/auth/login', { email, password });

            // Check role match exactly like the web React version
            if (res.data.user.role !== selectedRole) {
                throw new Error(`Access denied. Role mismatch for ${selectedRole}`);
            }

            const jwtToken = res.data.token;
            const userData = res.data.user;

            await safeStorage.setItem('token', jwtToken);
            await safeStorage.setItem('user', JSON.stringify(userData));

            // Wait 5 seconds so the user can see the loading state
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 5000 - elapsed);
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }

            setToken(jwtToken);
            setUser(userData);

            return { success: true };
        } catch (err) {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 5000 - elapsed);
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining));
            }
            const message = err.response?.data?.message || err.message || 'Authentication failed';
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await safeStorage.removeItem('token');
            await safeStorage.removeItem('user');
            setToken(null);
            setUser(null);
        } catch (err) {
            console.error('Error during logout:', err);
        }
    };

    const refreshUser = async () => {
        try {
            const res = await API.get('/api/auth/me');
            setUser(res.data);
            await safeStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            console.error('Error refreshing user:', err);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                logout,
                refreshUser,
                isAuthenticated: !!token && !!user,
                roleName: user?.roleId?.roleName || user?.role || 'User',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
