import { useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'
import type { Frequency } from '@/types/habit'

interface UpdateHabitInput {
  habitId: string
  name: string
  description?: string
  frequency: Frequency
  time?: string
  duration?: number
}

export function useUpdateHabit() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ habitId, ...fields }: UpdateHabitInput) => {
      if (!user) throw new Error('Não autenticado')
      await updateDoc(doc(db, 'users', user.uid, 'habits', habitId), fields)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.uid] })
    },
  })
}
