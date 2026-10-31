import { useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, doc, setDoc, deleteField } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'

interface UpsertOverrideInput {
  habitId: string
  date: string
  name?: string
  description?: string
  startTime?: string
  endTime?: string
  deleted?: boolean
}

export function useUpsertOverride() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ habitId, date, name, description, startTime, endTime, deleted }: UpsertOverrideInput) => {
      if (!user) throw new Error('Não autenticado')
      const overrideId = `${habitId}_${date}`
      await setDoc(
        doc(collection(db, 'users', user.uid, 'habitOverrides'), overrideId),
        {
          habitId,
          date,
          name,
          description: description ?? deleteField(),
          startTime: startTime ?? deleteField(),
          endTime: endTime ?? deleteField(),
          deleted: deleted ?? deleteField(),
        },
        { merge: true },
      )
    },
    onSuccess: (_data, { date }) => {
      queryClient.invalidateQueries({ queryKey: ['habitOverrides', user?.uid, date] })
    },
  })
}
