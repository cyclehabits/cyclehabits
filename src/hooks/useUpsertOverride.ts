import { useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'

interface UpsertOverrideInput {
  habitId: string
  date: string      // YYYY-MM-DD
  name?: string
  description?: string
  time?: string
  duration?: number
}

export function useUpsertOverride() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ habitId, date, ...fields }: UpsertOverrideInput) => {
      if (!user) throw new Error('Não autenticado')
      // doc id = habitId_date para garantir upsert por ocorrência
      const overrideId = `${habitId}_${date}`
      await setDoc(
        doc(collection(db, 'users', user.uid, 'habitOverrides'), overrideId),
        { habitId, date, ...fields },
        { merge: true },
      )
    },
    onSuccess: (_data, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['habitOverrides', user?.uid, date] })
    },
  })
}
