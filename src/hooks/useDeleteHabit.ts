import { useMutation } from '@tanstack/react-query'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'

export function useDeleteHabit() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (habitId: string) => {
      if (!user) throw new Error('Não autenticado')
      await deleteDoc(doc(db, 'users', user.uid, 'habits', habitId))
    },
  })
}
