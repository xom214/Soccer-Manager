'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    onAuthStateChanged,
    signOut as firebaseSignOut,
    signInAnonymously
} from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext(null);

const PIN_CODE = '6688';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Load admin status from local storage
        const storedAdminStatus = localStorage.getItem('is_team_admin') === 'true';
        setIsAdmin(storedAdminStatus);

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Login with PIN
    const loginWithPIN = useCallback(async (pin) => {
        setLoading(true);
        try {
            // Always ensure we have an anonymous session for Firestore
            if (!auth.currentUser) {
                await signInAnonymously(auth);
            }

            if (pin === PIN_CODE) {
                setIsAdmin(true);
                localStorage.setItem('is_team_admin', 'true');
                return { success: true, role: 'admin' };
            } else {
                throw new Error('Mã PIN không chính xác');
            }
        } catch (err) {
            console.error('Login error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Login as Guest (Read-only)
    const loginAsGuest = useCallback(async () => {
        setLoading(true);
        try {
            if (!auth.currentUser) {
                await signInAnonymously(auth);
            }
            setIsAdmin(false);
            localStorage.setItem('is_team_admin', 'false');
            return { success: true, role: 'viewer' };
        } catch (err) {
            console.error('Guest login error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Sign out
    const signOut = useCallback(async () => {
        await firebaseSignOut(auth);
        setIsAdmin(false);
        localStorage.removeItem('is_team_admin');
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        isAdmin,
        authEnabled: true,
        loginWithPIN,
        loginAsGuest,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
