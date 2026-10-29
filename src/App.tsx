import { AuthProvider } from '@/contexts/auth/AuthContext'
import { ThemeProvider } from '@/contexts/theme/ThemeContext'
import Router from '@/router/Router'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ThemeProvider>
  )
}