import { useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'
import type { Frequency } from '@/types/habit'

interface UpdateHabitInput {
  habitId: string
  name: string
  description?: string
  frequency: Frequency
  startTime?: string
  endTime?: string
  expiresAt?: string
}

export function useUpdateHabit() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ habitId, name, description, frequency, startTime, endTime, expiresAt }: UpdateHabitInput) => {
      if (!user) throw new Error('Não autenticado')
      await updateDoc(doc(db, 'users', user.uid, 'habits', habitId), {
        name,
        frequency,
        description: description ?? deleteField(),
        startTime: startTime ?? deleteField(),
        endTime: endTime ?? deleteField(),
        expiresAt: expiresAt ?? deleteField(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.uid] })
    },
  })
}
