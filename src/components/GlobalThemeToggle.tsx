import { Sun, Moon } from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext.js';

export function GlobalThemeToggle() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <button
      onClick={toggleTheme}
      className="btn-icon"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 900,
        width: 40,
        height: 40,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
