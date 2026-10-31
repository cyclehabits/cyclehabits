import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth/useAuth'
import { useHabitsLoading } from '@/contexts/habits/HabitsContext'
import type { Habit } from '@/types/habit'

export function useHabits() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const loading = useHabitsLoading()

  const habits = queryClient.getQueryData<Habit[]>(['habits', user?.uid]) ?? []

  return { habits, loading }
}
