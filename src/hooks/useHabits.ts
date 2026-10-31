import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth/useAuth'
import { useHabitsLoading } from '@/contexts/habits/HabitsContext'
import type { Habit } from '@/types/habit'

// queryFn nunca é chamada (enabled: false).
// O HabitsProvider popula o cache via setQueryData e
// useQuery observa as mudanças, re-renderizando quando chegam dados novos.
const noop = (): Promise<Habit[]> => Promise.resolve([])

export function useHabits() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const loading = useHabitsLoading()

  const { data: habits = [] } = useQuery<Habit[]>({
    queryKey: ['habits', user?.uid],
    queryFn: noop,
    enabled: false,
    initialData: () => queryClient.getQueryData<Habit[]>(['habits', user?.uid]),
  })

  return { habits, loading }
}
