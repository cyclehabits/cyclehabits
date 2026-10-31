import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/auth/AuthContext'
import { ThemeProvider } from '@/contexts/theme/ThemeContext'
import { HabitsProvider } from '@/contexts/habits/HabitsContext'
import Router from '@/router/Router'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <HabitsProvider>
            <Router />
          </HabitsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
