import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { io } from 'socket.io-client';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    setTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [systemPrefersDark, setSystemPrefersDark] = useState(
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    // Fetch theme from DB
    const fetchTheme = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data.appearance) {
                setTheme(res.data.appearance as Theme);
            }
        } catch (err) {
            console.error('Failed to fetch theme settings', err);
        }
    };

    // Initial fetch and socket listener
    useEffect(() => {
        fetchTheme();
        const socket = io();
        socket.on('settings-changed', () => fetchTheme());
        return () => { socket.disconnect(); };
    }, []);

    // Listen to system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Apply theme to document element
    useEffect(() => {
        const isDark =
            theme === 'dark' ||
            (theme === 'system' && systemPrefersDark);

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme, systemPrefersDark]);

    const handleSetTheme = async (newTheme: Theme) => {
        setTheme(newTheme);
        try {
            await api.put('/settings', { appearance: newTheme });
        } catch (err) {
            console.error('Failed to save theme setting', err);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
