import { useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'

export function useArchiveHabit() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (habitId: string) => {
      if (!user) throw new Error('Não autenticado')
      await updateDoc(doc(db, 'users', user.uid, 'habits', habitId), {
        archivedAt: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits', user?.uid] })
    },
  })
}