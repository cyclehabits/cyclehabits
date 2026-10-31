import { useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'
import type { Frequency, HabitCategory } from '@/types/habit'

interface CreateHabitInput {
  name: string
  description?: string
  frequency: Frequency
  startTime?: string
  endTime?: string
  expiresAt?: string
  category?: HabitCategory
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>
}

export function useCreateHabit() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateHabitInput) => {
      if (!user) throw new Error('Não autenticado')
      await addDoc(collection(db, 'users', user.uid, 'habits'), {
        ...stripUndefined(input),
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
