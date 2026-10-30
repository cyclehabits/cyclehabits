import { useEffect } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'
import type { HabitLog, HabitStatus } from '@/types/habit'

export function useHabitsLog(date: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const key = ['logs', user?.uid, date]

  useEffect(() => {
    if (!user) return

    const ref = collection(db, 'users', user.uid, 'logs', date, 'entries')

    const unsubscribe = onSnapshot(ref, snapshot => {
      const logs: Record<string, HabitLog> = {}
      snapshot.docs.forEach(doc => {
        logs[doc.id] = doc.data() as HabitLog
      })
      queryClient.setQueryData(key, logs)
    })

    return unsubscribe
  }, [user?.uid, date])

  const { mutate: updateLog } = useMutation({
    mutationFn: async ({ habitId, status }: { habitId: string; status: HabitStatus }) => {
      if (!user) return
      const ref = doc(db, 'users', user.uid, 'logs', date, 'entries', habitId)
      await setDoc(ref, {
        habitId,
        date,
        status,
        ...(status === 'done' ? { completedAt: new Date().toISOString() } : {}),
      }, { merge: true })
    },
    onMutate: async ({ habitId, status }) => {
      // optimistic update
      queryClient.setQueryData<Record<string, HabitLog>>(key, prev => ({
        ...prev,
        [habitId]: {
          habitId,
          date,
          status,
        },
      }))
    },
  })

  const logs = queryClient.getQueryData<Record<string, HabitLog>>(key) ?? {}

  return { logs, updateLog }
}