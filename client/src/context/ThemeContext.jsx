import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('rizeos-theme');
        return saved || 'system';
    });

    useEffect(() => {
        const apply = (mode) => {
            document.documentElement.setAttribute('data-theme', mode);
        };

        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            apply(mq.matches ? 'dark' : 'light');
            const handler = (e) => apply(e.matches ? 'dark' : 'light');
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        } else {
            apply(theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => {
            const next = prev === 'dark' ? 'light' : prev === 'light' ? 'dark' : 'dark';
            localStorage.setItem('rizeos-theme', next);
            return next;
        });
    };

    const setThemeMode = (mode) => {
        localStorage.setItem('rizeos-theme', mode);
        setTheme(mode);
    };

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
