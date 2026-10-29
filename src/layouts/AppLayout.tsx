import { useTheme } from '@/contexts/theme/useTheme'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar tema"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.25rem',
        zIndex: 50,
      }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeToggle />
      {children}
    </>
  )
}