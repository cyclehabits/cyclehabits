import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'

interface HabitsContextValue {
  loading: boolean
}

const HabitsContext = createContext<HabitsContextValue>({ loading: true })

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const key = ['habits', user.uid]

    const q = query(
      collection(db, 'users', user.uid, 'habits'),
      where('archivedAt', '==', null),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const habits = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }),
        )
        queryClient.setQueryData(key, habits)
        setLoading(false)
      },
      (error) => {
        console.error('HabitsProvider error:', error)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [user?.uid])

  return (
    <HabitsContext.Provider value={{ loading }}>
      {children}
    </HabitsContext.Provider>
  )
}

export function useHabitsLoading() {
  return useContext(HabitsContext).loading
}
