import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'
import type { Habit } from '@/types/habit'

export function useHabits() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const key = ['habits', user?.uid]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'users', user.uid, 'habits'),
      where('archivedAt', '==', null),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const habits = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Habit),
        )
        queryClient.setQueryData(key, habits)
        setLoading(false)
      },
      (error) => {
        console.error('useHabits error:', error)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [user?.uid])

  const habits = queryClient.getQueryData<Habit[]>(key) ?? []
  return { habits, loading }
}