import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { useAuth } from '@/contexts/auth/useAuth'
import { updateUserProfile } from '@/lib/firestore/profile'
import type { UserProfile } from '@/types/profile'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    const unsub = onSnapshot(doc(db, 'profiles', user.uid), snap => {
      setProfile(snap.exists() ? (snap.data() as UserProfile) : null)
      setLoading(false)
    })
    return unsub
  }, [user])

  const updateProfile = (data: Partial<Pick<UserProfile, 'displayName' | 'photoURL'>>) => {
    if (!user) return Promise.resolve()
    return updateUserProfile(user.uid, data)
  }

  return { profile, loading, updateProfile }
}
