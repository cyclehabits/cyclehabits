import { useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, setDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'

export function useDeleteHabitDay() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      if (!user) throw new Error('Não autenticado')
      const overrideId = `${habitId}_${date}`
      await setDoc(
        doc(collection(db, 'users', user.uid, 'habitOverrides'), overrideId),
        { habitId, date, deleted: true },
      )
    },
    onSuccess: (_data, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['habitOverrides', user?.uid, date] })
    },
  })
}
