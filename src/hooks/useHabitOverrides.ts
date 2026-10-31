import { useQuery } from '@tanstack/react-query'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'
import type { HabitOverride } from '@/types/habit'

export function useHabitOverrides(date: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['habitOverrides', user?.uid, date],
    enabled: !!user && !!date,
    queryFn: async () => {
      const q = query(
        collection(db, 'users', user!.uid, 'habitOverrides'),
        where('date', '==', date),
      )
      const snap = await getDocs(q)
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as HabitOverride))
    },
  })
}
