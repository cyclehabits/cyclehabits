import { useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'
import type { Habit, Frequency } from '@/types/habit'

interface CreateHabitInput {
  name: string
  description?: string
  frequency: Frequency
}

export function useCreateHabit() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateHabitInput) => {
      if (!user) throw new Error('Não autenticado')
      await addDoc(collection(db, 'users', user.uid, 'habits'), {
        ...input,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        archivedAt: null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.uid] })
    },
  })
}